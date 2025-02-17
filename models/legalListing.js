const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const legalListingSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    location: String,
    imageUrl: String,
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('LegalListing', legalListingSchema);