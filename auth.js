// Simple synthetic authentication helper for Loyal Knight demo
// NOTE: All tokens and keys here are purely synthetic and fake for demonstration purposes.

const SYNTHETIC_DEMO_TOKEN = "synthetic_demo_token_secret_12345";

// CASE 3: Environment variable source
const token = process.env.API_TOKEN || "synthetic_env_token";

// CASE 4: Function parameter propagation
function sendTokenToService(passedToken) {
  // CASE 6: Logger sink
  console.log("Demo token logger sink:", passedToken);

  // CASE 5: HTTP sink
  try {
    // If fetch is unavailable (older Node), the catch block prevents crashes
    fetch("http://example.com/api", {
      headers: {
        "Authorization": `Bearer ${passedToken}`
      }
    }).catch(() => {});
  } catch (e) {
    // ignore
  }
}

sendTokenToService(token);


/**
 * Extracts bearer token from Authorization header.
 * @param {string} [authHeader]
 * @returns {string | null}
 */
function extractBearerToken(authHeader) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7).trim();
}

/**
 * Validates whether the provided token matches the demo synthetic token.
 * @param {string} token
 * @returns {boolean}
 */
function verifyToken(token) {
  if (!token) return false;
  return token === SYNTHETIC_DEMO_TOKEN;
}

/**
 * Express middleware to verify authentication token on protected endpoints.
 */
function authMiddleware(req, res, next) {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  if (!verifyToken(token)) {
    return res.status(403).json({ error: "Invalid demo token" });
  }

  req.user = { id: "demo-user-1", username: "demo_analyst" };
  next();
}

module.exports = {
  SYNTHETIC_DEMO_TOKEN,
  extractBearerToken,
  verifyToken,
  authMiddleware,
};
