const mongoose = require("mongoose");

const signupUserSchema = new mongoose.Schema({
  signupname: {
    type: String,
    required: true
  },
  signupemail: {
    type: String,
    unique: true
  },
  signuppassword: {
    type: String,
    required: true
  },
  signupconfirmpassword: {
    type: String,
    required: true
  }
});


const SignupUser = mongoose.model("SignupUser", signupUserSchema);

module.exports = SignupUser;
