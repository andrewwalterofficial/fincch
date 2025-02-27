const passport = require('passport');
const { Strategy }  = require('passport-local');
const User = require('../mongodb/schema/user');




// Configure Passport to use the LocalStrategy

passport.use('login', new Strategy(
  {
    usernameField: 'acctNum',
    passwordField: 'passwordd',
  },
  async (username, password, done) => {
    console.log(username);
    console.log(password);
    try {
      if (!username || !password) {
        done(new Error ("Your credentials are not valid"))
      }

      const user = await User.findOne({ accountNumber: username });

      if (!user) {
        throw new Error('User not found')
      }

      if (password === user.password) {
        console.log('Authenticated Successfully');
        return done(null, user);
      } else {
        console.log('Invalid Authentication');
        return done(null, false);
      }
    } catch (err) {
      console.log(err);
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => {
  console.log('Serializing user');
  console.log(user)
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then((user) => {
      console.log("deserialiizing")
    
      done(null, user);
    })
    .catch((err) => done(err));
});
