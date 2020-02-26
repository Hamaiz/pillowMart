const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs")

const User = require("../models/User")


function initialize(passport) {
    const authenticateUser = async (email, password, done) => {
        User.findOne({ email: email })
            .then(user => {
                if (!user) {
                    return done(null, false, { message: "This email is not registered" })
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
            done(err, user)
        })
    })

    // passport.serializeUser((user, done) => {
    //     var createAccessToken = function () {
    //         var token = user.generateRandomToken()
    //         User.findOne({ accessToken: token }, (err, existingUser) => {
    //             if (err) { return done(err) };
    //             if (existingUser) {
    //                 createAccessToken()
    //             } else {
    //                 user.set('accessToken', token)
    //                 user.save((err) => {
    //                     if (err) return done(err)
    //                     return done(null, user.get('accessToken'))
    //                 })
    //             }
    //         })
    //     }

    //     if (user._id) {
    //         createAccessToken();
    //     }
    // })

    // passport.deserializeUser((token, done) => {
    //     User.findOne({ accessToken: token }, (err, user) => {
    //         done(err, user)
    //     })
    // })
}

module.exports = initialize