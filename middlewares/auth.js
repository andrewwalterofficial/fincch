const User = require('../mongodb/schema/user');
const AccountInfo = require('../mongodb/schema/accountinfo');

module.exports = async function auth(req, res, next) {
    const userID = req.session.userID || null;
    res.locals.currentUser = req.user || null;
    req.currentUser = req.user || null;

    let accountInfo = null;

    if (req.currentUser) {
        accountInfo = await AccountInfo.findOne({ userID: req.currentUser.id });
    }

    if (!userID) {
        return next();
    }

    try {
        const user = await User.findById(userID);

        if (!user) {
            return next();
        }

        accountInfo = await AccountInfo.findOne({ userID: user.id });
        req.currentUser = user;
        res.locals.currentUser = user;
        return next();
    } catch (error) {
        console.error(error);
        return next();
    }
};
