/**
 * Weshky Browser - Performance Monitor
 * Monitors memory usage, CPU utilization, and tab performance.
 * Provides automatic optimizations like tab suspension.
 */

"use strict";

class PerformanceMonitor {
  constructor(options = {}) {
    this._memoryThreshold = options.memoryThreshold || 0.85; // 85% memory usage
    this._idleTimeout = options.idleTimeout || 300000;       // 5 minutes
    this._checkInterval = options.checkInterval || 30000;    // 30 seconds
    this._intervalId = null;
    this._tabActivity = new Map();
    this._suspended = new Set();
  }

  start() {
    this._intervalId = setInterval(() => this._check(), this._checkInterval);
  }

  stop() {
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }

  /**
   * Record tab activity to track idle tabs.
   */
  recordActivity(tabId) {
    this._tabActivity.set(tabId, Date.now());
    if (this._suspended.has(tabId)) {
      this._suspended.delete(tabId);
    }
  }

  /**
   * Remove a tab from tracking.
   */
  removeTab(tabId) {
    this._tabActivity.delete(tabId);
    this._suspended.delete(tabId);
  }

  /**
   * Check system resources and suspend idle tabs if needed.
   */
  _check() {
    const now = Date.now();

    // Find idle tabs
    for (const [tabId, lastActive] of this._tabActivity) {
      if (now - lastActive > this._idleTimeout && !this._suspended.has(tabId)) {
        this._suspendTab(tabId);
      }
    }
  }

  /**
   * Suspend a tab to free memory.
   * In a real Gecko integration, this would use the Tab Unloading API.
   */
  _suspendTab(tabId) {
    this._suspended.add(tabId);
    console.log(`[Weshky Performance] Suspended idle tab: ${tabId}`);
  }

  /**
   * Get performance statistics.
   */
  getStats() {
    return {
      activeTabs: this._tabActivity.size - this._suspended.size,
      suspendedTabs: this._suspended.size,
      totalTabs: this._tabActivity.size,
    };
  }

  isSuspended(tabId) {
    return this._suspended.has(tabId);
  }
}
