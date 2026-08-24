(function () {
  var DESKTOP_MIN_WIDTH = 1024;
  var W = 1200;
  var H = 780;
  var paintCleanup = null;

  function applyAadiMask(el) {
    el.style.visibility = 'hidden';

    var c = document.createElement('canvas');
    var mw = 1200, mh = 740, s = 2;
    c.width = mw * s;
    c.height = mh * s;
    var ctx = c.getContext('2d');
    if (!ctx) {
      el.style.visibility = 'visible';
      return;
    }
    var text = 'आदि';
    var baselineY = 690;
    var font = '600 620px "Poppins"';

    ctx.scale(s, s);
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = 'white';
    ctx.fillText(text, mw / 2, baselineY);

    var pixels = ctx.getImageData(0, 0, c.width, c.height).data;
    var minX = c.width;
    var maxX = -1;
    for (var y = 0; y < c.height; y += 1) {
      for (var x = 0; x < c.width; x += 1) {
        if (pixels[(y * c.width + x) * 4 + 3] > 0) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
        }
      }
    }

    if (maxX >= minX) {
      var glyphCenter = (minX + maxX) / 2;
      var visualCenterCorrection = (c.width / 2 - glyphCenter) / s;
      ctx.clearRect(0, 0, mw, mh);
      ctx.font = font;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = 'white';
      ctx.fillText(text, mw / 2 + visualCenterCorrection, baselineY);
    }

    var url = 'url(' + c.toDataURL('image/png') + ')';
    el.style.webkitMaskImage = url;
    el.style.maskImage = url;
    el.style.visibility = 'visible';
  }

  function loadVideo(el) {
    var v = el.querySelector('video');
    if (!v || v.dataset.loaded === 'true') return;
    var src = v.dataset.src;
    if (!src) return;
    v.src = src;
    v.preload = 'metadata';
    v.dataset.loaded = 'true';
    v.addEventListener('playing', function () {
      el.classList.add('video-footer__word--video-playing');
    }, { once: true });
    v.addEventListener('error', function () {
      el.classList.remove('video-footer__word--video-playing');
    });
    v.load();
    v.play().catch(function () {});
  }

  function setupVideoLoading(el) {
    var footerNear = false;
    var pointerCleanup = null;

    function stopWatchingPointer() {
      if (pointerCleanup) {
        pointerCleanup();
        pointerCleanup = null;
      }
    }

    function maybeLoadFromPointer(e) {
      if (!footerNear || window.innerWidth < DESKTOP_MIN_WIDTH) return;
      var rect = el.getBoundingClientRect();
      var proximity = 180;
      var withinX = e.clientX >= rect.left - proximity && e.clientX <= rect.right + proximity;
      var withinY = e.clientY >= rect.top - proximity && e.clientY <= rect.bottom + proximity;
      if (withinX && withinY) {
        loadVideo(el);
        stopWatchingPointer();
      }
    }

    function startWatchingPointer() {
      if (pointerCleanup || window.innerWidth < DESKTOP_MIN_WIDTH) return;
      window.addEventListener('pointermove', maybeLoadFromPointer, { passive: true });
      var onEnter = function () {
        loadVideo(el);
        stopWatchingPointer();
      };
      el.addEventListener('pointerenter', onEnter);
      pointerCleanup = function () {
        window.removeEventListener('pointermove', maybeLoadFromPointer);
        el.removeEventListener('pointerenter', onEnter);
      };
    }

    var observer = new IntersectionObserver(
      function (entries) {
        if (!entries[0].isIntersecting) return;
        footerNear = true;
        observer.disconnect();
        if (window.innerWidth < DESKTOP_MIN_WIDTH) {
          loadVideo(el);
        } else {
          startWatchingPointer();
        }
      },
      { rootMargin: '700px 0px' }
    );
    observer.observe(el);

    var mq = window.matchMedia('(min-width: ' + DESKTOP_MIN_WIDTH + 'px)');
    var onChange = function () {
      if (!footerNear) return;
      if (mq.matches) {
        startWatchingPointer();
      } else {
        stopWatchingPointer();
        loadVideo(el);
      }
    };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  function setupHomeSectionLinks() {
    document.querySelectorAll('.video-footer a[href^="/#"]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        var href = link.getAttribute('href');
        if (!href) return;
        var hashIndex = href.indexOf('#');
        if (hashIndex === -1) return;
        event.preventDefault();
        sessionStorage.setItem('pending-home-section', href.slice(hashIndex));
        window.location.href = '/';
      });
    });
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
    setupHomeSectionLinks();
    var el = document.querySelector('.video-footer__word');
    if (!el) return;
    setupVideoLoading(el);
    applyAadiMask(el);
    setupPaint(el);

    var mq = window.matchMedia('(min-width: ' + DESKTOP_MIN_WIDTH + 'px)');
    var onChange = function () {
      applyAadiMask(el);
      setupPaint(el);
    };
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
