const LocalStrategy = require("passport-local").Strategy;
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require("bcryptjs")

const User = require("../models/User")


function initialize(passport) {
    const authenticateUser = async (email, password, done) => {
        User.findOne({ email: email })
            .then(user => {
                if (!user) {
                    return done(null, false, { message: "This email is not registered" })
                }

                if (user.confirmed === false) {
                    return done(null, false, { message: "Please Verify your account" })
                }

                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) throw err;
                    if (isMatch) {
                        return done(null, user)
                    } else {
                        return done(null, false, { message: "Password incorrect" })
                    }
                })

            })
    }
    passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser))
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(null, user)
        })
    })

    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "https://pillowmart.herokuapp.com/accounts/google/callback"
    },
        async (accessToken, refreshToken, profile, done) => {
            process.nextTick(function () {
                User.findOne({
                    $or: [
                        { "google.id": profile.id },
                        { 'email': profile._json.email }
                    ]
                }, (err, user) => {
                    if (err) return done(err)

                    //If email is Registedred
                    if (user) {
                        if (user.google.id === undefined) {
                            user.google.id = profile.id
                            user.google.token = accessToken
                            user.google.email = profile._json.email
                            user.google.name = profile._json.name
                            user.save()
                        }
                        return done(null, user)
                    } else {
                        //If Email is not registered 

                        let newUser = new User()
                        newUser.name = profile._json.name
                        newUser.email = profile._json.email
                        newUser.admin = 0
                        newUser.confirmed = true
                        newUser.google.id = profile.id
                        newUser.google.token = accessToken
                        newUser.google.email = profile._json.email
                        newUser.google.name = profile._json.name

                        newUser.save(err => {
                            if (err) throw err
                        })

                        return done(null, newUser)
                    }
                })
            })
        }
    ));
}

module.exports = initialize
