const express = require("express");
const { requireAdmin } = require("../middleware/auth.js");
const {
  listByStatus,
  setContentStatus,
  deleteContent,
  listUsers,
  banUser,
  unbanUser,
  suspendUser,
  unsuspendUser,
  getModerationSummary,
} = require("../services/adminService.js");

const router = express.Router();

router.use(requireAdmin);

router.get("/summary", async (req, res) => {
  try {
    res.send(await getModerationSummary());
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.get("/content", async (req, res) => {
  try {
    const status = req.query.status || "pending";
    res.send(await listByStatus(status));
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

router.post("/content/:collection/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    res.send(
      await setContentStatus(req.params.collection, req.params.id, status),
    );
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

router.delete("/content/:collection/:id", async (req, res) => {
  try {
    res.send(await deleteContent(req.params.collection, req.params.id));
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

router.get("/users", async (req, res) => {
  try {
    res.send(await listUsers());
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.post("/users/:uid/ban", async (req, res) => {
  try {
    res.send(await banUser(req.params.uid));
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.post("/users/:uid/unban", async (req, res) => {
  try {
    res.send(await unbanUser(req.params.uid));
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.post("/users/:uid/suspend", async (req, res) => {
  try {
    const { until } = req.body;
    if (!until) return res.status(400).send({ error: "until required" });
    res.send(await suspendUser(req.params.uid, until));
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.post("/users/:uid/unsuspend", async (req, res) => {
  try {
    res.send(await unsuspendUser(req.params.uid));
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

module.exports = router;
