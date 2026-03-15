// Weshky Browser - Default Preferences
// Privacy-first, performance-optimized configuration

// ============================================================
// Branding
// ============================================================
pref("browser.startup.homepage", "about:home");
pref("browser.startup.page", 1);
pref("startup.homepage_welcome_url", "about:welcome");
pref("browser.shell.checkDefaultBrowser", true);

// ============================================================
// UI / Appearance
// ============================================================
pref("browser.uidensity", 1);
pref("browser.compactmode.show", true);
pref("browser.tabs.tabMinWidth", 76);
pref("browser.tabs.tabClipWidth", 140);
pref("browser.urlbar.maxRichResults", 8);
pref("browser.newtabpage.activity-stream.feeds.section.highlights", false);
pref("browser.newtabpage.activity-stream.feeds.topsites", false);
pref("browser.newtabpage.activity-stream.showSponsored", false);
pref("browser.newtabpage.activity-stream.showSponsoredTopSites", false);
pref("browser.newtabpage.activity-stream.default.sites", "");

// Smooth scrolling
pref("general.smoothScroll", true);
pref("general.smoothScroll.msdPhysics.enabled", true);
pref("general.smoothScroll.msdPhysics.continuousMotionMaxDeltaMS", 250);
pref("general.smoothScroll.msdPhysics.motionBeginSpringConstant", 400);
pref("general.smoothScroll.msdPhysics.regularSpringConstant", 200);
pref("general.smoothScroll.msdPhysics.slowdownMinDeltaMS", 50);
pref("general.smoothScroll.msdPhysics.slowdownSpringConstant", 5000);
pref("general.smoothScroll.currentVelocityWeighting", "0.12");
pref("general.smoothScroll.stopDecelerationWeighting", "0.6");
pref("mousewheel.min_line_scroll_amount", 10);

// ============================================================
// Performance
// ============================================================
pref("gfx.webrender.all", true);
pref("gfx.webrender.compositor", true);
pref("gfx.canvas.accelerated", true);
pref("gfx.canvas.accelerated.cache-items", 8192);
pref("gfx.canvas.accelerated.cache-size", 1024);
pref("layers.acceleration.force-enabled", true);
pref("layout.css.backdrop-filter.enabled", true);
pref("image.mem.decode_bytes_at_a_time", 65536);
pref("media.memory_cache_max_size", 131072);
pref("media.cache_readahead_limit", 9999);
pref("media.cache_resume_threshold", 9999);
pref("network.buffer.cache.size", 262144);
pref("network.buffer.cache.count", 128);
pref("network.http.max-connections", 1800);
pref("network.http.max-persistent-connections-per-server", 10);
pref("network.http.max-urgent-start-excessive-connections-per-host", 5);
pref("network.http.pacing.requests.enabled", false);
pref("network.ssl_tokens_cache_capacity", 32768);

// Content process optimization
pref("dom.ipc.processCount", 8);
pref("dom.ipc.processCount.webIsolated", 4);

// ============================================================
// Privacy / Anti-Fingerprint
// ============================================================
pref("privacy.resistFingerprinting", true);
pref("privacy.resistFingerprinting.letterboxing", true);
pref("privacy.trackingprotection.enabled", true);
pref("privacy.trackingprotection.socialtracking.enabled", true);
pref("privacy.trackingprotection.cryptomining.enabled", true);
pref("privacy.trackingprotection.fingerprinting.enabled", true);
pref("privacy.partition.network_state.ocsp_cache", true);
pref("privacy.partition.serviceWorkers", true);
pref("privacy.partition.always_partition_third_party_non_cookie_storage", true);
pref("privacy.partition.always_partition_third_party_non_cookie_storage.exempt_sessionstorage", false);

// Cookie isolation
pref("privacy.firstparty.isolate", true);
pref("network.cookie.cookieBehavior", 5);
pref("network.cookie.lifetimePolicy", 2);
pref("browser.contentblocking.category", "strict");

// Disable telemetry
pref("toolkit.telemetry.enabled", false);
pref("toolkit.telemetry.unified", false);
pref("toolkit.telemetry.server", "");
pref("toolkit.telemetry.archive.enabled", false);
pref("toolkit.telemetry.newProfilePing.enabled", false);
pref("toolkit.telemetry.shutdownPingSender.enabled", false);
pref("toolkit.telemetry.updatePing.enabled", false);
pref("toolkit.telemetry.bhrPing.enabled", false);
pref("toolkit.telemetry.firstShutdownPing.enabled", false);
pref("toolkit.telemetry.coverage.opt-out", true);
pref("toolkit.coverage.opt-out", true);
pref("datareporting.healthreport.uploadEnabled", false);
pref("datareporting.policy.dataSubmissionEnabled", false);
pref("app.shield.optoutstudies.enabled", false);
pref("browser.discovery.enabled", false);

// Disable Pocket
pref("extensions.pocket.enabled", false);

// DNS over HTTPS
pref("network.trr.mode", 2);
pref("network.trr.uri", "https://dns.cloudflare.com/dns-query");

// HTTPS-only
pref("dom.security.https_only_mode", true);
pref("dom.security.https_only_mode_send_http_background_request", false);

// Disable prefetching
pref("network.prefetch-next", false);
pref("network.dns.disablePrefetch", true);
pref("network.predictor.enabled", false);
pref("network.http.speculative-parallel-limit", 0);

// WebRTC leak prevention
pref("media.peerconnection.ice.default_address_only", true);
pref("media.peerconnection.ice.no_host", true);
pref("media.peerconnection.ice.proxy_only_if_behind_proxy", true);

// Canvas fingerprinting protection
pref("privacy.resistFingerprinting.randomization.daily_reset.enabled", true);
pref("privacy.resistFingerprinting.randomization.daily_reset.private.enabled", true);

// ============================================================
// Security
// ============================================================
pref("security.ssl.require_safe_negotiation", true);
pref("security.tls.version.min", 3);
pref("security.tls.enable_0rtt_data", false);
pref("security.OCSP.enabled", 1);
pref("security.OCSP.require", true);
pref("security.cert_pinning.enforcement_level", 2);
pref("security.pki.sha1_enforcement_level", 1);
pref("security.ssl.treat_unsafe_negotiation_as_broken", true);
pref("browser.ssl_override_behavior", 1);
pref("browser.xul.error_pages.expert_bad_cert", true);

// ============================================================
// Ad Blocker (Weshky Shield)
// ============================================================
pref("weshky.shield.enabled", true);
pref("weshky.shield.cosmetic_filtering", true);
pref("weshky.shield.block_trackers", true);
pref("weshky.shield.block_malware", true);
pref("weshky.shield.acceptable_ads", false);
pref("weshky.shield.update_interval", 86400);
