const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy
const User = require('../services/user');
const Bluebird = require('bluebird');


process.env.FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || "292046422188288";
process.env.FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || "5d2223d62a62f59e9194dc2bdc70688c";
process.env.BASE_URL = "https://dack-17ck1.herokuapp.com";

//google

process.env.GOOGLE_CONSUMER_KEY = process.env.GOOGLE_CONSUMER_KEY || "671680862884-m2chbv898tvh7mnfsh10b18rr74bn9ql.apps.googleusercontent.com";
process.env.GOOGLE_CONSUMER_SECRET = process.env.GOOGLE_CONSUMER_SECRET || "V9iVj15PbcxeQgze-HqTlmHF";


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CONSUMER_KEY,
    clientSecret: process.env.GOOGLE_CONSUMER_SECRET,
    callbackURL: process.env.BASE_URL + '/auth/google/callback',
},
    function (accessToken, refreshToken, profile, done) {

        // console.log(profile.id);
        User.findOne({
            where: {
                googleID: profile.id,
            }
        }).then(async function (found) {
            if (found) {
                found.googleAccessToken = accessToken;

                // console.log(found);
                return found;
            }

            const temp = {
                email: `${profile.id}@google.com`,
                googleID: profile.id,
                displayName: profile.displayName,
                googleAccessToken: accessToken,
            }
            const user = await User.createUser(temp);
            return user;
        }).asCallback(done);
    }
));
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.BASE_URL + '/auth/facebook/callback',
},
    function (accessToken, refreshToken, profile, done) {
        User.findOne({
            where: {
                facebookID: profile.id,
            }
        }).then(async function (found) {
            if (found) {
                found.facebookAccessToken = accessToken;
                return found;
            }


            const temp = {
                email: `${profile.id}@facebook.com`,
                displayName: profile.displayName,
                facebookID: profile.id,
                facebookAccessToken: accessToken,
            }
            const user = await User.createUser(temp);

            return user;
        }).asCallback(done);
    }));


passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findByPk(id).asCallback(done);
});



module.exports = passport;