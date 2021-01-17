const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const app = require("../app.js");
const User = require("../models/user");
const { response } = require("express");

const userOneId = new mongoose.Types.ObjectId();

const userOne = {
  _id: userOneId,
  firstName: "Mico",
  lastName: "Micic",
  age: 10,
  userName: "micPoMic",
  email: "mic.97@mic.com",
  password: "micmicmicmic",
  tokens: [
    {
      token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET),
    },
  ],
};

beforeEach(async () => {
  await User.deleteMany();
  await new User(userOne).save();
});

test("Should signup a new user", async () => {
  const response = await request(app)
    .post("/users/signup")
    .send({
      firstName: "Emir",
      lastName: "Muharemagic",
      age: 23,
      userName: "emirBems55",
      email: "emir.97@gmail.com",
      password: "randevu062583423",
    })
    .expect(201);

  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();

  expect(response.body).toMatchObject({
    user: {
      firstName: "Emir",
    },
    token: user.tokens[0].token,
  });

  expect(user.password).not.toBe("randevu062583423");
});

test("Should login existing user", async () => {
  const response = await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);

  const user = await User.findById(response.body.user._id);

  expect(user).not.toBeNull();

  expect(response.body.token).toBe(user.tokens[1].token);
});

test("Should not login nonexistent user", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: "jdhcsjdhsjdhsjdhs",
    })
    .expect(400);
});

test("Should get profile for user", async () => {
  await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test("Should not get profile for unauthenticated user", async () => {
  await request(app).get("/users/me").send().expect(400);
});

test("Should delete account for user", async () => {
  await request(app)
    .delete("/users/delete/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const user = await User.findById(userOne._id);
  expect(user).toBeNull();
});

test("Should not delete account for unauthenticated user", async () => {
  await request(app).delete("/users/delete/me").send().expect(400);
});
