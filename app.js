require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const legalListing = require('./models/legalListing.js');
const shareListing = require('./models/shareListing.js');  // Corrected this line
const path = require('path');
const methodOverride = require('method-override');

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
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(methodOverride('_method'));


 

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

//Create Listing
//legal
app.get("/listings/legal/new",(req, res) => {
  res.render("listings/newL");
});


app.post("/listings/legal/new", async (req, res) => {
  try {
      const newListing = new legalListing(req.body.listing);
      await newListing.save();
      res.redirect("/listings/legal");
  } catch (error) {
      console.error(error);
      res.status(400).send(error);
  }
});


//room sharing
app.get("/listings/room-sharing/new",(req, res) => {
  res.render("listings/newS");
});

app.post("/listings/room-sharing/new", async (req, res) => {
  try {
      const newListing = new shareListing(req.body.listing);
      await newListing.save();
      res.redirect("/listings/room-sharing");
  } catch (error) {
      console.error(error);
      res.status(400).send(error);
  }
});

//Edit listings


app.get("/listings/legal/:id/edit", async(req, res) => {
  let { id } = req.params;
  const listing = await legalListing.findById(id);
  res.render("listings/editL", { listing });
});

app.put("/listings/legal/:id", async(req, res) => {
  let { id } = req.params;
  let listing = await legalListing.findByIdAndUpdate(id, {...req.body.listing}, { new: true });
  res.redirect(`/listings/legal/${id}`);
});
//sharing
app.get("/listings/room-sharing/:id/edit", async(req, res) => {
  let { id } = req.params;
  const listing = await shareListing.findById(id);
  res.render("listings/editS", { listing });
});

app.put("/listings/room-sharing/:id", async(req, res) => {
  let { id } = req.params;
  let listing = await shareListing.findByIdAndUpdate(id, {...req.body.listing}, { new: true });
  res.redirect(`/listings/room-sharing/${id}`);
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


//Edit listing

//Update Listing

//Delete listing
app.delete("/listings/legal/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedListing = await legalListing.findByIdAndDelete(id);
    if (!deletedListing) {
      return res.status(404).send("Listing not found");
    }
    res.redirect("/listings/legal"); // Corrected redirect URL
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting listing");
  }
});

app.delete("/listings/room-sharing/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedListing = await shareListing.findByIdAndDelete(id);
    if (!deletedListing) {
      return res.status(404).send("Listing not found");
    }
    console.log(deletedListing);
    res.redirect("/listings/legal"); // Corrected redirect URL
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting listing");
  }
});

// Start server
app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});
