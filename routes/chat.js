const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/auth');
const chat = require('../controllers/chat');

router.get('/', isLoggedIn, chat.renderChat);
router.post('/send', isLoggedIn, chat.sendMessage);

module.exports = router; 