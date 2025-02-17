module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in');
        return res.redirect('/login');
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    const listing = await (req.baseUrl.includes('legal') ? legalListing : shareListing).findById(id);
    if (!listing.owner.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/listings/${req.baseUrl.includes('legal') ? 'legal' : 'room-sharing'}`);
    }
    next();
};
