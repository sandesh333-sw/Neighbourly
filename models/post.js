const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    content: String,
    images: [String],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    likes: {
        type: Number,
        default: 0
    },
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Post', PostSchema); 