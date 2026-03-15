/**
 * Weshky Browser - Tab Manager
 * Manages browser tabs with Arc-style vertical tab layout.
 */

"use strict";

class Tab {
  constructor(id, url) {
    this.id = id;
    this.url = url;
    this.title = "New Tab";
    this.favicon = null;
    this.pinned = false;
    this.canGoBack = false;
    this.canGoForward = false;
    this.loading = false;
    this.history = [url];
    this.historyIndex = 0;
    this.webview = null;
  }

  navigate(url) {
    this.url = url;
    this.loading = true;
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(url);
    this.historyIndex = this.history.length - 1;
    this.canGoBack = this.historyIndex > 0;
    this.canGoForward = false;

    if (this.webview) {
      this.webview.src = url;
    }
  }

  goBack() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.url = this.history[this.historyIndex];
      this.canGoBack = this.historyIndex > 0;
      this.canGoForward = true;
      if (this.webview) this.webview.src = this.url;
    }
  }

  goForward() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.url = this.history[this.historyIndex];
      this.canGoBack = true;
      this.canGoForward = this.historyIndex < this.history.length - 1;
      if (this.webview) this.webview.src = this.url;
    }
  }

  reload() {
    if (this.webview) {
      this.webview.src = this.url;
    }
  }

  setTitle(title) {
    this.title = title || this.url;
  }
}

class TabManager {
  constructor(options) {
    this._tabListEl = options.tabListEl;
    this._pinnedTabsEl = options.pinnedTabsEl;
    this._contentAreaEl = options.contentAreaEl;
    this._onTabChange = options.onTabChange;
    this._onTabCountChange = options.onTabCountChange;

    this._tabs = [];
    this._activeTabId = null;
    this._nextId = 1;
  }

  createTab(url) {
    const tab = new Tab(this._nextId++, url);
    this._tabs.push(tab);
    this._setActiveTab(tab.id);
    this._render();
    this._onTabCountChange(this._tabs.length);
    return tab;
  }

  closeTab(tabId) {
    const index = this._tabs.findIndex((t) => t.id === tabId);
    if (index === -1) return;

    this._tabs.splice(index, 1);

    if (this._activeTabId === tabId) {
      if (this._tabs.length > 0) {
        const newIndex = Math.min(index, this._tabs.length - 1);
        this._setActiveTab(this._tabs[newIndex].id);
      } else {
        this._activeTabId = null;
      }
    }

    this._render();
    this._onTabCountChange(this._tabs.length);
  }

  closeActiveTab() {
    if (this._activeTabId) {
      this.closeTab(this._activeTabId);
    }
  }

  getActiveTab() {
    return this._tabs.find((t) => t.id === this._activeTabId) || null;
  }

  nextTab() {
    const index = this._tabs.findIndex((t) => t.id === this._activeTabId);
    if (index < this._tabs.length - 1) {
      this._setActiveTab(this._tabs[index + 1].id);
      this._render();
    }
  }

  prevTab() {
    const index = this._tabs.findIndex((t) => t.id === this._activeTabId);
    if (index > 0) {
      this._setActiveTab(this._tabs[index - 1].id);
      this._render();
    }
  }

  switchToIndex(index) {
    if (index >= 0 && index < this._tabs.length) {
      this._setActiveTab(this._tabs[index].id);
      this._render();
    }
  }

  pinTab(tabId) {
    const tab = this._tabs.find((t) => t.id === tabId);
    if (tab) {
      tab.pinned = !tab.pinned;
      this._render();
    }
  }

  _setActiveTab(tabId) {
    this._activeTabId = tabId;
    const tab = this.getActiveTab();
    if (tab) {
      this._onTabChange(tab);
    }
  }

  _render() {
    const pinnedTabs = this._tabs.filter((t) => t.pinned);
    const regularTabs = this._tabs.filter((t) => !t.pinned);

    // Render pinned tabs
    this._pinnedTabsEl.innerHTML = pinnedTabs
      .map((tab) => this._renderTabItem(tab, true))
      .join("");

    // Render regular tabs (keep the header)
    const header = this._tabListEl.querySelector(".weshky-tab-section-header");
    this._tabListEl.innerHTML = "";
    if (header) this._tabListEl.appendChild(header);

    regularTabs.forEach((tab) => {
      this._tabListEl.insertAdjacentHTML("beforeend", this._renderTabItem(tab, false));
    });

    // Bind events
    this._tabListEl.querySelectorAll(".weshky-tab-item").forEach((el) => {
      const tabId = parseInt(el.dataset.tabId);
      el.addEventListener("click", () => {
        this._setActiveTab(tabId);
        this._render();
      });
      el.querySelector(".weshky-tab-close")?.addEventListener("click", (e) => {
        e.stopPropagation();
        this.closeTab(tabId);
      });
    });

    this._pinnedTabsEl.querySelectorAll(".weshky-space-item").forEach((el) => {
      const tabId = parseInt(el.dataset.tabId);
      el.addEventListener("click", () => {
        this._setActiveTab(tabId);
        this._render();
      });
    });
  }

  _renderTabItem(tab, pinned) {
    const isActive = tab.id === this._activeTabId;

    if (pinned) {
      return `
        <div class="weshky-space-item ${isActive ? "active" : ""}" data-tab-id="${tab.id}">
          <div class="weshky-space-favicon" style="background: var(--weshky-accent-subtle);"></div>
          <span class="weshky-space-label">${this._escapeHtml(tab.title)}</span>
        </div>
      `;
    }

    return `
      <div class="weshky-tab-item ${isActive ? "active" : ""}" data-tab-id="${tab.id}">
        <div class="weshky-tab-favicon" style="background: var(--weshky-bg-active);"></div>
        <span class="weshky-tab-title">${this._escapeHtml(tab.title)}</span>
        <div class="weshky-tab-close" title="Close tab">
          <svg width="12" height="12" viewBox="0 0 20 20">
            <use href="../../icons/toolbar-icons.svg#icon-close"/>
          </svg>
        </div>
      </div>
    `;
  }

  _escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}
