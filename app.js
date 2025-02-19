require('dotenv').config();

// Add this check after dotenv config
if (!process.env.DEEPSEEK_API_KEY) {
    console.error("ERROR: DEEPSEEK_API_KEY is not set in environment variables");
    process.exit(1);
}

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
const Community = require('./models/community.js');
const Post = require('./models/post.js');
const Comment = require('./models/comment.js');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const { isLoggedIn, isOwner } = require('./middleware/auth');

// Route imports
const userRoutes = require('./routes/users');
const communityRoutes = require('./routes/communities');
const chatRoutes = require('./routes/chat');

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

// Passport Configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Current User Middleware
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// Routes
app.get('/', async (req, res) => {
    try {
        // Fetch the 3 most recent listings
        const recentListings = await legalListing.find({})
            .sort({ createdAt: -1 })
            .limit(3)
            .populate('owner');
        
        res.render('index', { recentListings });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Something went wrong');
        res.redirect('/listings/legal');
    }
});

app.get("/listings", (req, res) => {
    res.render("listings/index");
});

// Legal Listings
app.get("/listings/legal", async (req, res) => {
    try {
        const allListings = await legalListing.find({})
            .populate('owner')
            .sort({ createdAt: -1 }); // Sort by newest first
        res.render("listings/legal", { allListings });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error loading listings');
        res.redirect('/');
    }
});

// Room Sharing Listings
app.get("/listings/room-sharing", async (req, res) => {
    const allListings = await shareListing.find({});
    res.render("listings/room-sharing", { allListings });
});

// Create New Listings - require login
app.get("/listings/legal/new", isLoggedIn, (req, res) => {
    res.render("listings/newL");
});

app.post("/listings/legal/new", isLoggedIn, async (req, res) => {
    try {
        const { error } = listingSchema.validate(req.body);
        if (error) {
            req.flash('error', error.details.map(err => err.message).join(", "));
            return res.redirect('/listings/legal/new');
        }
        const newListing = new legalListing(req.body.listing);
        newListing.owner = req.user._id;  // Set the owner
        await newListing.save();
        req.flash("success", "Successfully created new listing!");
        res.redirect(`/listings/legal/${newListing._id}`);
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error creating listing');
        res.redirect('/listings/legal/new');
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

// Edit Listings - require login and ownership
app.get("/listings/legal/:id/edit", isLoggedIn, isOwner, async (req, res) => {
    const { id } = req.params;
    const listing = await legalListing.findById(id);
    res.render("listings/editL", { listing });
});

app.put("/listings/legal/:id", isLoggedIn, isOwner, async (req, res) => {
    const { id } = req.params;
    const updatedListing = await legalListing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });
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
    try {
        const { id } = req.params;
        const listing = await legalListing.findById(id).populate('owner');
        if (!listing) {
            req.flash('error', 'Cannot find that listing');
            return res.redirect('/listings/legal');
        }
        res.render("listings/showL", { listing });
    } catch (err) {
        req.flash('error', 'Cannot find that listing');
        res.redirect('/listings/legal');
    }
});

app.get("/listings/room-sharing/:id", async (req, res) => {
    const { id } = req.params;
    const listing = await shareListing.findById(id);
    if (!listing) {
        return res.status(404).send("Room-sharing listing not found");
    }
    res.render("listings/showS", { listing });
});

// Delete Listings - require login and ownership
app.delete("/listings/legal/:id", isLoggedIn, isOwner, async (req, res) => {
    const { id } = req.params;
    await legalListing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted");
    res.redirect("/listings/legal");
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

// Community Routes
app.get("/community", async (req, res) => {
    const communities = await Community.find({}).populate('owner');
    res.render("community/index", { communities });
});

app.get("/community/new", (req, res) => {
    res.render("community/new");
});

app.post("/community/new", async (req, res) => {
    try {
        const community = new Community(req.body.community);
        // TODO: Set owner from authenticated user
        await community.save();
        req.flash("success", "New Community Created");
        res.redirect(`/community/${community._id}`);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error creating community");
    }
});

app.get("/community/:id", async (req, res) => {
    const { id } = req.params;
    const community = await Community.findById(id)
        .populate('owner')
        .populate({
            path: 'posts',
            populate: {
                path: 'author comments',
                populate: {
                    path: 'author'
                }
            }
        });
    res.render("community/show", { community });
});

// Post Routes
app.post("/community/:id/posts", async (req, res) => {
    const { id } = req.params;
    const community = await Community.findById(id);
    const post = new Post(req.body.post);
    // TODO: Set author from authenticated user
    community.posts.push(post);
    await post.save();
    await community.save();
    req.flash("success", "New Post Created");
    res.redirect(`/community/${id}`);
});

// Comment Routes
app.post("/community/:id/posts/:postId/comments", async (req, res) => {
    const { id, postId } = req.params;
    const post = await Post.findById(postId);
    const comment = new Comment(req.body.comment);
    // TODO: Set author from authenticated user
    post.comments.push(comment);
    await comment.save();
    await post.save();
    req.flash("success", "New Comment Added");
    res.redirect(`/community/${id}`);
});

// Like/Unlike Post
app.post("/community/:id/posts/:postId/like", async (req, res) => {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    // TODO: Toggle like based on authenticated user
    post.likes += 1;
    await post.save();
    res.json({ likes: post.likes });
});

// Routes
app.use('/', userRoutes);
app.use('/community', communityRoutes);
app.use('/chat', chatRoutes);

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

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
};
