// Simple synthetic analytics helper for Loyal Knight demo
// NOTE: All tokens and endpoints here are purely synthetic and fake for demonstration purposes.

const SYNTHETIC_ANALYTICS_ENDPOINT = "https://analytics.example.internal/collect";
const SYNTHETIC_ANALYTICS_KEY = "synthetic_analytics_key_demo987";

const eventLog = [];

/**
 * Tracks an application event for demonstration purposes.
 * @param {string} eventName
 * @param {Object} [metadata]
 * @returns {Object} Logged event record
 */
function trackEvent(eventName, metadata = {}) {
  const eventRecord = {
    id: `evt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    eventName,
    metadata,
    timestamp: new Date().toISOString(),
    endpoint: SYNTHETIC_ANALYTICS_ENDPOINT,
  };

  eventLog.push(eventRecord);
  return eventRecord;
}

/**
 * Retrieves all tracked analytics events.
 * @returns {Array<Object>}
 */
function getTrackedEvents() {
  return [...eventLog];
}

/**
 * Resets tracked events (useful for tests).
 */
function clearTrackedEvents() {
  eventLog.length = 0;
}

module.exports = {
  SYNTHETIC_ANALYTICS_ENDPOINT,
  SYNTHETIC_ANALYTICS_KEY,
  trackEvent,
  getTrackedEvents,
  clearTrackedEvents,
};

// CASE 8: Telemetry/analytics sink
const analytics = {
  track: trackEvent
};

const DEMO_SECRET_FOR_ANALYTICS = "sb_publishable_AhjNTxfxi92RBcCdeqvbPA_5W0N3yEv";
analytics.track("demo_secret_leak", { leakedSecret: DEMO_SECRET_FOR_ANALYTICS });
