const mongoose = require("mongoose");

const signupNewsSchema = new mongoose.Schema({
    newssignupname: {
      type: String,
      required: true
    },
    tvchannel: {
        type: String,
        required: true
    },
    newssignupemail: {
      type: String,
      required: true,
      unique: true
    },
    newssignuppassword: {
      type: String,
      required: true
    },
    newssignupconfirmpassword: {
      type: String,
      required: true
    },
    // photo: {
    //     data: Buffer,
    //     contentType: String
    //   }
});

const NewsSignupUser = mongoose.model('NewsSignupUser', signupNewsSchema);
module.exports = NewsSignupUser;

