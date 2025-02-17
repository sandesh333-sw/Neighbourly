const Community = require('../models/community');
const Post = require('../models/post');
const Comment = require('../models/comment');

// Define all controller methods as separate constants first
const index = async (req, res) => {
    try {
        const communities = await Community.find({}).populate('owner');
        res.render('community/index', { communities });
    } catch (error) {
        req.flash('error', 'Cannot load communities');
        res.redirect('/');
    }
};

const renderNewForm = (req, res) => {
    res.render('community/new');
};

const createCommunity = async (req, res) => {
    try {
        const community = new Community(req.body.community);
        community.owner = req.user._id;
        await community.save();
        req.flash('success', 'New Community Created');
        res.redirect(`/community/${community._id}`);
    } catch (error) {
        req.flash('error', 'Error creating community');
        res.redirect('/community');
    }
};

const showCommunity = async (req, res) => {
    try {
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
        if (!community) {
            req.flash('error', 'Community not found');
            return res.redirect('/community');
        }
        res.render('community/show', { community });
    } catch (error) {
        req.flash('error', 'Error finding community');
        res.redirect('/community');
    }
};

const createPost = async (req, res) => {
    try {
        const { id } = req.params;
        const community = await Community.findById(id);
        const post = new Post(req.body.post);
        post.author = req.user._id;
        community.posts.push(post);
        await post.save();
        await community.save();
        req.flash('success', 'New Post Created');
        res.redirect(`/community/${id}`);
    } catch (error) {
        req.flash('error', 'Error creating post');
        res.redirect(`/community/${req.params.id}`);
    }
};

const createComment = async (req, res) => {
    try {
        const { id, postId } = req.params;
        const post = await Post.findById(postId);
        const comment = new Comment(req.body.comment);
        comment.author = req.user._id;
        post.comments.push(comment);
        await comment.save();
        await post.save();
        req.flash('success', 'New Comment Added');
        res.redirect(`/community/${id}`);
    } catch (error) {
        req.flash('error', 'Error creating comment');
        res.redirect(`/community/${req.params.id}`);
    }
};

const likePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await Post.findById(postId);
        post.likes += 1;
        await post.save();
        res.json({ likes: post.likes });
    } catch (error) {
        res.status(500).json({ error: 'Error liking post' });
    }
};

// Export all controller methods
module.exports = {
    index,
    renderNewForm,
    createCommunity,
    showCommunity,
    createPost,
    createComment,
    likePost
};
