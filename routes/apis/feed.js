const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator/check");

const Profile = require("../../models/Profile");
const User = require("../../models/User");
const Feed = require("../../models/Feed");

// @route  POST api/feeds
// @desc   Create a feed
// @access Private
router.post(
  "/",
  [
    auth,
    [
      check("text", "Text is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");

      const newFeed = new Feed({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      });

      const feed = await newFeed.save();

      res.json(feed);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route    GET api/feeds
// @desc     Get all feeds
// @access   Private
router.get("/", auth, async (req, res) => {
  try {
    const feeds = await Feed.find().sort({ date: -1 });
    res.json(feeds);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/feeds/:id
// @desc     Get particular feed
// @access   Private
router.get("/:id", auth, async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.id);
    if (!feed) {
      return res.status(404).json({
        msg: "Feed not found"
      });
    }
    res.json(feed);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(400).json({
        msg: "Feed not found"
      });
    }
    res.status(500).send("Server Error");
  }
});

// @route    DELETE api/feeds/:id
// @desc     Delete particular feed
// @access   Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.id);

    if (!feed) {
      return res.status(404).json({
        msg: "Feed not found"
      });
    }

    // Check User
    if (feed.user.toString() !== req.user.id) {
      return res.status(401).json({
        msg: "User not authorized"
      });
    }

    await feed.remove();

    res.json({ msg: "Feed removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(400).json({
        msg: "Feed not found"
      });
    }
    res.status(500).send("Server Error");
  }
});

// @route    PUT api/feeds/like/:id
// @desc     Like a feed
// @access   Private
router.put("/like/:id", auth, async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.id);

    // Check if the post has already been liked
    if (feed.likes.some(like => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: "Feed already liked" });
    }

    feed.likes.unshift({ user: req.user.id });

    await feed.save();

    return res.json(feed.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    PUT api/feeds/unlike/:id
// @desc     Unlike a feed
// @access   Private
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.id);

    // Check if the post has already been liked
    if (!feed.likes.some(like => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: "Post has not yet been liked" });
    }

    // remove the like
    feed.likes = feed.likes.filter(
      ({ user }) => user.toString() !== req.user.id
    );

    await feed.save();

    return res.json(feed.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route  POST api/feeds/comment/:id
// @desc   Create a comment on a post
// @access Private
router.post(
  "/comment/:id",
  [
    auth,
    [
      check("text", "Text is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");

      const feed = await Feed.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      };

      feed.comments.unshift(newComment);

      await feed.save();

      res.json(feed.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route  DELETE api/feeds/comment/:id/:comment_id
// @desc   Delete comment on a post
// @access Private

router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.id);

    // Pull out comment
    const comment = feed.comments.find(
      comment => comment.id === req.params.comment_id
    );

    // Make sure comments exists
    if (!comment) {
      return res.status(404).json({ msg: "Comment does not exists" });
    }

    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    // remove the like
    const removeIndex = feed.comments
      .map(comment => comment.id)
      .indexOf(req.params.comment_id);

    feed.comments.splice(removeIndex, 1);

    await feed.save();

    res.json(feed.comments);
  } catch (error) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
