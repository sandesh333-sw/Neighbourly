require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const legalListing = require('./models/legalListing.js');
const shareListing = require('./models/shareListing.js');
const path = require('path');
const methodOverride = require('method-override');
const { listingSchema } = require("./schema.js");
const ExpressError = require("./utils/expressError.js");
const flash = require('connect-flash');


const app = express();

// Database Connection
const dbUrl = process.env.MONGODB_URI;
async function main() {
    try {
        await mongoose.connect(dbUrl);
        console.log("Connected to DB");
    } catch (err) {
        console.error("Database connection error:", err);
    }
}
main();

// Middleware
app.use(express.static('views/public')); 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const sessionOptions = {
    secret: "dfadsfd34",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    },
};

// Session Configuration
app.use(session(sessionOptions));
app.use(flash());
 
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    next();
})

// Routes
app.get("/", (req, res) => {
    res.render("index");
});

app.get("/listings", (req, res) => {
    res.render("listings/index");
});

// Legal Listings
app.get("/listings/legal", async (req, res) => {
    const allListings = await legalListing.find({});
    res.render("listings/legal", { allListings });
});

// Room Sharing Listings
app.get("/listings/room-sharing", async (req, res) => {
    const allListings = await shareListing.find({});
    res.render("listings/room-sharing", { allListings });
});

// Create New Listings
app.get("/listings/legal/new", (req, res) => {
    res.render("listings/newL");
});

app.post("/listings/legal/new", async (req, res) => {
    try {
        const { error } = listingSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details.map(err => err.message).join(", ") });
        }
        const newListing = new legalListing(req.body.listing);
        await newListing.save();
        req.flash("success", "New Listing Created");
        res.redirect("/listings/legal");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error creating listing");
    }
});

// Room Sharing Listings (with Validation)
app.get("/listings/room-sharing/new", (req, res) => {
    res.render("listings/newS");
});

app.post("/listings/room-sharing/new", async (req, res) => {
    try {
        const { error } = listingSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details.map(err => err.message).join(", ") });
        }
        const newListing = new shareListing(req.body.listing);
        await newListing.save();
        req.flash("success", "New Listing Created");
        res.redirect("/listings/room-sharing");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error creating room-sharing listing");
    }
});

// Edit Listings
app.get("/listings/legal/:id/edit", async (req, res) => {
    const { id } = req.params;
    const listing = await legalListing.findById(id);
    if (!listing) {
        return res.status(404).send("Listing not found");
    }
    res.render("listings/editL", { listing });
});

app.put("/listings/legal/:id", async (req, res) => {
    const { id } = req.params;
    const updatedListing = await legalListing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });
    if (!updatedListing) {
        return res.status(404).send("Listing not found");
    }
    req.flash("success", "Listing Edited");
    res.redirect(`/listings/legal/${id}`);
});

// Room Sharing Edit
app.get("/listings/room-sharing/:id/edit", async (req, res) => {
    const { id } = req.params;
    const listing = await shareListing.findById(id);
    if (!listing) {
        return res.status(404).send("Listing not found");
    }
    res.render("listings/editS", { listing });
});

app.put("/listings/room-sharing/:id", async (req, res) => {
    const { id } = req.params;
    const updatedListing = await shareListing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });
    if (!updatedListing) {
        return res.status(404).send("Listing not found");
    }
    req.flash("success", "Listing Edited");
    res.redirect(`/listings/room-sharing/${id}`);
});

// Listing Details
app.get("/listings/legal/:id", async (req, res) => {
    const { id } = req.params;
    const listing = await legalListing.findById(id);
    if (!listing) {
        return res.status(404).send("Legal listing not found");
    }
    res.render("listings/showL", { listing });
});

app.get("/listings/room-sharing/:id", async (req, res) => {
    const { id } = req.params;
    const listing = await shareListing.findById(id);
    if (!listing) {
        return res.status(404).send("Room-sharing listing not found");
    }
    res.render("listings/showS", { listing });
});

// Delete Listings
app.delete("/listings/legal/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deletedListing = await legalListing.findByIdAndDelete(id);
        if (!deletedListing) {
            return res.status(404).send("Listing not found");
        }
        req.flash("success", " Listing Deleted");
        res.redirect("/listings/legal");
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
        req.flash("success", " Listing Deleted");
        res.redirect("/listings/room-sharing");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error deleting listing");
    }
});

//Errors
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});


app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.render("error.ejs", {message});
});

// Start server
app.listen(8080, () => {
    console.log("Server is listening on port 8080");
});
