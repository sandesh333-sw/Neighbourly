const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const legalListingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
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