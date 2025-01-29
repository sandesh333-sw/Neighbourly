require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const legalListing = require('./models/legalListing.js');
const shareListing = require('./models/shareListing.js');  // Corrected this line
const path = require('path');

// Initialize app
const app = express();

// Connect to DB
const dbUrl = process.env.MONGODB_URI;

main().then(() => {
    console.log("Connected to DB");
}).catch(err => {
    console.log(err);
});

async function main(){
  await mongoose.connect(dbUrl);
}

// Middleware
app.use(express.static('views/public')); 
app.use(express.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'));
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
app.get("/", (req, res) => {
  res.render("index");
});

// Listing routes
app.get("/listings", (req, res) => {
  res.render("listings/index");
});

// Legal Listings
app.get("/listings/legal", async(req, res) => {
  const allListings = await legalListing.find({});
  res.render("listings/legal", { allListings });
});

// Room Sharing Listings
app.get("/listings/room-sharing", async(req, res) => {
  const allListings = await shareListing.find({});
  res.render("listings/room-sharing", { allListings });
});

// Legal Listing Details
app.get("/listings/legal/:id", async (req, res) => {
  const { id } = req.params;
  const listing = await legalListing.findById(id);
  if (!listing) {
    return res.status(404).send("Legal listing not found");
  }
  res.render("listings/showL", { listing });
});

// Room Sharing Listing Details
app.get("/listings/room-sharing/:id", async (req, res) => {
  const { id } = req.params;
  const listing = await shareListing.findById(id);
  if (!listing) {
    return res.status(404).send("Room-sharing listing not found");
  }
  res.render("listings/showS", { listing }); // Ensure this view exists
});

// Start server
app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});
