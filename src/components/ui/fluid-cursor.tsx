import { useEffect, useRef } from 'react'

/*
 * WebGL Fluid Cursor Effect
 * Based on https://github.com/PavelDoGreat/WebGL-Fluid-Simulation
 * MIT License - Copyright (c) 2017 Pavel Dobryakov
 */

const SPLAT_FORCE = 6000
const SPLAT_RADIUS = 0.25
const CURL_AMOUNT = 30
const PRESSURE_ITERATIONS = 20
const DENSITY_DISSIPATION = 2.0
const VELOCITY_DISSIPATION = 0.2
const PRESSURE_VAL = 0.8
const SIM_RESOLUTION = 128
const DYE_RESOLUTION = 1024
const SPLAT_COLOR = { r: 0.94, g: 0.95, b: 0.97 }

// --- Shader Sources ---

const baseVertexShaderSource = `
  precision highp float;
  attribute vec2 aPosition;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform vec2 texelSize;
  void main () {
    vUv = aPosition * 0.5 + 0.5;
    vL = vUv - vec2(texelSize.x, 0.0);
    vR = vUv + vec2(texelSize.x, 0.0);
    vT = vUv + vec2(0.0, texelSize.y);
    vB = vUv - vec2(0.0, texelSize.y);
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`

const copyShaderSource = `
  precision mediump float;
  precision mediump sampler2D;
  varying highp vec2 vUv;
  uniform sampler2D uTexture;
  void main () {
    gl_FragColor = texture2D(uTexture, vUv);
  }
`

const clearShaderSource = `
  precision mediump float;
  precision mediump sampler2D;
  varying highp vec2 vUv;
  uniform sampler2D uTexture;
  uniform float value;
  void main () {
    gl_FragColor = value * texture2D(uTexture, vUv);
  }
`

const displayShaderSource = `
  precision highp float;
  precision highp sampler2D;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D uTexture;
  uniform vec2 texelSize;
  void main () {
    vec3 c = texture2D(uTexture, vUv).rgb;

    vec3 lc = texture2D(uTexture, vL).rgb;
    vec3 rc = texture2D(uTexture, vR).rgb;
    vec3 tc = texture2D(uTexture, vT).rgb;
    vec3 bc = texture2D(uTexture, vB).rgb;

    float dx = length(rc) - length(lc);
    float dy = length(tc) - length(bc);

    vec3 n = normalize(vec3(dx, dy, length(texelSize)));
    vec3 l = vec3(0.0, 0.0, 1.0);
    float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
    c *= diffuse;

    float intensity = max(c.r, max(c.g, c.b));
    float a = min(intensity, 1.0);
    gl_FragColor = vec4(a, a, a, a);
  }
`

const splatShaderSource = `
  precision highp float;
  precision highp sampler2D;
  varying vec2 vUv;
  uniform sampler2D uTarget;
  uniform float aspectRatio;
  uniform vec3 color;
  uniform vec2 point;
  uniform float radius;
  void main () {
    vec2 p = vUv - point.xy;
    p.x *= aspectRatio;
    vec3 splat = exp(-dot(p, p) / radius) * color;
    vec3 base = texture2D(uTarget, vUv).xyz;
    gl_FragColor = vec4(base + splat, 1.0);
  }
`

const advectionShaderSource = `
  precision highp float;
  precision highp sampler2D;
  varying vec2 vUv;
  uniform sampler2D uVelocity;
  uniform sampler2D uSource;
  uniform vec2 texelSize;
  uniform vec2 dyeTexelSize;
  uniform float dt;
  uniform float dissipation;
  vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
    vec2 st = uv / tsize - 0.5;
    vec2 iuv = floor(st);
    vec2 fuv = fract(st);
    vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
    vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
    vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
    vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
    return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
  }
  void main () {
  #ifdef MANUAL_FILTERING
    vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
    vec4 result = bilerp(uSource, coord, dyeTexelSize);
  #else
    vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
    vec4 result = texture2D(uSource, coord);
  #endif
    float decay = 1.0 + dissipation * dt;
    gl_FragColor = result / decay;
  }
`

const divergenceShaderSource = `
  precision mediump float;
  precision mediump sampler2D;
  varying highp vec2 vUv;
  varying highp vec2 vL;
  varying highp vec2 vR;
  varying highp vec2 vT;
  varying highp vec2 vB;
  uniform sampler2D uVelocity;
  void main () {
    float L = texture2D(uVelocity, vL).x;
    float R = texture2D(uVelocity, vR).x;
    float T = texture2D(uVelocity, vT).y;
    float B = texture2D(uVelocity, vB).y;
    vec2 C = texture2D(uVelocity, vUv).xy;
    if (vL.x < 0.0) { L = -C.x; }
    if (vR.x > 1.0) { R = -C.x; }
    if (vT.y > 1.0) { T = -C.y; }
    if (vB.y < 0.0) { B = -C.y; }
    float div = 0.5 * (R - L + T - B);
    gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
  }
`

const curlShaderSource = `
  precision mediump float;
  precision mediump sampler2D;
  varying highp vec2 vUv;
  varying highp vec2 vL;
  varying highp vec2 vR;
  varying highp vec2 vT;
  varying highp vec2 vB;
  uniform sampler2D uVelocity;
  void main () {
    float L = texture2D(uVelocity, vL).y;
    float R = texture2D(uVelocity, vR).y;
    float T = texture2D(uVelocity, vT).x;
    float B = texture2D(uVelocity, vB).x;
    float vorticity = R - L - T + B;
    gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
  }
`

const vorticityShaderSource = `
  precision highp float;
  precision highp sampler2D;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D uVelocity;
  uniform sampler2D uCurl;
  uniform float curl;
  uniform float dt;
  void main () {
    float L = texture2D(uCurl, vL).x;
    float R = texture2D(uCurl, vR).x;
    float T = texture2D(uCurl, vT).x;
    float B = texture2D(uCurl, vB).x;
    float C = texture2D(uCurl, vUv).x;
    vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
    force /= length(force) + 0.0001;
    force *= curl * C;
    force.y *= -1.0;
    vec2 velocity = texture2D(uVelocity, vUv).xy;
    velocity += force * dt;
    velocity = min(max(velocity, -1000.0), 1000.0);
    gl_FragColor = vec4(velocity, 0.0, 1.0);
  }
`

const pressureShaderSource = `
  precision mediump float;
  precision mediump sampler2D;
  varying highp vec2 vUv;
  varying highp vec2 vL;
  varying highp vec2 vR;
  varying highp vec2 vT;
  varying highp vec2 vB;
  uniform sampler2D uPressure;
  uniform sampler2D uDivergence;
  void main () {
    float L = texture2D(uPressure, vL).x;
    float R = texture2D(uPressure, vR).x;
    float T = texture2D(uPressure, vT).x;
    float B = texture2D(uPressure, vB).x;
    float C = texture2D(uPressure, vUv).x;
    float divergence = texture2D(uDivergence, vUv).x;
    float pressure = (L + R + B + T - divergence) * 0.25;
    gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
  }
`

const gradientSubtractShaderSource = `
  precision mediump float;
  precision mediump sampler2D;
  varying highp vec2 vUv;
  varying highp vec2 vL;
  varying highp vec2 vR;
  varying highp vec2 vT;
  varying highp vec2 vB;
  uniform sampler2D uPressure;
  uniform sampler2D uVelocity;
  void main () {
    float L = texture2D(uPressure, vL).x;
    float R = texture2D(uPressure, vR).x;
    float T = texture2D(uPressure, vT).x;
    float B = texture2D(uPressure, vB).x;
    vec2 velocity = texture2D(uVelocity, vUv).xy;
    velocity.xy -= vec2(R - L, T - B);
    gl_FragColor = vec4(velocity, 0.0, 1.0);
  }
`

// --- Component ---

export function FluidCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const pointer = {
      texcoordX: 0,
      texcoordY: 0,
      prevTexcoordX: 0,
      prevTexcoordY: 0,
      deltaX: 0,
      deltaY: 0,
      down: false,
      moved: false,
      color: SPLAT_COLOR,
    }

    const ctx = getWebGLContext(canvas)
    if (!ctx) return
    const { gl, ext } = ctx

    const isMobile = /Mobi|Android/i.test(navigator.userAgent)
    const dyeRes = isMobile ? 512 : DYE_RESOLUTION

    // Compile shaders
    const baseVertexShader = compileShader(gl.VERTEX_SHADER, baseVertexShaderSource)
    const copyShader = compileShader(gl.FRAGMENT_SHADER, copyShaderSource)
    const clearShader = compileShader(gl.FRAGMENT_SHADER, clearShaderSource)
    const displayShader = compileShader(gl.FRAGMENT_SHADER, displayShaderSource)
    const splatShader = compileShader(gl.FRAGMENT_SHADER, splatShaderSource)
    const advectionShader = compileShader(
      gl.FRAGMENT_SHADER,
      advectionShaderSource,
      ext.supportLinearFiltering ? null : ['MANUAL_FILTERING'],
    )
    const divergenceShader = compileShader(gl.FRAGMENT_SHADER, divergenceShaderSource)
    const curlShader = compileShader(gl.FRAGMENT_SHADER, curlShaderSource)
    const vorticityShader = compileShader(gl.FRAGMENT_SHADER, vorticityShaderSource)
    const pressureShader = compileShader(gl.FRAGMENT_SHADER, pressureShaderSource)
    const gradientSubtractShader = compileShader(gl.FRAGMENT_SHADER, gradientSubtractShaderSource)

    // Create programs
    const copyProgram = createProg(baseVertexShader, copyShader)
    const clearProgram = createProg(baseVertexShader, clearShader)
    const displayProgram = createProg(baseVertexShader, displayShader)
    const splatProgram = createProg(baseVertexShader, splatShader)
    const advectionProgram = createProg(baseVertexShader, advectionShader)
    const divergenceProgram = createProg(baseVertexShader, divergenceShader)
    const curlProgram = createProg(baseVertexShader, curlShader)
    const vorticityProgram = createProg(baseVertexShader, vorticityShader)
    const pressureProgram = createProg(baseVertexShader, pressureShader)
    const gradientSubtractProgram = createProg(baseVertexShader, gradientSubtractShader)

    // Blit quad
    const blit = (() => {
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer())
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW)
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
      gl.enableVertexAttribArray(0)

      return (target: FBO | null) => {
        if (target == null) {
          gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
          gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        } else {
          gl.viewport(0, 0, target.width, target.height)
          gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo)
        }
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
      }
    })()

    // Framebuffers
    interface FBO {
      texture: WebGLTexture
      fbo: WebGLFramebuffer
      width: number
      height: number
      texelSizeX: number
      texelSizeY: number
      attach: (id: number) => number
    }

    interface DoubleFBO {
      width: number
      height: number
      texelSizeX: number
      texelSizeY: number
      read: FBO
      write: FBO
      swap: () => void
    }

    let dye: DoubleFBO
    let velocity: DoubleFBO
    let divergenceFBO: FBO
    let curlFBO: FBO
    let pressure: DoubleFBO

    initFramebuffers()

    // --- Animation loop ---
    let lastUpdateTime = Date.now()
    let animFrameId = 0

    function update() {
      const dt = calcDeltaTime()
      if (resizeCanvas()) initFramebuffers()
      applyInputs()
      step(dt)
      render()
      animFrameId = requestAnimationFrame(update)
    }
    animFrameId = requestAnimationFrame(update)

    // --- Event listeners ---
    function handleMouseMove(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      if (x < 0 || x > rect.width || y < 0 || y > rect.height) {
        pointer.down = false
        return
      }
      const posX = scaleByPixelRatio(x)
      const posY = scaleByPixelRatio(y)
      if (!pointer.down) {
        pointer.down = true
        pointer.texcoordX = posX / canvas.width
        pointer.texcoordY = 1.0 - posY / canvas.height
        pointer.prevTexcoordX = pointer.texcoordX
        pointer.prevTexcoordY = pointer.texcoordY
        pointer.deltaX = 0
        pointer.deltaY = 0
        return
      }
      pointer.prevTexcoordX = pointer.texcoordX
      pointer.prevTexcoordY = pointer.texcoordY
      pointer.texcoordX = posX / canvas.width
      pointer.texcoordY = 1.0 - posY / canvas.height
      pointer.deltaX = correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX)
      pointer.deltaY = correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY)
      pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0
    }

    function handleTouchMove(e: TouchEvent) {
      const touch = e.touches[0]
      if (!touch) return
      const rect = canvas.getBoundingClientRect()
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top
      const posX = scaleByPixelRatio(x)
      const posY = scaleByPixelRatio(y)
      if (!pointer.down) {
        pointer.down = true
        pointer.texcoordX = posX / canvas.width
        pointer.texcoordY = 1.0 - posY / canvas.height
        pointer.prevTexcoordX = pointer.texcoordX
        pointer.prevTexcoordY = pointer.texcoordY
        pointer.deltaX = 0
        pointer.deltaY = 0
        return
      }
      pointer.prevTexcoordX = pointer.texcoordX
      pointer.prevTexcoordY = pointer.texcoordY
      pointer.texcoordX = posX / canvas.width
      pointer.texcoordY = 1.0 - posY / canvas.height
      pointer.deltaX = correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX)
      pointer.deltaY = correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY)
      pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0
    }

    function handleTouchEnd() {
      pointer.down = false
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('touchend', handleTouchEnd)

    // --- Helper functions ---

    function getWebGLContext(canvas: HTMLCanvasElement) {
      const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false }
      let gl = canvas.getContext('webgl2', params) as WebGL2RenderingContext | null
      const isWebGL2 = !!gl
      if (!isWebGL2) gl = (canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params)) as WebGL2RenderingContext | null
      if (!gl) return null

      let halfFloat: { HALF_FLOAT_OES: number } | null = null
      let supportLinearFiltering: unknown
      if (isWebGL2) {
        gl.getExtension('EXT_color_buffer_float')
        supportLinearFiltering = gl.getExtension('OES_texture_float_linear')
      } else {
        halfFloat = gl.getExtension('OES_texture_half_float')
        supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear')
      }

      gl.clearColor(0.0, 0.0, 0.0, 0.0)

      const halfFloatTexType = isWebGL2 ? gl.HALF_FLOAT : halfFloat!.HALF_FLOAT_OES
      let formatRGBA: { internalFormat: number; format: number } | null
      let formatRG: { internalFormat: number; format: number } | null
      let formatR: { internalFormat: number; format: number } | null

      if (isWebGL2) {
        formatRGBA = getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, halfFloatTexType)
        formatRG = getSupportedFormat(gl, gl.RG16F, gl.RG, halfFloatTexType)
        formatR = getSupportedFormat(gl, gl.R16F, gl.RED, halfFloatTexType)
      } else {
        formatRGBA = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType)
        formatRG = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType)
        formatR = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType)
      }

      return {
        gl,
        ext: { formatRGBA, formatRG, formatR, halfFloatTexType, supportLinearFiltering: !!supportLinearFiltering },
      }
    }

    function getSupportedFormat(
      gl: WebGL2RenderingContext,
      internalFormat: number,
      format: number,
      type: number,
    ): { internalFormat: number; format: number } | null {
      if (!supportRenderTextureFormat(gl, internalFormat, format, type)) {
        switch (internalFormat) {
          case gl.R16F:
            return getSupportedFormat(gl, gl.RG16F, gl.RG, type)
          case gl.RG16F:
            return getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, type)
          default:
            return null
        }
      }
      return { internalFormat, format }
    }

    function supportRenderTextureFormat(gl: WebGL2RenderingContext, internalFormat: number, format: number, type: number) {
      const texture = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null)
      const fbo = gl.createFramebuffer()
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
      const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER)
      return status === gl.FRAMEBUFFER_COMPLETE
    }

    function compileShader(type: number, source: string, keywords?: string[] | null) {
      if (keywords) {
        let prefix = ''
        keywords.forEach((k) => (prefix += '#define ' + k + '\n'))
        source = prefix + source
      }
      const shader = gl.createShader(type)!
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      return shader
    }

    function createProg(vertexShader: WebGLShader, fragmentShader: WebGLShader) {
      const program = gl.createProgram()!
      gl.attachShader(program, vertexShader)
      gl.attachShader(program, fragmentShader)
      gl.linkProgram(program)
      const uniforms: Record<string, WebGLUniformLocation> = {}
      const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)
      for (let i = 0; i < uniformCount; i++) {
        const name = gl.getActiveUniform(program, i)!.name
        uniforms[name] = gl.getUniformLocation(program, name)!
      }
      return { program, uniforms, bind: () => gl.useProgram(program) }
    }

    function createFBO(w: number, h: number, internalFormat: number, format: number, type: number, param: number): FBO {
      gl.activeTexture(gl.TEXTURE0)
      const texture = gl.createTexture()!
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null)
      const fbo = gl.createFramebuffer()!
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
      gl.viewport(0, 0, w, h)
      gl.clear(gl.COLOR_BUFFER_BIT)
      return {
        texture,
        fbo,
        width: w,
        height: h,
        texelSizeX: 1.0 / w,
        texelSizeY: 1.0 / h,
        attach(id: number) {
          gl.activeTexture(gl.TEXTURE0 + id)
          gl.bindTexture(gl.TEXTURE_2D, texture)
          return id
        },
      }
    }

    function createDoubleFBO(w: number, h: number, internalFormat: number, format: number, type: number, param: number): DoubleFBO {
      let fbo1 = createFBO(w, h, internalFormat, format, type, param)
      let fbo2 = createFBO(w, h, internalFormat, format, type, param)
      return {
        width: w,
        height: h,
        texelSizeX: fbo1.texelSizeX,
        texelSizeY: fbo1.texelSizeY,
        get read() { return fbo1 },
        set read(v) { fbo1 = v },
        get write() { return fbo2 },
        set write(v) { fbo2 = v },
        swap() { const t = fbo1; fbo1 = fbo2; fbo2 = t },
      }
    }

    function resizeFBO(target: FBO, w: number, h: number, internalFormat: number, format: number, type: number, param: number) {
      const newFBO = createFBO(w, h, internalFormat, format, type, param)
      copyProgram.bind()
      gl.uniform1i(copyProgram.uniforms.uTexture, target.attach(0))
      blit(newFBO)
      return newFBO
    }

    function resizeDoubleFBO(target: DoubleFBO, w: number, h: number, internalFormat: number, format: number, type: number, param: number) {
      if (target.width === w && target.height === h) return target
      target.read = resizeFBO(target.read, w, h, internalFormat, format, type, param)
      target.write = createFBO(w, h, internalFormat, format, type, param)
      target.width = w
      target.height = h
      target.texelSizeX = 1.0 / w
      target.texelSizeY = 1.0 / h
      return target
    }

    function initFramebuffers() {
      const simRes = getResolution(SIM_RESOLUTION)
      const dyeResObj = getResolution(dyeRes)
      const texType = ext.halfFloatTexType
      const rgba = ext.formatRGBA!
      const rg = ext.formatRG!
      const r = ext.formatR!
      const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST

      gl.disable(gl.BLEND)

      if (!dye) dye = createDoubleFBO(dyeResObj.width, dyeResObj.height, rgba.internalFormat, rgba.format, texType, filtering)
      else dye = resizeDoubleFBO(dye, dyeResObj.width, dyeResObj.height, rgba.internalFormat, rgba.format, texType, filtering)

      if (!velocity) velocity = createDoubleFBO(simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering)
      else velocity = resizeDoubleFBO(velocity, simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering)

      divergenceFBO = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST)
      curlFBO = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST)
      pressure = createDoubleFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST)
    }

    function calcDeltaTime() {
      const now = Date.now()
      let dt = (now - lastUpdateTime) / 1000
      dt = Math.min(dt, 0.016666)
      lastUpdateTime = now
      return dt
    }

    function resizeCanvas() {
      const w = scaleByPixelRatio(canvas.clientWidth)
      const h = scaleByPixelRatio(canvas.clientHeight)
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        return true
      }
      return false
    }

    function applyInputs() {
      if (pointer.moved) {
        pointer.moved = false
        pointer.color = SPLAT_COLOR
        const dx = pointer.deltaX * SPLAT_FORCE
        const dy = pointer.deltaY * SPLAT_FORCE
        splat(pointer.texcoordX, pointer.texcoordY, dx, dy, pointer.color)
      }
    }

    function step(dt: number) {
      gl.disable(gl.BLEND)

      curlProgram.bind()
      gl.uniform2f(curlProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
      gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0))
      blit(curlFBO)

      vorticityProgram.bind()
      gl.uniform2f(vorticityProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
      gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0))
      gl.uniform1i(vorticityProgram.uniforms.uCurl, curlFBO.attach(1))
      gl.uniform1f(vorticityProgram.uniforms.curl, CURL_AMOUNT)
      gl.uniform1f(vorticityProgram.uniforms.dt, dt)
      blit(velocity.write)
      velocity.swap()

      divergenceProgram.bind()
      gl.uniform2f(divergenceProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
      gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0))
      blit(divergenceFBO)

      clearProgram.bind()
      gl.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0))
      gl.uniform1f(clearProgram.uniforms.value, PRESSURE_VAL)
      blit(pressure.write)
      pressure.swap()

      pressureProgram.bind()
      gl.uniform2f(pressureProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
      gl.uniform1i(pressureProgram.uniforms.uDivergence, divergenceFBO.attach(0))
      for (let i = 0; i < PRESSURE_ITERATIONS; i++) {
        gl.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1))
        blit(pressure.write)
        pressure.swap()
      }

      gradientSubtractProgram.bind()
      gl.uniform2f(gradientSubtractProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
      gl.uniform1i(gradientSubtractProgram.uniforms.uPressure, pressure.read.attach(0))
      gl.uniform1i(gradientSubtractProgram.uniforms.uVelocity, velocity.read.attach(1))
      blit(velocity.write)
      velocity.swap()

      advectionProgram.bind()
      gl.uniform2f(advectionProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
      if (!ext.supportLinearFiltering)
        gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY)
      const velocityId = velocity.read.attach(0)
      gl.uniform1i(advectionProgram.uniforms.uVelocity, velocityId)
      gl.uniform1i(advectionProgram.uniforms.uSource, velocityId)
      gl.uniform1f(advectionProgram.uniforms.dt, dt)
      gl.uniform1f(advectionProgram.uniforms.dissipation, VELOCITY_DISSIPATION)
      blit(velocity.write)
      velocity.swap()

      if (!ext.supportLinearFiltering)
        gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY)
      gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0))
      gl.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1))
      gl.uniform1f(advectionProgram.uniforms.dissipation, DENSITY_DISSIPATION)
      blit(dye.write)
      dye.swap()
    }

    function render() {
      gl.disable(gl.BLEND)
      displayProgram.bind()
      gl.uniform2f(displayProgram.uniforms.texelSize, 1.0 / gl.drawingBufferWidth, 1.0 / gl.drawingBufferHeight)
      gl.uniform1i(displayProgram.uniforms.uTexture, dye.read.attach(0))
      blit(null)
    }

    function splat(x: number, y: number, dx: number, dy: number, color: { r: number; g: number; b: number }) {
      splatProgram.bind()
      gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0))
      gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width / canvas.height)
      gl.uniform2f(splatProgram.uniforms.point, x, y)
      gl.uniform3f(splatProgram.uniforms.color, dx, dy, 0.0)
      gl.uniform1f(splatProgram.uniforms.radius, correctRadius(SPLAT_RADIUS / 100.0))
      blit(velocity.write)
      velocity.swap()

      gl.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0))
      gl.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.b)
      blit(dye.write)
      dye.swap()
    }

    function correctRadius(radius: number) {
      const aspectRatio = canvas.width / canvas.height
      if (aspectRatio > 1) radius *= aspectRatio
      return radius
    }

    function correctDeltaX(delta: number) {
      const aspectRatio = canvas.width / canvas.height
      if (aspectRatio < 1) delta *= aspectRatio
      return delta
    }

    function correctDeltaY(delta: number) {
      const aspectRatio = canvas.width / canvas.height
      if (aspectRatio > 1) delta /= aspectRatio
      return delta
    }

    function getResolution(resolution: number) {
      let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight
      if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio
      const min = Math.round(resolution)
      const max = Math.round(resolution * aspectRatio)
      if (gl.drawingBufferWidth > gl.drawingBufferHeight) return { width: max, height: min }
      else return { width: min, height: max }
    }

    function scaleByPixelRatio(input: number) {
      const pixelRatio = window.devicePixelRatio || 1
      return Math.floor(input * pixelRatio)
    }

    // Cleanup
    return () => {
      cancelAnimationFrame(animFrameId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        opacity: 0.025,
      }}
    />
  )
}
