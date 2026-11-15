const { db, admin } = require("../firebaseConfig.js");

async function verifyToken(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;
  try {
    return await admin.auth().verifyIdToken(token);
  } catch {
    return null;
  }
}

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

async function optionalAuth(req, res, next) {
  req.user = await verifyToken(req);
  next();
}

async function requireAdmin(req, res, next) {
  const decoded = await verifyToken(req);
  if (!decoded) {
    return res.status(401).send({ error: "Please sign in" });
  }
  try {
    const snap = await db.collection("users").doc(decoded.uid).get();
    const role = (snap.data()?.role || "").toLowerCase();
    if (role !== "admin") {
      return res.status(403).send({ error: "Admin only" });
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
}

async function requireActiveUser(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).send({ error: "Please sign in" });
  }

  let decoded;
  try {
    decoded = await admin.auth().verifyIdToken(token);
  } catch {
    return res
      .status(401)
      .send({ error: "Your session has expired. Sign in again." });
  }

  try {
    const snap = await db.collection("users").doc(decoded.uid).get();
    const data = snap.data() || {};
    if (data.banned) {
      return res.status(403).send({ error: "Account banned" });
    }
    const until = data.suspendedUntil;
    if (until && new Date(until).getTime() > Date.now()) {
      return res.status(403).send({ error: "Account suspended" });
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
}

module.exports = {
  requireAuth,
  requireAdmin,
  requireActiveUser,
  optionalAuth,
};
