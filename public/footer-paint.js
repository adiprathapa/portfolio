(function () {
  var DESKTOP_MIN_WIDTH = 1024;
  var W = 1200;
  var H = 780;
  var paintCleanup = null;

  function applyAadiMask(el) {
    var c = document.createElement('canvas');
    var mw = 1200, mh = 740, s = 2;
    c.width = mw * s;
    c.height = mh * s;
    var ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.scale(s, s);
    ctx.font = '600 620px "Poppins"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = 'white';
    ctx.fillText('आदि', mw / 2, 690);
    var url = 'url(' + c.toDataURL('image/png') + ')';
    el.style.webkitMaskImage = url;
    el.style.maskImage = url;
    el.style.visibility = 'visible';

    var v = el.querySelector('video');
    if (v) v.play().catch(function () {});
  }

  function setupPaint(el) {
    if (paintCleanup) {
      paintCleanup();
      paintCleanup = null;
    }

    var existing = el.querySelector('.video-footer__paint');

    if (window.innerWidth < DESKTOP_MIN_WIDTH) {
      if (existing) existing.remove();
      return;
    }

    var canvas = existing;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'video-footer__paint';
      canvas.setAttribute('aria-hidden', 'true');
      el.appendChild(canvas);
    }
    canvas.width = W;
    canvas.height = H;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    var lastX = null, lastY = null;
    var lastClientX = null, lastClientY = null;
    var scrollRaf = 0;

    function erase(x, y, radius) {
      ctx.globalCompositeOperation = 'destination-out';
      var grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      grad.addColorStop(0, 'rgba(0,0,0,1)');
      grad.addColorStop(0.55, 'rgba(0,0,0,0.5)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }

    function paintAtClient(cx, cy) {
      var rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      if (cx < rect.left || cx > rect.right || cy < rect.top || cy > rect.bottom) {
        lastX = null; lastY = null;
        return;
      }
      var x = ((cx - rect.left) / rect.width) * W;
      var y = ((cy - rect.top) / rect.height) * H;
      var radius = 110;
      if (lastX !== null && lastY !== null) {
        var dx = x - lastX, dy = y - lastY;
        var dist = Math.hypot(dx, dy);
        var steps = Math.max(1, Math.ceil(dist / (radius * 0.3)));
        for (var i = 1; i <= steps; i++) {
          var t = i / steps;
          erase(lastX + dx * t, lastY + dy * t, radius);
        }
      } else {
        erase(x, y, radius);
      }
      lastX = x; lastY = y;
    }

    function onMove(e) {
      lastClientX = e.clientX;
      lastClientY = e.clientY;
      paintAtClient(e.clientX, e.clientY);
    }

    function onScroll() {
      if (lastClientX === null || lastClientY === null) return;
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(function () {
        scrollRaf = 0;
        if (lastClientX !== null && lastClientY !== null) {
          paintAtClient(lastClientX, lastClientY);
        }
      });
    }

    window.addEventListener('pointermove', onMove);
    window.addEventListener('scroll', onScroll, { passive: true });

    paintCleanup = function () {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
    };
  }

  function init() {
    var el = document.querySelector('.video-footer__word');
    if (!el) return;
    applyAadiMask(el);
    setupPaint(el);

    var mq = window.matchMedia('(min-width: ' + DESKTOP_MIN_WIDTH + 'px)');
    var onChange = function () { setupPaint(el); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(init);
  } else if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init);
  }
})();
