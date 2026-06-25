/* ============================================================
   WILLMS & CARLESSO — Main JS
   ============================================================ */

(function () {
  'use strict';

  /* ---- Nav: scroll state ---- */
  const nav = document.getElementById('nav');

  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Nav: mobile burger ---- */
  const burger  = document.getElementById('navBurger');
  const menu    = document.getElementById('navMenu');

  burger.addEventListener('click', function () {
    const isOpen = menu.classList.toggle('open');
    burger.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  menu.querySelectorAll('.nav__link').forEach(function (link) {
    link.addEventListener('click', function () {
      menu.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  /* ---- Reveal on scroll ---- */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---- Smooth scroll for anchor links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const id = anchor.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = nav.offsetHeight + 16;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ---- Active nav link on scroll ---- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link');

  function setActiveLink() {
    const scrollY = window.scrollY + nav.offsetHeight + 80;
    sections.forEach(function (section) {
      const top    = section.offsetTop;
      const bottom = top + section.offsetHeight;
      const id     = section.getAttribute('id');
      const link   = document.querySelector('.nav__link[href="#' + id + '"]');
      if (link) {
        link.classList.toggle('active', scrollY >= top && scrollY < bottom);
      }
    });
  }
  window.addEventListener('scroll', setActiveLink, { passive: true });
  setActiveLink();

  /* ---- Float WhatsApp: visível só após o hero ---- */
  const waFloat = document.querySelector('.wa-float');
  const hero    = document.getElementById('inicio');
  if (waFloat && hero && 'IntersectionObserver' in window) {
    waFloat.classList.add('wa-float--hidden');
    const heroObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        // hero fora da viewport (passou) → mostrar float
        waFloat.classList.toggle('wa-float--hidden', entry.isIntersecting);
      });
    }, { threshold: 0.25 });
    heroObserver.observe(hero);
  }

  /* ---- Hide nav when footer is in view (evita "duas logos") ---- */
  const footer = document.querySelector('.footer');
  if (footer && nav && 'IntersectionObserver' in window) {
    const footerObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        nav.classList.toggle('nav--hidden', entry.isIntersecting);
      });
    }, { threshold: 0.05 });
    footerObserver.observe(footer);
  }

  /* ---- Form de contato: envio via webhook (Make) ---- */
  const contatoForm   = document.getElementById('contatoForm');
  const contatoBtn    = document.getElementById('contatoSubmit');
  const contatoStatus = document.getElementById('contatoStatus');

  if (contatoForm && contatoBtn) {
    contatoForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const originalText = contatoBtn.textContent.trim();
      const data = {
        nome:     contatoForm.elements['nome'].value.trim(),
        telefone: contatoForm.elements['telefone'].value.trim(),
        email:    contatoForm.elements['email'].value.trim(),
        mensagem: contatoForm.elements['mensagem'].value.trim(),
        origem:   'willmscarlesso.com.br',
        enviado_em: new Date().toISOString()
      };

      contatoBtn.disabled  = true;
      contatoBtn.textContent = 'Enviando...';
      if (contatoStatus) {
        contatoStatus.textContent = '';
        contatoStatus.classList.remove('contato__form-status--error', 'contato__form-status--success');
      }

      fetch(contatoForm.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (res) {
          if (!res.ok) throw new Error('http ' + res.status);
          return res.text().catch(function () { return ''; });
        })
        .then(function () {
          contatoForm.reset();
          contatoBtn.textContent = 'Mensagem enviada ✓';
          if (contatoStatus) {
            contatoStatus.textContent = 'Obrigado pelo contato. Responderemos em breve.';
            contatoStatus.classList.add('contato__form-status--success');
          }
          setTimeout(function () {
            contatoBtn.textContent = originalText;
            contatoBtn.disabled = false;
          }, 4000);
        })
        .catch(function () {
          contatoBtn.textContent = originalText;
          contatoBtn.disabled = false;
          if (contatoStatus) {
            contatoStatus.textContent = 'Não foi possível enviar. Tente novamente ou fale conosco pelo WhatsApp.';
            contatoStatus.classList.add('contato__form-status--error');
          }
        });
    });
  }

  /* ---- Depoimentos carousel: dots indicadores (mobile-only) ---- */
  const track = document.getElementById('depoimentosTrack');
  const dots  = document.getElementById('depoimentosDots');
  if (track && dots) {
    const cards = track.querySelectorAll('.dep-card');
    cards.forEach(function (_, i) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Depoimento ' + (i + 1));
      if (i === 0) dot.setAttribute('aria-current', 'true');
      dot.addEventListener('click', function () {
        const card = cards[i];
        if (card) {
          track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: 'smooth' });
        }
      });
      dots.appendChild(dot);
    });

    let scrollTimer;
    track.addEventListener('scroll', function () {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function () {
        const dotsEls = dots.querySelectorAll('button');
        const center = track.scrollLeft + (track.clientWidth / 2);
        let active = 0;
        let bestDist = Infinity;
        cards.forEach(function (card, i) {
          const cardCenter = card.offsetLeft - track.offsetLeft + (card.clientWidth / 2);
          const dist = Math.abs(cardCenter - center);
          if (dist < bestDist) { bestDist = dist; active = i; }
        });
        dotsEls.forEach(function (d, i) {
          if (i === active) d.setAttribute('aria-current', 'true');
          else d.removeAttribute('aria-current');
        });
      }, 80);
    }, { passive: true });
  }

  /* ---- Cookie banner ---- */
  (function () {
    var STORAGE_KEY = 'wc_cookie_consent';
    var banner = document.getElementById('cookieBanner');
    if (!banner) return;

    if (!localStorage.getItem(STORAGE_KEY)) {
      banner.hidden = false;
      setTimeout(function () { banner.classList.add('is-visible'); }, 600);
    }

    function dismiss(choice) {
      localStorage.setItem(STORAGE_KEY, choice);
      banner.classList.remove('is-visible');
      setTimeout(function () { banner.hidden = true; }, 380);
    }

    document.getElementById('cookieAccept').addEventListener('click', function () { dismiss('accepted'); });
    document.getElementById('cookieDecline').addEventListener('click', function () { dismiss('declined'); });
  }());

})();
