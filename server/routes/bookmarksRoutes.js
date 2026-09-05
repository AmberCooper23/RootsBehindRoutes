const express = require("express");
const router = express.Router();
const { db, admin } = require("../firebaseConfig.js");

router.post("/", async (req, res) => {
  try {
    const { userId, itemPath } = req.body;
    const docId = `bookmark_${userId}_${Date.now()}`;
    await db.collection("bookmarks").doc(docId).set({
      userId: userId,
      itemId: itemPath,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ success: true, id: docId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const snapshot = await db
      .collection("bookmarks")
      .where("userId", "==", req.params.userId)
      .get();
    const bookmarks = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(bookmarks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await db.collection("bookmarks").doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
