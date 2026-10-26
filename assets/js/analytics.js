/* Apex GA4 click events for nyctdentistry.com (PROPOSED, addendum 2026-10-12).
   Inert until the GA4 gtag snippet is installed: every call checks for window.gtag.
   Sends no personal data: no form field values, no names, emails or phone numbers typed by visitors.
   reddit_profile_click is NOT sent here; v3.js already sends it (avoids double counting). */
(function () {
  'use strict';
  var TEL_OFFICE = { '2038834451': 'stamford', '8609273577': 'kent', '9146665225': 'mount-kisco' };
  var BOOK_OFFICE = { 'bookcsds': 'stamford', 'kentdent': 'kent', 'mtkisco': 'mount-kisco' };
  var MAPS_RE = /(^|\.)google\.[a-z.]+\/maps|maps\.google\.|maps\.app\.goo\.gl|goo\.gl\/maps|maps\.apple\.com/i;

  function send(name, params) {
    if (typeof window.gtag === 'function') { window.gtag('event', name, params); }
  }
  function pageOffice() {
    var m = location.pathname.match(/\/(stamford|kent|mount-kisco)(\/|\.html)/);
    return m ? m[1] : 'none';
  }
  function placement(el) {
    if (el.closest('#di-chat-panel')) return 'chat';
    if (el.closest('header, .site-header, nav')) return 'header';
    if (el.closest('footer, .site-footer')) return 'footer';
    return 'body';
  }
  function officeFromText(s) {
    s = decodeURIComponent(s || '').toLowerCase();
    if (s.indexOf('stamford') > -1) return 'stamford';
    if (s.indexOf('kisco') > -1) return 'mount-kisco';
    if (s.indexOf('kent') > -1) return 'kent';
    return 'unknown';
  }

  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var base = { placement: placement(a), page_office: pageOffice() };

    if (/^tel:/i.test(href)) {
      var digits = href.replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');
      base.office = TEL_OFFICE[digits] || 'unknown';
      send('phone_click', base);
      return;
    }
    if (/flexbook\.me/i.test(href)) {
      var m = href.match(/flexbook\.me\/([^\/?#]+)/i);
      base.office = (m && BOOK_OFFICE[m[1].toLowerCase()]) || 'unknown';
      base.link_domain = 'flexbook.me';
      send('booking_click', base);
      return;
    }
    if (MAPS_RE.test(href)) {
      base.office = officeFromText(href);
      send('directions_click', base);
    }
  }, true);

  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (!f || f.tagName !== 'FORM') return;
    send('form_submit', {
      form_id: f.id || 'unknown',
      form_method: /^mailto:/i.test(f.getAttribute('action') || '') ? 'mailto' : 'post',
      page_office: pageOffice()
    });
  }, true);
})();
