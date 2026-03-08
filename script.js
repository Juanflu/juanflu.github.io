/**
 * script.js — Juan Flores personal website
 *
 * Features:
 *  1. Dark mode toggle — persists in localStorage, respects OS preference
 *  2. Hamburger menu — mobile nav open/close
 *  3. Close mobile menu on nav link click
 *  4. Scroll-based fade-in animations via Intersection Observer
 *  5. Footer year auto-update
 */

(function () {
  'use strict';

  /* ──────────────────────────────────────────────────────
     1. Dark Mode
  ────────────────────────────────────────────────────── */

  const STORAGE_KEY = 'jf-theme';
  const html = document.documentElement;
  const toggleBtn = document.getElementById('theme-toggle');

  /**
   * Apply theme class to <html> and store preference.
   * @param {'dark'|'light'} theme
   */
  function applyTheme(theme) {
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (_) {
      // Private browsing / storage blocked — silently ignore
    }
    if (toggleBtn) {
      toggleBtn.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      );
    }
  }

  function getInitialTheme() {
    // 1. Stored preference
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') return stored;
    } catch (_) {}

    // 2. OS/system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  }

  // Apply on load (before any paint — class is toggled on <html>)
  applyTheme(getInitialTheme());

  // Toggle on button click
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      const isDark = html.classList.contains('dark');
      applyTheme(isDark ? 'light' : 'dark');
    });
  }

  // Respond to OS preference change (in case user changes it while page is open)
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      // Only auto-follow OS if the user hasn't set a manual preference
      try {
        if (!localStorage.getItem(STORAGE_KEY)) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      } catch (_) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  /* ──────────────────────────────────────────────────────
     2. Hamburger Menu
  ────────────────────────────────────────────────────── */

  const hamburger = document.querySelector('.nav__hamburger');
  const navLinks  = document.getElementById('nav-menu');

  function closeMenu() {
    if (!hamburger || !navLinks) return;
    hamburger.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('is-open');
  }

  function openMenu() {
    if (!hamburger || !navLinks) return;
    hamburger.setAttribute('aria-expanded', 'true');
    navLinks.classList.add('is-open');
  }

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close when a nav link is clicked
    navLinks.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

    // Close when clicking outside the nav area
    document.addEventListener('click', function (e) {
      if (
        hamburger.getAttribute('aria-expanded') === 'true' &&
        !navLinks.contains(e.target) &&
        !hamburger.contains(e.target)
      ) {
        closeMenu();
      }
    });
  }

  /* ──────────────────────────────────────────────────────
     3. Scroll-based Fade-in (Intersection Observer)
  ────────────────────────────────────────────────────── */

  const fadeEls = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window && fadeEls.length > 0) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            // Unobserve after reveal — no need to toggle back
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,       // Trigger when 8% of element is visible
        rootMargin: '0px 0px -32px 0px', // Slight offset from bottom
      }
    );

    fadeEls.forEach(function (el) {
      observer.observe(el);
    });

    // Immediately reveal anything already in viewport (e.g. hero on first load)
    // by checking after a single rAF so layout is settled
    requestAnimationFrame(function () {
      fadeEls.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add('is-visible');
          observer.unobserve(el);
        }
      });
    });
  } else {
    // Fallback: just show everything immediately (no IntersectionObserver support)
    fadeEls.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ──────────────────────────────────────────────────────
     4. Footer Year
  ────────────────────────────────────────────────────── */

  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

})();
