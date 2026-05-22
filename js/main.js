(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const heroBg = document.querySelector('.hero__bg');
  if (heroBg && !prefersReducedMotion) {
    let ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        const y = window.scrollY;
        const limit = window.innerHeight * 1.2;
        if (y < limit) {
          heroBg.style.transform = 'translate3d(0,' + (y * 0.38) + 'px,0)';
        }
        ticking = false;
      });
    }, { passive: true });
  }

  const burger = document.querySelector('.burger');
  const nav = document.getElementById('nav');

  if (burger && nav) {
    burger.addEventListener('click', function () {
      const open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function closeNavDropdowns() {
    document.querySelectorAll('.nav__item--open').forEach(function (item) {
      item.classList.remove('nav__item--open');
      var toggle = item.querySelector('.nav__link--dropdown');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  }

  document.querySelectorAll('.nav__item--has-sub').forEach(function (item) {
    var toggle = item.querySelector('.nav__link--dropdown');
    if (!toggle) return;

    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var isOpen = item.classList.contains('nav__item--open');
      closeNavDropdowns();
      if (!isOpen) {
        item.classList.add('nav__item--open');
        toggle.setAttribute('aria-expanded', 'true');
        scrollYAtOpen = window.scrollY;
      }
    });

    item.querySelectorAll('.nav__sub a').forEach(function (link) {
      link.addEventListener('click', function () {
        closeNavDropdowns();
      });
    });
  });

  var scrollYAtOpen = window.scrollY;
  window.addEventListener(
    'scroll',
    function () {
      if (document.querySelector('.nav__item--open')) {
        if (window.scrollY !== scrollYAtOpen) closeNavDropdowns();
        scrollYAtOpen = window.scrollY;
      } else {
        scrollYAtOpen = window.scrollY;
      }
    },
    { passive: true }
  );

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav__item--has-sub')) closeNavDropdowns();
  });

  const fadeEls = document.querySelectorAll('.fade-in');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    fadeEls.forEach(function (el) { observer.observe(el); });
  } else {
    fadeEls.forEach(function (el) { el.classList.add('visible'); });
  }

  const counters = document.querySelectorAll('[data-count]');
  let statsAnimated = false;

  function animateCounters() {
    if (statsAnimated) return;
    statsAnimated = true;
    counters.forEach(function (el) {
      const target = parseInt(el.getAttribute('data-count'), 10);
      const duration = 1500;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(target * eased).toLocaleString('ru-RU');
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target.toLocaleString('ru-RU');
      }
      requestAnimationFrame(tick);
    });
  }

  const statsSection = document.getElementById('stats');
  if (statsSection && 'IntersectionObserver' in window) {
    const statsObserver = new IntersectionObserver(
      function (entries) {
        if (entries[0].isIntersecting) {
          animateCounters();
          statsObserver.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    statsObserver.observe(statsSection);
  }

  const supportForm = document.getElementById('support-form');
  const supportSuccess = document.getElementById('support-success');
  const supportError = document.getElementById('support-error');
  const supportResetBtn = document.getElementById('support-reset');

  function showSupportSuccess() {
    if (supportForm) supportForm.hidden = true;
    if (supportSuccess) supportSuccess.hidden = false;
    if (supportError) supportError.hidden = true;
  }

  function showSupportForm() {
    if (supportForm) {
      supportForm.hidden = false;
      supportForm.reset();
    }
    if (supportSuccess) supportSuccess.hidden = true;
    if (supportError) supportError.hidden = true;
  }

  if (supportForm) {
    supportForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (supportError) supportError.hidden = true;

      if (!supportForm.checkValidity()) {
        supportForm.reportValidity();
        return;
      }

      const data = new FormData(supportForm);
      const name = (data.get('name') || '').toString().trim();
      const email = (data.get('email') || '').toString().trim();
      const phone = (data.get('phone') || '').toString().trim();
      const topic = (data.get('topic') || '').toString();
      const message = (data.get('message') || '').toString().trim();

      try {
        localStorage.setItem('anomost_support_lead', JSON.stringify({
          name: name,
          email: email,
          phone: phone,
          topic: topic,
          message: message,
          at: new Date().toISOString()
        }));
      } catch (err) { /* ignore */ }

      showSupportSuccess();
    });
  }

  if (supportResetBtn) {
    supportResetBtn.addEventListener('click', showSupportForm);
  }
})();
