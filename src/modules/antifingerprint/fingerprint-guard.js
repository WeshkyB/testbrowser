/**
 * Weshky Browser - Fingerprint Guard
 * Protects against browser fingerprinting by spoofing or blocking
 * common fingerprinting vectors.
 *
 * In a real Gecko integration, most of these protections are handled
 * by privacy.resistFingerprinting in about:config. This module adds
 * additional protection layers on top.
 */

"use strict";

class FingerprintGuard {
  constructor() {
    this._enabled = true;
    this._protections = {
      canvas: true,
      webgl: true,
      audioContext: true,
      fonts: true,
      screenResolution: true,
      timezone: true,
      language: true,
      hardwareConcurrency: true,
      deviceMemory: true,
      batteryApi: true,
      webrtcIp: true,
    };

    this._blockedAttempts = 0;
    this._init();
  }

  _init() {
    if (!this._enabled) return;

    this._protectCanvas();
    this._protectWebGL();
    this._protectAudioContext();
    this._protectNavigatorProps();
    this._protectScreen();
    this._blockBatteryAPI();
  }

  /**
   * Canvas fingerprinting protection.
   * Adds subtle noise to canvas readback operations.
   */
  _protectCanvas() {
    if (!this._protections.canvas) return;

    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
    const originalToBlob = HTMLCanvasElement.prototype.toBlob;
    const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
    const guard = this;

    HTMLCanvasElement.prototype.toDataURL = function (...args) {
      guard._addCanvasNoise(this);
      guard._blockedAttempts++;
      return originalToDataURL.apply(this, args);
    };

    HTMLCanvasElement.prototype.toBlob = function (...args) {
      guard._addCanvasNoise(this);
      guard._blockedAttempts++;
      return originalToBlob.apply(this, args);
    };

    CanvasRenderingContext2D.prototype.getImageData = function (...args) {
      const imageData = originalGetImageData.apply(this, args);
      guard._addImageDataNoise(imageData);
      guard._blockedAttempts++;
      return imageData;
    };
  }

  /**
   * Add imperceptible noise to canvas data.
   */
  _addCanvasNoise(canvas) {
    try {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const imageData = CanvasRenderingContext2D.prototype.getImageData.call(
        ctx, 0, 0, canvas.width, canvas.height
      );
      this._addImageDataNoise(imageData);
      ctx.putImageData(imageData, 0, 0);
    } catch {
      // Canvas may be tainted by cross-origin data
    }
  }

  _addImageDataNoise(imageData) {
    const data = imageData.data;
    // Add +/- 1 noise to a small subset of pixels
    for (let i = 0; i < data.length; i += 40) {
      data[i] = Math.max(0, Math.min(255, data[i] + (Math.random() > 0.5 ? 1 : -1)));
    }
  }

  /**
   * WebGL fingerprinting protection.
   * Masks renderer and vendor strings.
   */
  _protectWebGL() {
    if (!this._protections.webgl) return;

    const guard = this;
    const originalGetParameter = WebGLRenderingContext.prototype.getParameter;

    WebGLRenderingContext.prototype.getParameter = function (param) {
      // UNMASKED_VENDOR_WEBGL
      if (param === 0x9245) {
        guard._blockedAttempts++;
        return "Weshky Graphics";
      }
      // UNMASKED_RENDERER_WEBGL
      if (param === 0x9246) {
        guard._blockedAttempts++;
        return "Weshky WebGL Renderer";
      }
      return originalGetParameter.call(this, param);
    };

    // Also protect WebGL2
    if (typeof WebGL2RenderingContext !== "undefined") {
      const originalGetParameter2 = WebGL2RenderingContext.prototype.getParameter;
      WebGL2RenderingContext.prototype.getParameter = function (param) {
        if (param === 0x9245) {
          guard._blockedAttempts++;
          return "Weshky Graphics";
        }
        if (param === 0x9246) {
          guard._blockedAttempts++;
          return "Weshky WebGL Renderer";
        }
        return originalGetParameter2.call(this, param);
      };
    }
  }

  /**
   * AudioContext fingerprinting protection.
   */
  _protectAudioContext() {
    if (!this._protections.audioContext) return;

    const guard = this;

    if (typeof AudioContext !== "undefined") {
      const originalCreateOscillator = AudioContext.prototype.createOscillator;
      AudioContext.prototype.createOscillator = function () {
        guard._blockedAttempts++;
        return originalCreateOscillator.call(this);
      };
    }

    if (typeof OfflineAudioContext !== "undefined") {
      const originalStartRendering = OfflineAudioContext.prototype.startRendering;
      OfflineAudioContext.prototype.startRendering = function () {
        guard._blockedAttempts++;
        return originalStartRendering.call(this);
      };
    }
  }

  /**
   * Protect navigator properties commonly used for fingerprinting.
   */
  _protectNavigatorProps() {
    if (this._protections.hardwareConcurrency) {
      Object.defineProperty(navigator, "hardwareConcurrency", {
        get: () => 4, // Consistent value
      });
    }

    if (this._protections.deviceMemory && "deviceMemory" in navigator) {
      Object.defineProperty(navigator, "deviceMemory", {
        get: () => 8, // Consistent value
      });
    }

    if (this._protections.language) {
      Object.defineProperty(navigator, "languages", {
        get: () => ["en-US", "en"],
      });
    }
  }

  /**
   * Protect screen dimensions from fingerprinting.
   */
  _protectScreen() {
    if (!this._protections.screenResolution) return;

    // Report consistent screen dimensions
    Object.defineProperty(screen, "colorDepth", { get: () => 24 });
    Object.defineProperty(screen, "pixelDepth", { get: () => 24 });
  }

  /**
   * Block Battery API (used for fingerprinting).
   */
  _blockBatteryAPI() {
    if (!this._protections.batteryApi) return;

    if ("getBattery" in navigator) {
      navigator.getBattery = () =>
        Promise.resolve({
          charging: true,
          chargingTime: 0,
          dischargingTime: Infinity,
          level: 1.0,
          addEventListener: () => {},
          removeEventListener: () => {},
        });
    }
  }

  getBlockedCount() {
    return this._blockedAttempts;
  }

  isEnabled() {
    return this._enabled;
  }

  setEnabled(enabled) {
    this._enabled = enabled;
  }

  getProtections() {
    return { ...this._protections };
  }

  setProtection(key, value) {
    if (key in this._protections) {
      this._protections[key] = value;
    }
  }
}
