const express = require('express');
const router = express.Router();
const communities = require('../controllers/community');
const { isLoggedIn } = require('../middleware/auth');

// Index route
router.get('/', communities.index);

// New community form
router.get('/new', isLoggedIn, communities.renderNewForm);

// Create community
router.post('/', isLoggedIn, communities.createCommunity);

// Show community
router.get('/:id', communities.showCommunity);

// Create post in community
router.post('/:id/posts', isLoggedIn, communities.createPost);

// Create comment on post
router.post('/:id/posts/:postId/comments', isLoggedIn, communities.createComment);

// Like post
router.post('/:id/posts/:postId/like', isLoggedIn, communities.likePost);

module.exports = router;
