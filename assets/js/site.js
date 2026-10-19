/* Reliable Safe Packers & Movers - site behaviour. No dependencies. */
(function () {
  'use strict';
  var d = document;

  /* ---- sticky header shadow ---- */
  var hdr = d.querySelector('.header');
  if (hdr) {
    var onScroll = function () { hdr.classList.toggle('stuck', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  /* ---- scroll reveal (below-the-fold blocks only) ---- */
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    Array.prototype.forEach.call(d.querySelectorAll('.sec-head,.card,.steps li,.split>*,.faq details,.band .wrap'), function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) return;
      el.classList.add('rv'); io.observe(el);
    });
  }

  /* ---- mobile menu ---- */
  var burger = d.getElementById('burger');
  var nav = d.getElementById('nav');
  function setMenu(open) {
    if (!burger || !nav) return;
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    d.body.classList.toggle('lock', open);
    var u = burger.querySelector('use'); if (u) u.setAttribute('href', open ? '#i-close' : '#i-menu');
  }
  if (burger) {
    burger.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }

  /* ---- desktop dropdowns (open on hover/focus) ---- */
  var mq = window.matchMedia('(min-width:900px)');
  var dds = d.querySelectorAll('.nav li.dd');
  Array.prototype.forEach.call(dds, function (li) {
    var det = li.querySelector('details');
    li.addEventListener('mouseenter', function () { if (mq.matches) det.open = true; });
    li.addEventListener('mouseleave', function () { if (mq.matches) det.open = false; });
    li.addEventListener('focusin', function () { if (mq.matches) det.open = true; });
    li.addEventListener('focusout', function (e) { if (mq.matches && !li.contains(e.relatedTarget)) det.open = false; });
  });

  /* ---- ad / campaign params -> hidden form fields ---- */
  var keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'gbraid', 'wbraid', 'fbclid'];
  var track = {};
  try {
    var q = new URLSearchParams(location.search);
    keys.forEach(function (k) { if (q.get(k)) track[k] = q.get(k); });
    if (Object.keys(track).length) sessionStorage.setItem('rsp_track', JSON.stringify(track));
    else track = JSON.parse(sessionStorage.getItem('rsp_track') || '{}');
  } catch (e) { track = track || {}; }

  /* ---- analytics hooks (works with gtag or GTM if added later) ---- */
  function fire(name, extra) {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(Object.assign({ event: name }, extra || {}));
      if (typeof window.gtag === 'function') window.gtag('event', name, extra || {});
    } catch (e) {}
  }
  d.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="tel:"],a[href*="wa.me"]');
    if (!a) return;
    fire(a.href.indexOf('tel:') === 0 ? 'call_click' : 'whatsapp_click', { page: location.pathname });
  });

  /* ---- quote forms ---- */
  function phoneOk(v) {
    var n = v.replace(/[^\d]/g, '');
    if (n.length === 12 && n.indexOf('91') === 0) n = n.slice(2);
    if (n.length === 11 && n.charAt(0) === '0') n = n.slice(1);
    return /^[6-9]\d{9}$/.test(n) ? n : '';
  }
  Array.prototype.forEach.call(d.querySelectorAll('form[data-quote]'), function (form) {
    var msg = form.querySelector('.form-msg');
    var btn = form.querySelector('button[type=submit]');
    var label = btn.textContent;
    function show(t, ok) { msg.className = 'form-msg ' + (ok ? 'ok' : 'err'); msg.textContent = t; }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      msg.className = 'form-msg';
      var f = form.elements;
      var phone = phoneOk(f.phone.value);
      if (f.name.value.trim().length < 2) { show('Please enter your name.'); f.name.focus(); return; }
      if (!phone) { show('Enter a valid 10-digit mobile number.'); f.phone.focus(); return; }
      var body = {
        name: f.name.value.trim(), phone: phone,
        from: f.from ? f.from.value.trim() : '', to: f.to ? f.to.value.trim() : '',
        service: f.service ? f.service.value : '', date: f.date ? f.date.value : '',
        message: f.message ? f.message.value.trim() : '',
        website: f.website ? f.website.value : '',
        page: location.pathname, track: track
      };
      btn.disabled = true; btn.textContent = 'Sending...';
      fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok && j.ok, j: j }; }); })
        .then(function (res) {
          if (!res.ok) throw new Error(res.j.error || 'fail');
          fire('lead_submit', { page: location.pathname, service: body.service });
          location.href = 'thank-you.html';
        })
        .catch(function () {
          btn.disabled = false; btn.textContent = label;
          var wa = 'https://wa.me/918755722118?text=' + encodeURIComponent('Hi, I need a moving quote.\nName: ' + body.name + '\nPhone: ' + phone + '\nFrom: ' + body.from + '\nTo: ' + body.to);
          msg.className = 'form-msg err';
          msg.innerHTML = 'Could not send right now. Please <a href="tel:+918755722118"><b>call 87557 22118</b></a> or <a href="' + wa + '" target="_blank" rel="noopener"><b>send on WhatsApp</b></a>.';
        });
    });
  });
})();
