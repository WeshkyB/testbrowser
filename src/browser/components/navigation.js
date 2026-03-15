/**
 * Weshky Browser - Navigation Controller
 * Handles back, forward, and reload actions.
 */

"use strict";

class Navigation {
  constructor(options) {
    this._backBtn = options.backBtn;
    this._forwardBtn = options.forwardBtn;
    this._reloadBtn = options.reloadBtn;
    this._onNavigate = options.onNavigate;

    this._canGoBack = false;
    this._canGoForward = false;

    this._bindEvents();
    this.updateState(false, false);
  }

  _bindEvents() {
    this._backBtn.addEventListener("click", () => this.goBack());
    this._forwardBtn.addEventListener("click", () => this.goForward());
    this._reloadBtn.addEventListener("click", () => this.reload());
  }

  goBack() {
    if (!this._canGoBack) return;
    const activeTab = Weshky.tabManager.getActiveTab();
    if (activeTab) {
      activeTab.goBack();
      Weshky.urlbar.setUrl(activeTab.url);
      this.updateState(activeTab.canGoBack, activeTab.canGoForward);
    }
  }

  goForward() {
    if (!this._canGoForward) return;
    const activeTab = Weshky.tabManager.getActiveTab();
    if (activeTab) {
      activeTab.goForward();
      Weshky.urlbar.setUrl(activeTab.url);
      this.updateState(activeTab.canGoBack, activeTab.canGoForward);
    }
  }

  reload() {
    const activeTab = Weshky.tabManager.getActiveTab();
    if (activeTab) {
      activeTab.reload();
    }
  }

  updateState(canGoBack, canGoForward) {
    this._canGoBack = canGoBack;
    this._canGoForward = canGoForward;

    this._backBtn.classList.toggle("disabled", !canGoBack);
    this._forwardBtn.classList.toggle("disabled", !canGoForward);
  }
}
