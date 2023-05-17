const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  tvchannel: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: false,
  },
  upVotes: {
    type: Number,
    default: 0,
  },
  downVotes: {
    type: Number,
    default: 0,
  },
  published: { 
    type: Boolean, 
    default: false 
  },
  publishDate: { 
    type: Date,
    default: Date.now,
  },
  
});

const Article = mongoose.model('Article', articleSchema);
module.exports = Article;


