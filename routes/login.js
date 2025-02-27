const { Router } = require('express')

const User = require('../mongodb/schema/user');
const passport = require('passport');
const mongoose = require("mongoose")

require("../stra/logics")

const router = Router();

var errors = [];

router.get('/', function (req, res) {

        res.render('login', { layout: "login"});
});

router.post('/user', (req, res, next) => {
  passport.authenticate('login', (err, user, info) => {
    if (err) {
      // Handle any errors that occurred during authentication
      return next(err);
    }
    
    if (!user) {
      // Authentication failed, user not found or credentials are incorrect
      const errorMessage = 'Authentication failed';
      return res.render('error', { layout: 'userdashboard', errorMessage }); // Render an error page
    }

    // If authentication was successful, log in the user using req.login
    req.login(user, (err) => {
      if (err) {
        // Handle any errors that occurred during the login process
        return next(err);
      }

      // Authentication was successful, redirect to the dashboard
      return res.redirect('/dashboard');
    });
  })(req, res, next);
});






module.exports = router;
