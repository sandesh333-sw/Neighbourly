const express = require('express');
const router = express.Router();
const passport = require('passport');
const users = require('../controllers/users');

// Define routes with explicit handlers
router.get('/register', users.renderRegister);
router.post('/register', users.register);

router.get('/login', users.renderLogin);
router.post('/login', passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/login'
}), users.login);

router.post('/logout', users.logout);

module.exports = router; 