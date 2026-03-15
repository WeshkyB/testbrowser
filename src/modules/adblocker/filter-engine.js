/**
 * Weshky Shield - Filter Engine
 * Parses and applies EasyList/AdGuard-compatible filter rules.
 * Handles network filtering, cosmetic filtering, and exception rules.
 */

"use strict";

class FilterRule {
  constructor(raw) {
    this.raw = raw;
    this.type = "block"; // block, allow, cosmetic
    this.pattern = "";
    this.regex = null;
    this.domains = null;
    this.excludedDomains = null;
    this.resourceTypes = null;
    this.thirdParty = null;
    this.cssSelector = null;

    this._parse(raw);
  }

  _parse(raw) {
    // Comment
    if (raw.startsWith("!") || raw.startsWith("[")) {
      this.type = "comment";
      return;
    }

    // Cosmetic filter
    if (raw.includes("##")) {
      this.type = "cosmetic";
      const parts = raw.split("##");
      this.cssSelector = parts[1];
      if (parts[0]) {
        this.domains = parts[0].split(",").filter((d) => !d.startsWith("~"));
        this.excludedDomains = parts[0]
          .split(",")
          .filter((d) => d.startsWith("~"))
          .map((d) => d.slice(1));
      }
      return;
    }

    // Exception rule
    if (raw.startsWith("@@")) {
      this.type = "allow";
      this.pattern = raw.slice(2);
    } else {
      this.pattern = raw;
    }

    // Parse options after $
    const dollarIndex = this.pattern.indexOf("$");
    if (dollarIndex !== -1) {
      const options = this.pattern.slice(dollarIndex + 1);
      this.pattern = this.pattern.slice(0, dollarIndex);
      this._parseOptions(options);
    }

    // Convert pattern to regex
    this.regex = this._patternToRegex(this.pattern);
  }

  _parseOptions(optionsStr) {
    const options = optionsStr.split(",");
    for (const opt of options) {
      if (opt === "third-party") this.thirdParty = true;
      else if (opt === "~third-party") this.thirdParty = false;
      else if (opt.startsWith("domain=")) {
        const domains = opt.slice(7).split("|");
        this.domains = domains.filter((d) => !d.startsWith("~"));
        this.excludedDomains = domains.filter((d) => d.startsWith("~")).map((d) => d.slice(1));
      } else if (["script", "image", "stylesheet", "xmlhttprequest", "subdocument",
                   "media", "font", "websocket", "other"].includes(opt)) {
        if (!this.resourceTypes) this.resourceTypes = [];
        this.resourceTypes.push(opt);
      }
    }
  }

  _patternToRegex(pattern) {
    if (!pattern) return null;

    let regex = pattern
      .replace(/[.+?{}()[\]\\]/g, "\\$&") // Escape special chars
      .replace(/\*/g, ".*")                // * -> .*
      .replace(/\^/g, "([^\\w\\d._%-]|$)"); // ^ -> separator

    // || at start means domain anchor
    if (regex.startsWith("||")) {
      regex = "^https?://([a-z0-9-]+\\.)*" + regex.slice(2);
    }

    // | at start/end means string anchor
    if (regex.startsWith("|")) regex = "^" + regex.slice(1);
    if (regex.endsWith("|")) regex = regex.slice(0, -1) + "$";

    try {
      return new RegExp(regex, "i");
    } catch {
      return null;
    }
  }

  matches(url, domain, resourceType, isThirdParty) {
    if (this.type === "comment" || this.type === "cosmetic") return false;

    // Check domain restrictions
    if (this.domains && this.domains.length > 0) {
      if (!this.domains.some((d) => domain === d || domain.endsWith("." + d))) {
        return false;
      }
    }
    if (this.excludedDomains && this.excludedDomains.length > 0) {
      if (this.excludedDomains.some((d) => domain === d || domain.endsWith("." + d))) {
        return false;
      }
    }

    // Check third-party
    if (this.thirdParty !== null && this.thirdParty !== isThirdParty) {
      return false;
    }

    // Check resource type
    if (this.resourceTypes && !this.resourceTypes.includes(resourceType)) {
      return false;
    }

    // Check URL pattern
    if (this.regex) {
      return this.regex.test(url);
    }

    return false;
  }
}

class FilterEngine {
  constructor() {
    this._blockRules = [];
    this._allowRules = [];
    this._cosmeticRules = [];
    this._loaded = false;
  }

  /**
   * Load filter rules from raw text (EasyList format).
   */
  loadRules(rawText) {
    const lines = rawText.split("\n").map((l) => l.trim()).filter((l) => l);
    for (const line of lines) {
      const rule = new FilterRule(line);
      switch (rule.type) {
        case "block":
          this._blockRules.push(rule);
          break;
        case "allow":
          this._allowRules.push(rule);
          break;
        case "cosmetic":
          this._cosmeticRules.push(rule);
          break;
      }
    }
    this._loaded = true;
  }

  /**
   * Check if a URL should be blocked.
   * Returns { blocked: boolean, rule: FilterRule|null }
   */
  check(url, originDomain, resourceType, isThirdParty) {
    if (!this._loaded) return { blocked: false, rule: null };

    // Check allow rules first
    for (const rule of this._allowRules) {
      if (rule.matches(url, originDomain, resourceType, isThirdParty)) {
        return { blocked: false, rule };
      }
    }

    // Check block rules
    for (const rule of this._blockRules) {
      if (rule.matches(url, originDomain, resourceType, isThirdParty)) {
        return { blocked: true, rule };
      }
    }

    return { blocked: false, rule: null };
  }

  /**
   * Get cosmetic rules (CSS selectors to hide elements) for a domain.
   */
  getCosmeticRules(domain) {
    return this._cosmeticRules
      .filter((rule) => {
        if (!rule.domains || rule.domains.length === 0) return true;
        if (rule.excludedDomains?.some((d) => domain === d || domain.endsWith("." + d))) {
          return false;
        }
        return rule.domains.some((d) => domain === d || domain.endsWith("." + d));
      })
      .map((rule) => rule.cssSelector)
      .filter(Boolean);
  }

  getRuleCount() {
    return this._blockRules.length + this._allowRules.length + this._cosmeticRules.length;
  }
}
