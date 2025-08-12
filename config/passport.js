const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({
      usernameField: 'email'
    }, async (email, password, done) => {
      try {
        const user = await User.findOne({
          where: { email: email.toLowerCase() }
        });
        if (!user) {
          return done(null, false, { message: '无效的邮箱或密码' });
        }
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
          return done(null, false, { message: '无效的邮箱或密码' });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findByPk(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
}