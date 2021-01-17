const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      required: true,
      validate(value) {
        if (!validator.isAlpha(value)) {
          throw new Error("The First Name must be a string value");
        }
      },
    },
    lastName: {
      type: String,
      trim: true,
      required: true,
      validate(value) {
        if (!validator.isAlpha(value)) {
          throw new Error("The Last Name must be a string value");
        }
      },
    },
    age: {
      type: Number,
      trim: true,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error("Age must be a positive number");
        }
      },
    },
    userName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Please provide a valid email");
        }
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      trim: true,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error("password cannot contain word password");
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User does not exist");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Wrong Password. Try again");
  }

  return user;
};

userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

const User = new mongoose.model("User", userSchema);

module.exports = User;
