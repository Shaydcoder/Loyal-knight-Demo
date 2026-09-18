const http = require("http");
const app = require("./server");
const authHelper = require("./auth");
const notesStore = require("./notes");

let server;
const TEST_PORT = 3123;

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: TEST_PORT,
        ...options,
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          let parsed;
          try {
            parsed = JSON.parse(body);
          } catch {
            parsed = body;
          }
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        });
      }
    );

    req.on("error", reject);
    if (postData) {
      req.write(typeof postData === "string" ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log("Starting test suite...");
  server = app.listen(TEST_PORT);

  try {
    // 1. Test Health Check
    const healthRes = await request({ path: "/health", method: "GET" });
    if (healthRes.status !== 200 || healthRes.data.status !== "ok") {
      throw new Error(`Health check failed: ${JSON.stringify(healthRes.data)}`);
    }
    console.log("✔ Health check passed");

    // 2. Test Note Creation
    const createRes = await request(
      {
        path: "/notes",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      { title: "Demo Note", content: "This is a test note for Loyal Knight.", author: "tester" }
    );
    if (createRes.status !== 201 || !createRes.data.id || createRes.data.title !== "Demo Note") {
      throw new Error(`Note creation failed: ${JSON.stringify(createRes.data)}`);
    }
    console.log("✔ Note creation passed");

    const noteId = createRes.data.id;

    // 3. Test Fetching Notes
    const fetchRes = await request({ path: "/notes", method: "GET" });
    if (fetchRes.status !== 200 || !Array.isArray(fetchRes.data) || fetchRes.data.length !== 1) {
      throw new Error(`Fetching notes failed: ${JSON.stringify(fetchRes.data)}`);
    }
    console.log("✔ Fetching notes passed");

    // 4. Test Fetch Note by ID
    const singleRes = await request({ path: `/notes/${noteId}`, method: "GET" });
    if (singleRes.status !== 200 || singleRes.data.id !== noteId) {
      throw new Error(`Fetching single note failed: ${JSON.stringify(singleRes.data)}`);
    }
    console.log("✔ Fetch single note by ID passed");

    // 5. Test Auth Helper (Unauthorized & Authorized)
    const unauthRes = await request({ path: "/auth/verify", method: "GET" });
    if (unauthRes.status !== 401) {
      throw new Error(`Expected 401 for missing auth header, got ${unauthRes.status}`);
    }

    const authRes = await request({
      path: "/auth/verify",
      method: "GET",
      headers: { Authorization: `Bearer ${authHelper.SYNTHETIC_DEMO_TOKEN}` },
    });
    if (authRes.status !== 200 || !authRes.data.authenticated) {
      throw new Error(`Auth verification failed: ${JSON.stringify(authRes.data)}`);
    }
    console.log("✔ Auth helper verification passed");

    // 6. Test Analytics Tracking
    const analyticsRes = await request({ path: "/analytics", method: "GET" });
    if (analyticsRes.status !== 200 || !Array.isArray(analyticsRes.data) || analyticsRes.data.length < 2) {
      throw new Error(`Analytics event tracking check failed: ${JSON.stringify(analyticsRes.data)}`);
    }
    console.log("✔ Analytics event tracking passed");

    console.log("\nAll basic checks passed successfully!");
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  if (server) server.close();
  process.exit(1);
});
