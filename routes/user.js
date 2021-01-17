const express = require("express");

const User = require("../models/user");
const auth = require("../middleware/auth");
const router = express.Router();

router.post("/users/signup", async (req, res) => {
  const user = new User(req.body);

  try {
    const token = await user.generateAuthToken();
    await user.save();
    res.status(201).send({ user, token: token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.status(200).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return req.token !== token.token;
    });
    await req.user.save();
    res.status(200).send();
  } catch (e) {
    res.status(400).send({ error: "Cannot logout user" });
  }
});

router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.status(200).send();
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get("/users/me", auth, async (req, res) => {
  res.status(200).send(req.user);
});

router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowUpdates = [
    "firstName",
    "lastName",
    "age",
    "email",
    "username",
    "password",
  ];

  const isMatch = updates.every((update) => allowUpdates.includes(update));

  if (!isMatch) {
    res.status(400).send({ error: "Please update valid information" });
  }

  try {
    updates.forEach((update) => {
      req.user[update] = req.body[update];
    });

    await req.user.save();
    res.status(200).send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/users/delete/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    res.status(200).send(req.user);
  } catch (e) {
    res.status(400).send({ error: "Cannot Delete User" });
  }
});

module.exports = router;
