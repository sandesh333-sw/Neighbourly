require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const Listing = require('./models/Listing'); // Add listing model

// Initialize app
const app = express();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Middleware
app.use(express.static('public')); // Changed to standard public directory
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

//get listing
app.get('/listings', async (req, res) => {
  try {
    const legalListings = await Listing.find({ verified: true }).exec();
    res.render('listings', { legalListings });
  } catch (err) {
    console.error('Error fetching listings:', err);
    res.status(500).send('Server Error');
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});