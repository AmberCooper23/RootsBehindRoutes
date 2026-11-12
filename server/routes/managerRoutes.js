const express = require("express");
const { requireAuth } = require("../middleware/auth.js");
const {
  getManagedBusiness,
  updateManagedBusiness,
} = require("../services/managerService.js");

const router = express.Router();

// Every route here needs a signed-in user. There is no :id in these paths on
// purpose: a business can only ever see and edit the place linked to its own
// account.
router.use(requireAuth);

router.get("/me", async (req, res) => {
  try {
    const business = await getManagedBusiness(req.user.uid);
    if (!business) {
      return res
        .status(404)
        .send({ error: "This account isn't linked to a business" });
    }
    res.send(business);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.put("/me", async (req, res) => {
  try {
    const business = await updateManagedBusiness(req.user.uid, req.body);
    if (!business) {
      return res
        .status(404)
        .send({ error: "This account isn't linked to a business" });
    }
    res.send(business);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

module.exports = router;
