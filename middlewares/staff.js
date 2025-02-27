const UserRequest = require('../services/userRequest');

module.exports = async function staff(req, res, next) {
    res.locals.staffNotification = null;
    res.locals.staffNotificationCount = 0;

    if (req.currentUser && req.currentUser.permisstion == 1) {
        res.locals.staffNotification = await UserRequest.findAll({
            order: [['createdAt', 'DESC']]
        })
        res.locals.staffNotificationCount = res.locals.staffNotification.length;
        return next();
    }


    return next();
}