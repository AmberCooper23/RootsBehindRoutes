import express from "express";
import { createPost, getPost, getAllPosts } from "../services/postsService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const id = await createPost(req.body);
    res.status(201).send({ message: "Post created", id });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const post = await getPost(req.params.id);
    if (post) res.send(post);
    else res.status(404).send({ error: "Post not found" });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const posts = await getAllPosts();
    res.send(posts);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

export default router;
