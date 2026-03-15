/**
 * Weshky Browser - URL Bar Controller
 * Handles URL input, search queries, and security indicators.
 */

"use strict";

class Urlbar {
  constructor(options) {
    this._containerEl = options.containerEl;
    this._inputEl = options.inputEl;
    this._securityEl = options.securityEl;
    this._onSubmit = options.onSubmit;

    this._searchEngine = "https://duckduckgo.com/?q=";

    this._bindEvents();
  }

  _bindEvents() {
    this._inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const value = this._inputEl.value.trim();
        if (value) {
          this._onSubmit(value);
          this._inputEl.blur();
        }
      }

      if (e.key === "Escape") {
        this._inputEl.blur();
      }
    });

    this._inputEl.addEventListener("focus", () => {
      this._inputEl.select();
    });
  }

  focus() {
    this._inputEl.focus();
    this._inputEl.select();
  }

  setUrl(url) {
    this._inputEl.value = url;
  }

  setSecure(isSecure) {
    this._securityEl.classList.toggle("secure", isSecure);
    const iconRef = isSecure ? "#icon-lock" : "#icon-lock-open";
    const use = this._securityEl.querySelector("use");
    if (use) {
      use.setAttribute("href", `../../icons/toolbar-icons.svg${iconRef}`);
    }
  }

  resolveInput(input) {
    // Check if it looks like a URL
    if (this._isUrl(input)) {
      if (!input.includes("://")) {
        return "https://" + input;
      }
      return input;
    }

    // Treat as search query
    return this._searchEngine + encodeURIComponent(input);
  }

  _isUrl(input) {
    // Has protocol
    if (/^https?:\/\//i.test(input)) return true;
    // Has TLD-like pattern
    if (/^[\w-]+\.[\w]{2,}/.test(input)) return true;
    // localhost
    if (/^localhost(:\d+)?/.test(input)) return true;
    // about: pages
    if (/^about:/.test(input)) return true;

    return false;
  }
}
