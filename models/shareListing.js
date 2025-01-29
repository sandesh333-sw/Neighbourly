const mongoose = require('mongoose');


const listingShareSchema = new mongoose.Schema({
  title: { type: String, required: true },
  location: { type: String, required: true },
  price: { type: Number, required: true },
  description: String,
  imageUrl: String,
  postDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SListing', listingShareSchema);