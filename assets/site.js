/* Shared site helpers */
(function () {
  function prepCheckPaths() {
    document.querySelectorAll('.copy-swap-done svg path').forEach(function (path) {
      path.setAttribute('d', 'M4 12 L9 17 L20 6');
      path.style.setProperty('--check-len', String(Math.ceil(path.getTotalLength())));
    });
  }

  function copyEmail(email, button) {
    var done = function () {
      if (!button) return;
      button.classList.remove('copied');
      void button.offsetWidth;
      button.classList.add('copied');
      button.setAttribute('aria-label', 'Email copied');
      clearTimeout(button._copyReset);
      button._copyReset = setTimeout(function () {
        button.classList.remove('copied');
        button.setAttribute('aria-label', 'Copy email');
      }, 1800);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(done).catch(function () {
        fallbackCopy(email, done);
      });
    } else {
      fallbackCopy(email, done);
    }
  }

  function fallbackCopy(email, done) {
    var field = document.createElement('textarea');
    field.value = email;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    try {
      document.execCommand('copy');
      done();
    } catch (e) { /* ignore */ }
    document.body.removeChild(field);
  }

  document.addEventListener('click', function (event) {
    var button = event.target.closest('[data-copy-email]');
    if (!button) return;
    event.preventDefault();
    copyEmail(button.getAttribute('data-copy-email'), button);
  });

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
    prepCheckPaths();
  }

  var menu = document.getElementById('mobileNav');
  var hamburger = document.getElementById('navHamburger');
  var lastFocus = null;

  function getMenuFocusable() {
    var items = [];
    if (hamburger) items.push(hamburger);
    if (menu) {
      menu.querySelectorAll('a').forEach(function (el) {
        items.push(el);
      });
    }
    return items;
  }

  function setMenuState(isOpen) {
    if (!menu || !hamburger) return;
    if (isOpen) lastFocus = document.activeElement;

    menu.classList.toggle('open', isOpen);
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    hamburger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    document.body.style.overflow = isOpen ? 'hidden' : '';

    if (isOpen) {
      menu.removeAttribute('inert');
      var firstLink = menu.querySelector('a');
      if (firstLink) firstLink.focus();
    } else {
      menu.setAttribute('inert', '');
      var restore = lastFocus && typeof lastFocus.focus === 'function' ? lastFocus : hamburger;
      restore.focus();
    }
  }

  function closeMenu() {
    setMenuState(false);
  }

  if (menu) {
    menu.setAttribute('inert', '');
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
  }

  if (hamburger) {
    hamburger.addEventListener('click', function () {
      setMenuState(!menu.classList.contains('open'));
    });
  }

  document.addEventListener('keydown', function (event) {
    if (!menu || !menu.classList.contains('open')) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
      return;
    }

    if (event.key !== 'Tab') return;

    var focusable = getMenuFocusable();
    if (!focusable.length) return;

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  var nav = document.getElementById('siteNav');
  var hero = document.getElementById('top');
  if (nav && hero) {
    function syncNav() {
      var threshold = hero.offsetHeight - 56;
      nav.classList.toggle('solid', window.scrollY > threshold);
    }
    window.addEventListener('scroll', syncNav, { passive: true });
    syncNav();
  }
})();
