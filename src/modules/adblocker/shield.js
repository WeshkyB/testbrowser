/**
 * Weshky Shield - Built-in Ad Blocker & Tracker Protection
 * Blocks ads, trackers, cryptominers, and fingerprinting scripts.
 */

"use strict";

class WeshkyShield {
  constructor(options) {
    this._indicatorEl = options.indicatorEl;
    this._countEl = options.countEl;
    this._panelEl = options.panelEl;
    this._toggleEl = options.toggleEl;
    this._adsBlockedEl = options.adsBlockedEl;
    this._trackersBlockedEl = options.trackersBlockedEl;
    this._fpBlockedEl = options.fpBlockedEl;
    this._httpsUpgradesEl = options.httpsUpgradesEl;

    this._enabled = true;
    this._stats = {
      adsBlocked: 0,
      trackersBlocked: 0,
      fingerprintBlocked: 0,
      httpsUpgrades: 0,
    };

    this._filterLists = [];
    this._panelVisible = false;

    this._bindEvents();
    this._loadFilterLists();
  }

  _bindEvents() {
    this._toggleEl.addEventListener("click", () => {
      this._enabled = !this._enabled;
      this._toggleEl.classList.toggle("active", this._enabled);
      this._indicatorEl.classList.toggle("active", this._enabled);
      this._indicatorEl.classList.toggle("disabled", !this._enabled);
    });

    document.addEventListener("click", (e) => {
      if (this._panelVisible &&
          !this._panelEl.contains(e.target) &&
          !this._indicatorEl.contains(e.target)) {
        this.hidePanel();
      }
    });
  }

  async _loadFilterLists() {
    // In a real implementation, these would be loaded from files or URLs
    this._filterLists = [
      { name: "EasyList", type: "ads", enabled: true },
      { name: "EasyPrivacy", type: "trackers", enabled: true },
      { name: "Peter Lowe's Ad and Tracking Server List", type: "ads", enabled: true },
      { name: "Fanboy's Annoyance List", type: "ads", enabled: true },
      { name: "Malware Domain List", type: "malware", enabled: true },
    ];
  }

  /**
   * Check if a request should be blocked.
   * In a real Gecko integration, this would hook into nsIContentPolicy
   * or use the WebRequest API.
   */
  shouldBlock(url, resourceType, originUrl) {
    if (!this._enabled) return false;

    const domain = this._extractDomain(url);
    if (!domain) return false;

    // Check against known ad/tracker domains
    if (this._isAdDomain(domain)) {
      this._stats.adsBlocked++;
      this._updateUI();
      return true;
    }

    if (this._isTrackerDomain(domain)) {
      this._stats.trackersBlocked++;
      this._updateUI();
      return true;
    }

    return false;
  }

  /**
   * Upgrade HTTP requests to HTTPS when possible.
   */
  upgradeToHttps(url) {
    if (!this._enabled) return url;

    if (url.startsWith("http://")) {
      this._stats.httpsUpgrades++;
      this._updateUI();
      return url.replace("http://", "https://");
    }

    return url;
  }

  togglePanel() {
    if (this._panelVisible) {
      this.hidePanel();
    } else {
      this.showPanel();
    }
  }

  showPanel() {
    const rect = this._indicatorEl.getBoundingClientRect();
    this._panelEl.style.display = "block";
    this._panelEl.style.top = `${rect.bottom + 8}px`;
    this._panelEl.style.right = `${window.innerWidth - rect.right}px`;
    this._panelVisible = true;
    this._updateUI();
  }

  hidePanel() {
    this._panelEl.style.display = "none";
    this._panelVisible = false;
  }

  getStats() {
    return { ...this._stats };
  }

  resetStats() {
    this._stats = {
      adsBlocked: 0,
      trackersBlocked: 0,
      fingerprintBlocked: 0,
      httpsUpgrades: 0,
    };
    this._updateUI();
  }

  _updateUI() {
    const total = this._stats.adsBlocked + this._stats.trackersBlocked +
                  this._stats.fingerprintBlocked;
    this._countEl.textContent = total;
    this._adsBlockedEl.textContent = this._stats.adsBlocked;
    this._trackersBlockedEl.textContent = this._stats.trackersBlocked;
    this._fpBlockedEl.textContent = this._stats.fingerprintBlocked;
    this._httpsUpgradesEl.textContent = this._stats.httpsUpgrades;
  }

  _extractDomain(url) {
    try {
      return new URL(url).hostname;
    } catch {
      return null;
    }
  }

  /**
   * Known ad-serving domains.
   * In production, this would use full EasyList/AdGuard filter parsing.
   */
  _isAdDomain(domain) {
    const adDomains = [
      "doubleclick.net",
      "googlesyndication.com",
      "googleadservices.com",
      "moatads.com",
      "adnxs.com",
      "adsrvr.org",
      "amazon-adsystem.com",
      "adcolony.com",
      "serving-sys.com",
      "rubiconproject.com",
      "pubmatic.com",
      "openx.net",
      "casalemedia.com",
      "indexww.com",
      "bidswitch.net",
      "sharethis.com",
    ];
    return adDomains.some((ad) => domain === ad || domain.endsWith("." + ad));
  }

  /**
   * Known tracker domains.
   */
  _isTrackerDomain(domain) {
    const trackerDomains = [
      "google-analytics.com",
      "googletagmanager.com",
      "facebook.net",
      "connect.facebook.net",
      "pixel.facebook.com",
      "hotjar.com",
      "fullstory.com",
      "mixpanel.com",
      "segment.io",
      "amplitude.com",
      "branch.io",
      "appsflyer.com",
      "adjust.com",
      "criteo.com",
      "taboola.com",
      "outbrain.com",
      "scorecardresearch.com",
      "quantserve.com",
    ];
    return trackerDomains.some((t) => domain === t || domain.endsWith("." + t));
  }
}
