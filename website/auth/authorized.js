const authorized = (scopes) => (req, res, next) => {
    if (req.user) {
        return next();
    }

    req.session.returnTo = req.originalUrl;
    res.redirect("/auth/login");
};

module.exports = authorized;