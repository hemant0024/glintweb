/* Shared page behaviour for the document pages (guides + legal).
   The landing page carries its own bundled script; this is the subset those
   pages need: reveal on enter, the nav's scrolled state, and the pointer halo.
   One rAF loop, transform and opacity only. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var each = function (list, fn) { Array.prototype.forEach.call(list, fn); };

  /* Reveal: blur, scale and rise settle out as each block enters. */
  var els = document.querySelectorAll('[data-rv]');
  if (!('IntersectionObserver' in window) || reduce) {
    each(els, function (e) { e.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        io.unobserve(en.target);
        var sweeps = en.target.classList.contains('sweep')
          ? [en.target] : en.target.querySelectorAll('.sweep');
        setTimeout(function () { each(sweeps, function (s) { s.classList.add('lit'); }); }, 420);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.14 });
    each(els, function (e) { io.observe(e); });
  }

  /* Nav lifts off the page once you leave the top. */
  var nav = document.querySelector('.nav');
  var ticking = false;
  function frame() { ticking = false; if (nav) nav.classList.toggle('stuck', window.scrollY > 12); }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(frame); }
  }, { passive: true });
  frame();

  /* Pointer halo, on precise pointers only. */
  var halo = document.getElementById('halo');
  if (halo && !reduce && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('mousemove', function (e) {
      halo.style.left = e.clientX + 'px';
      halo.style.top = e.clientY + 'px';
      halo.style.opacity = '1';
    }, { passive: true });
    window.addEventListener('mouseleave', function () { halo.style.opacity = '0'; });
  }

  /* PostHog click events, same contract as the landing page. */
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-ph-event]');
    if (!el || !window.posthog) return;
    var props = {};
    for (var i = 0; i < el.attributes.length; i++) {
      var a = el.attributes[i];
      if (a.name.indexOf('data-ph-') === 0 && a.name !== 'data-ph-event') {
        props[a.name.slice('data-ph-'.length)] = a.value;
      }
    }
    posthog.capture(el.getAttribute('data-ph-event'), props);
  });
})();
