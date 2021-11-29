var dotenv = require('dotenv');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var GitHubStrategy = require('passport-github').Strategy;
const passport = require('passport');
const bcrypt = require('bcryptjs');
dotenv.config({ path: './config.env' })

const { knex, generateAuthToken, generateNewAuthToken } = require('./db/conn')



passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "http://localhost:8000/auth/github/callback",
  //passReqToCallback : true ,
  // scope: [ 'user:email' ],

},
  async function (accessToken, refreshToken, profile, done) {
    const name = profile.username;
    const token = profile.id;
    const email = profile.username + '@gmail.com';
    var token1 = "";
    var newId = 0;

    try {
      const user = await knex('rbac.users').where('email', `${email}`)
      console.log(user.length);

      if (user.length === 0) {
        console.log("ready to inesert");
        const newPassword = await bcrypt.hash(token, 6);;
        const result = await knex('rbac.users').insert({ name: `${name}`, email: `${email}`, password: `${newPassword}` })
          .returning("id")
          .then(async (id) => {
            console.log("make_id = " + id);
            newId = id;
            const date = new Date();
            const str = new Date().toISOString().slice(0, 10);

            const text2 = await knex('rbac.userroles').insert({ user_id: `${id}`, role_id: 2, assignment_date: `${str}` });
          })
        //console.log(result);

        token1 = await generateNewAuthToken(newId);
        console.log("Token inserted successfully ", token1);
      }

      else {
        console.log("User Found");
        token1 = await generateAuthToken(user);
        console.log("Token updated user already present ", token1);
      }


    } catch (error) {
      console.log(error);
    }

    return done(null, token1)
  }

));


passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
},

  async function (accessToken, refreshToken, profile, done) {

    const email = profile.emails[0].value;
    const name = profile.displayName;
    const token = profile.id;
    var token1 = "";
    var newId = 0;

    try {
      const user = await knex('rbac.users').where('email', `${email}`)
      console.log(user.length);

      if (user.length === 0) {
        console.log("ready to inesert");
        const newPassword = await bcrypt.hash(token, 6);;
        const result = await knex('rbac.users').insert({ name: `${name}`, email: `${email}`, password: `${newPassword}` })
          .returning("id")
          .then(async (id) => {
            console.log("make_id = " + id);
            newId = id;
            const date = new Date();
            const str = new Date().toISOString().slice(0, 10);

            const text2 = await knex('rbac.userroles').insert({ user_id: `${id}`, role_id: 2, assignment_date: `${str}` });
          })
        //console.log(result);

        token1 = await generateNewAuthToken(newId);
        console.log("Token inserted successfully ", token1);
      }

      else {
        console.log("User Found");
        token1 = await generateAuthToken(user);
        console.log("Token updated user already present ", token1);
      }


    } catch (error) {
      console.log(error);
    }

    return done(null, token1)
  }));

passport.serializeUser((user, done) => {
  done(null, user);
})

passport.deserializeUser((user, done) => {
  done(null, user);
})