/**
 * Weshky Browser - Main Browser Controller
 * Initializes all browser components and manages the browser lifecycle.
 */

"use strict";

const Weshky = {
  _initialized: false,

  tabManager: null,
  navigation: null,
  urlbar: null,
  shield: null,
  fingerprintGuard: null,

  async init() {
    if (this._initialized) return;

    this.tabManager = new TabManager({
      tabListEl: document.getElementById("tab-list"),
      pinnedTabsEl: document.getElementById("pinned-tabs"),
      contentAreaEl: document.getElementById("content-area"),
      onTabChange: (tab) => this._onTabChange(tab),
      onTabCountChange: (count) => this._onTabCountChange(count),
    });

    this.navigation = new Navigation({
      backBtn: document.getElementById("btn-back"),
      forwardBtn: document.getElementById("btn-forward"),
      reloadBtn: document.getElementById("btn-reload"),
      onNavigate: (url) => this._onNavigate(url),
    });

    this.urlbar = new Urlbar({
      containerEl: document.getElementById("urlbar"),
      inputEl: document.getElementById("urlbar-input"),
      securityEl: document.getElementById("urlbar-security"),
      onSubmit: (url) => this._onUrlSubmit(url),
    });

    this.shield = new WeshkyShield({
      indicatorEl: document.getElementById("btn-shield"),
      countEl: document.getElementById("shield-count"),
      panelEl: document.getElementById("shield-panel"),
      toggleEl: document.getElementById("shield-toggle"),
      adsBlockedEl: document.getElementById("shield-ads-blocked"),
      trackersBlockedEl: document.getElementById("shield-trackers-blocked"),
      fpBlockedEl: document.getElementById("shield-fp-blocked"),
      httpsUpgradesEl: document.getElementById("shield-https-upgrades"),
    });

    this.fingerprintGuard = new FingerprintGuard();

    this._bindEvents();
    this.tabManager.createTab("about:home");
    this._initialized = true;
  },

  _bindEvents() {
    // New tab
    document.getElementById("btn-new-tab").addEventListener("click", () => {
      this.tabManager.createTab("about:home");
    });

    // Shield panel toggle
    document.getElementById("btn-shield").addEventListener("click", () => {
      this.shield.togglePanel();
    });

    // Sidebar toggle on double-click header
    document.querySelector(".weshky-sidebar-header").addEventListener("dblclick", () => {
      document.getElementById("sidebar").classList.toggle("collapsed");
    });

    // Settings
    document.getElementById("btn-settings").addEventListener("click", () => {
      this.tabManager.createTab("about:preferences");
    });

    // Private window
    document.getElementById("btn-private").addEventListener("click", () => {
      this._openPrivateWindow();
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => this._handleKeyboard(e));

    // New tab search
    const newtabInput = document.getElementById("newtab-search-input");
    if (newtabInput) {
      newtabInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && newtabInput.value.trim()) {
          this._onUrlSubmit(newtabInput.value.trim());
        }
      });
    }

    // Theme detection
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
    prefersDark.addEventListener("change", (e) => {
      document.documentElement.setAttribute("data-theme", e.matches ? "dark" : "light");
    });
  },

  _handleKeyboard(e) {
    const ctrl = e.ctrlKey || e.metaKey;

    // Ctrl+T: New tab
    if (ctrl && e.key === "t") {
      e.preventDefault();
      this.tabManager.createTab("about:home");
    }

    // Ctrl+W: Close tab
    if (ctrl && e.key === "w") {
      e.preventDefault();
      this.tabManager.closeActiveTab();
    }

    // Ctrl+L: Focus URL bar
    if (ctrl && e.key === "l") {
      e.preventDefault();
      this.urlbar.focus();
    }

    // Ctrl+R: Reload
    if (ctrl && e.key === "r") {
      e.preventDefault();
      this.navigation.reload();
    }

    // Ctrl+Shift+P: Private window
    if (ctrl && e.shiftKey && e.key === "P") {
      e.preventDefault();
      this._openPrivateWindow();
    }

    // Ctrl+F: Find in page
    if (ctrl && e.key === "f") {
      e.preventDefault();
      this._toggleFindBar();
    }

    // Alt+Left: Back
    if (e.altKey && e.key === "ArrowLeft") {
      e.preventDefault();
      this.navigation.goBack();
    }

    // Alt+Right: Forward
    if (e.altKey && e.key === "ArrowRight") {
      e.preventDefault();
      this.navigation.goForward();
    }

    // Ctrl+Tab: Next tab
    if (ctrl && e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      this.tabManager.nextTab();
    }

    // Ctrl+Shift+Tab: Previous tab
    if (ctrl && e.shiftKey && e.key === "Tab") {
      e.preventDefault();
      this.tabManager.prevTab();
    }

    // Ctrl+1-9: Switch to tab
    if (ctrl && e.key >= "1" && e.key <= "9") {
      e.preventDefault();
      const index = parseInt(e.key) - 1;
      this.tabManager.switchToIndex(index);
    }
  },

  _onTabChange(tab) {
    if (tab) {
      this.urlbar.setUrl(tab.url);
      this.urlbar.setSecure(tab.url.startsWith("https://"));
      this.navigation.updateState(tab.canGoBack, tab.canGoForward);
      document.title = tab.title ? `${tab.title} - Weshky` : "Weshky";
    }
  },

  _onTabCountChange(count) {
    if (count === 0) {
      this.tabManager.createTab("about:home");
    }
  },

  _onNavigate(url) {
    const activeTab = this.tabManager.getActiveTab();
    if (activeTab) {
      activeTab.navigate(url);
      this.urlbar.setUrl(url);
    }
  },

  _onUrlSubmit(input) {
    const url = this.urlbar.resolveInput(input);
    const activeTab = this.tabManager.getActiveTab();
    if (activeTab) {
      activeTab.navigate(url);
    } else {
      this.tabManager.createTab(url);
    }
  },

  _openPrivateWindow() {
    // In a real Gecko integration, this would open a new private window
    // via nsIWindowWatcher
    console.log("[Weshky] Opening private window");
  },

  _toggleFindBar() {
    let findbar = document.querySelector(".weshky-findbar");
    if (findbar) {
      findbar.remove();
      return;
    }

    findbar = document.createElement("div");
    findbar.className = "weshky-findbar weshky-animate-fade";
    findbar.innerHTML = `
      <input type="text" placeholder="Find in page" autofocus>
      <span class="weshky-findbar-count">0/0</span>
      <button class="weshky-nav-btn">
        <svg viewBox="0 0 20 20"><use href="../../icons/toolbar-icons.svg#icon-back"/></svg>
      </button>
      <button class="weshky-nav-btn">
        <svg viewBox="0 0 20 20"><use href="../../icons/toolbar-icons.svg#icon-forward"/></svg>
      </button>
      <button class="weshky-nav-btn" onclick="this.closest('.weshky-findbar').remove()">
        <svg viewBox="0 0 20 20"><use href="../../icons/toolbar-icons.svg#icon-close"/></svg>
      </button>
    `;
    document.getElementById("content-area").appendChild(findbar);
    findbar.querySelector("input").focus();
  },
};

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => Weshky.init());
