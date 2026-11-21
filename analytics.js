/* Learn French with Jo — optional audience analytics, consent-first */
(() => {
  'use strict';
  const MEASUREMENT_ID = 'G-DM79RP9WZS';
  const KEY = 'fwj_analytics_consent_v1';
  let loaded = false;
  const DISABLE_KEY = 'ga-disable-' + MEASUREMENT_ID;

  function getConsent() {
    try { return localStorage.getItem(KEY); } catch (_) { return null; }
  }
  function saveConsent(value) {
    try { localStorage.setItem(KEY, value); } catch (_) { /* Browser may block storage */ }
  }
  function loadAnalytics() {
    if (loaded || getConsent() !== 'accepted') return;
    window[DISABLE_KEY] = false;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', MEASUREMENT_ID, { anonymize_ip: true });
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(MEASUREMENT_ID);
    document.head.appendChild(script);
  }
  // Clear first-party GA cookies on the site's current host and parent domain.
  // Browsers do not permit this page to delete cookies belonging to google.com.
  function clearAnalyticsCookies() {
    const host = window.location.hostname;
    const parts = host.split('.');
    const domains = [''];
    for (let i = 0; i < parts.length - 1; i++) {
      domains.push(parts.slice(i).join('.'));
      domains.push('.' + parts.slice(i).join('.'));
    }
    const paths = ['/'];
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    let currentPath = '';
    for (const part of pathParts) {
      currentPath += '/' + part;
      paths.push(currentPath, currentPath + '/');
    }
    document.cookie.split(';').forEach((entry) => {
      const name = entry.split('=')[0].trim();
      if (!/^(_ga(?:_|$)|_gid$|_gat(?:_|$))/.test(name)) return;
      for (const domain of domains) {
        for (const path of paths) {
          const domainPart = domain ? '; domain=' + domain : '';
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; path=' + path + domainPart + '; SameSite=Lax';
        }
      }
    });
  }

  function showBanner() { banner.hidden = false; }
  function hideBanner() { banner.hidden = true; }
  function choose(value) {
    saveConsent(value);
    hideBanner();
    if (value === 'accepted') {
      loadAnalytics();
    } else {
      // Immediately disable GA and prevent any further tracked events.
      window[DISABLE_KEY] = true;
      clearAnalyticsCookies();
      if (loaded) window.location.reload();
    }
  }

  const style = document.createElement('style');
  style.textContent = `
    #fwj-consent-banner[hidden] { display: none !important; }
    #fwj-consent-banner { position: fixed; z-index: 2147483647; bottom: 16px; left: 16px; right: 16px; max-width: 540px; margin: 0 auto; padding: 20px; background: #fff; color: #18242d; border: 1px solid #dbe5eb; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,.18); font: 15px/1.5 Arial,sans-serif; }
    #fwj-consent-banner h2 { font: 700 18px/1.3 Arial,sans-serif; margin: 0 0 8px; color: #244b68; }
    #fwj-consent-banner p { margin: 0 0 12px; color: #43535f; }
    #fwj-consent-banner a { color: #2f76ad; text-decoration: underline; }
    #fwj-consent-banner .fwj-consent-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
    #fwj-consent-banner button { flex: 1 1 130px; min-height: 44px; padding: 10px 14px; border: 1px solid #2f76ad; border-radius: 8px; background: #fff; color: #244b68; font: 700 14px Arial,sans-serif; cursor: pointer; }
    #fwj-consent-banner button:hover { background: #e9f4fb; }
    #fwj-consent-banner button:focus-visible { outline: 3px solid #e4a45c; outline-offset: 2px; }
  `;
  document.head.appendChild(style);

  const banner = document.createElement('section');
  banner.id = 'fwj-consent-banner';
  banner.setAttribute('aria-label', 'Analytics cookie preferences');
  banner.hidden = true;
  banner.innerHTML = `
    <h2>Your privacy matters</h2>
    <p>May we use optional Google Analytics cookies to understand visits and improve our website? You can refuse without affecting your experience. <a href="/cookies.html">Cookie policy</a>.</p>
    <div class="fwj-consent-actions">
      <button type="button" id="fwj-consent-refuse">Refuse</button>
      <button type="button" id="fwj-consent-accept">Accept</button>
    </div>`;
  document.body.appendChild(banner);
  banner.querySelector('#fwj-consent-refuse').addEventListener('click', () => choose('refused'));
  banner.querySelector('#fwj-consent-accept').addEventListener('click', () => choose('accepted'));

  // Allow a permanent footer link or cookie-policy button to reopen choices.
  document.querySelectorAll('[data-cookie-settings]').forEach((el) => {
    el.addEventListener('click', (event) => { event.preventDefault(); showBanner(); });
  });

  if (getConsent() === 'accepted') {
    loadAnalytics();
  } else {
    window[DISABLE_KEY] = true;
    clearAnalyticsCookies();
    if (getConsent() !== 'refused') showBanner();
  }

  // A click to Calendly is not proof that an appointment was booked.
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link || getConsent() !== 'accepted' || window[DISABLE_KEY] || typeof window.gtag !== 'function') return;
    try {
      const url = new URL(link.href, window.location.href);
      if (url.hostname === 'calendly.com' || url.hostname.endsWith('.calendly.com')) {
        window.gtag('event', 'calendly_click', { link_url: url.href });
      }
    } catch (_) { /* Ignore invalid URLs */ }
  });
})();
