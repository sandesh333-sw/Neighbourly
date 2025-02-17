const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommunitySchema = new Schema({
    name: String,
    description: String,
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'Post'
    }],
    image: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Community', CommunitySchema); 