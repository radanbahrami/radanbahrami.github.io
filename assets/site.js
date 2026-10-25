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
      button.classList.remove('copied', 'un-copying');
      void button.offsetWidth;
      button.classList.add('copied');
      button.setAttribute('aria-label', 'Email copied');
      clearTimeout(button._copyReset);
      clearTimeout(button._copyIdle);
      button._copyReset = setTimeout(function () {
        button.classList.add('un-copying');
        button.setAttribute('aria-label', 'Copy email');
        button._copyIdle = setTimeout(function () {
          button.classList.remove('copied', 'un-copying');
        }, 980);
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

  document.addEventListener('submit', function (event) {
    var form = event.target.closest('[data-catch-email]');
    if (!form) return;
    event.preventDefault();

    var input = form.querySelector('input[type="email"]');
    var status = form.querySelector('[data-catch-status]');
    var button = form.querySelector('button[type="submit"]');
    var honey = form.querySelector('.catch-honey');
    var email = input ? input.value.trim() : '';

    function setStatus(message, isError) {
      if (!status) return;
      status.textContent = message;
      status.classList.toggle('is-error', !!isError);
    }

    if (honey && honey.value) return;
    if (!input || !input.checkValidity()) {
      setStatus('Enter an email.', true);
      if (input) input.focus();
      return;
    }

    if (button) button.disabled = true;
    setStatus('', false);

    fetch('https://formsubmit.co/ajax/radan@radanbahrami.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        _subject: 'Newsletter signup from radanbahrami.com',
        _template: 'table',
        _captcha: 'false'
      })
    }).then(function (response) {
      if (!response.ok) throw new Error('Request failed');
      return response.json();
    }).then(function () {
      form.reset();
      setStatus("You're on the list.", false);
    }).catch(function () {
      setStatus("Couldn't send that. Try again.", true);
    }).then(function () {
      if (button) button.disabled = false;
    });
  });

  window.prepCheckPaths = prepCheckPaths;

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  function safeUrl(url) {
    var value = String(url || '').trim();
    if (value.charAt(0) === '/') return value;
    if (/^https?:\/\//i.test(value)) return value;
    return '';
  }

  function formatPostDate(iso) {
    var match = /^(\d{4})-(\d{2})(?:-\d{2})?$/.exec(String(iso).trim());
    if (!match) return String(iso);
    var names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var month = names[Number(match[2]) - 1];
    return month ? month + ' ' + match[1] : String(iso);
  }

  function renderWritingLists() {
    var posts = Array.isArray(window.SITE_POSTS) ? window.SITE_POSTS.slice() : [];
    posts = posts.filter(function (post) {
      return post && post.title && post.date && post.sentence && safeUrl(post.url);
    });
    posts.sort(function (a, b) {
      if (a.date === b.date) return 0;
      return a.date < b.date ? 1 : -1;
    });

    document.querySelectorAll('[data-writing-list]').forEach(function (list) {
      var limit = Number(list.getAttribute('data-writing-limit'));
      var visible = limit > 0 ? posts.slice(0, limit) : posts;
      var empty = list.parentElement ? list.parentElement.querySelector('[data-writing-empty]') : null;

      if (!visible.length) {
        list.hidden = true;
        list.innerHTML = '';
        if (empty) empty.hidden = false;
        return;
      }

      list.hidden = false;
      if (empty) empty.hidden = true;
      list.innerHTML = visible.map(function (post) {
        return '' +
          '<a class="blog-post-item" href="' + escapeHTML(safeUrl(post.url)) + '">' +
            '<div>' +
              '<p class="post-title">' + escapeHTML(post.title) + '</p>' +
              '<p class="post-excerpt">' + escapeHTML(post.sentence) + '</p>' +
            '</div>' +
            '<span class="post-date">' + escapeHTML(formatPostDate(post.date)) + '</span>' +
          '</a>';
      }).join('');
    });
  }

  window.renderWritingLists = renderWritingLists;
  renderWritingLists();

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
