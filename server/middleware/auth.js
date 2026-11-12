const { admin } = require("../firebaseConfig.js");

// Reads "Authorization: Bearer <token>", verifies it with Firebase, and
// attaches the verified user (including their uid) to req.user.
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).send({ error: "Please sign in" });
  }

  try {
    req.user = await admin.auth().verifyIdToken(token);
    next();
  } catch (err) {
    res.status(401).send({ error: "Your session has expired. Sign in again." });
  }
}

module.exports = { requireAuth };
