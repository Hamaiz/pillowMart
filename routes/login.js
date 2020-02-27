const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const passport = require("passport")
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')

//Models
const User = require("../models/User")
const { forwardAuthenticated } = require("../config/auth")


router.get("/register", forwardAuthenticated, (req, res) => {
    res.render("accounts/signup", {
        title: "sign up"
    })
})
router.post("/register", forwardAuthenticated, (req, res) => {
    const { name, email, password } = req.body
    let errors = []

    if (!name || !email || !password) {
        errors.push({ msg: "Please enter all fields" })
    }
    if (password.length < 6) {
        errors.push({ msg: "Password must be atleast 6 characters" })
    }

    if (errors.length > 0) {
        res.render("accounts/signup", {
            title: "sign up",
            errors,
            name,
            email,
            password
        })
    } else {
        User.findOne({ email: email })
            .then(user => {
                if (user) {
                    errors.push({ msg: "Email already exists" })
                    res.render("accounts/signup", {
                        title: "sign up",
                        errors,
                        name,
                        email,
                        password
                    })
                } else {

                    const newUser = new User({
                        name,
                        email,
                        password
                    })
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) {
                                throw err
                            }
                            newUser.password = hash;
                            newUser
                                .save()
                                .then(user => {
                                    req.flash(
                                        "success_msg",
                                        "You are now registered and can log in"
                                    )
                                    const transporter = nodemailer.createTransport({
                                        service: "gmail",
                                        auth: {
                                            user: process.env.GMAIL_USER,
                                            pass: process.env.GMAIL_PASS
                                        },
                                        tls: {
                                            rejectUnauthorized: false
                                        }
                                    })

                                    jwt.sign(
                                        {
                                            data: user._id,
                                        },
                                        process.env.EMAIL_SECRET,
                                        {
                                            expiresIn: "1d"
                                        },
                                        (err, emailToken) => {
                                            const url = `http://localhost:3000/confirmation/${emailToken}`

                                            // const url = `https://pillowmart.herokuapp.com/confirmation/${emailToken}`

                                            transporter.sendMail({
                                                from: '"PillowMart Verification" <workingeveryday2@gmail.com>',
                                                to: email,
                                                subject: "Confirm Email",
                                                html: `Please click this email to confirm your email: <a href="${url}">${url}</a>`
                                            },
                                                (err, info) => {
                                                    if (err)
                                                        console.log(err);
                                                    else
                                                        console.log(info);
                                                }
                                            )
                                        })

                                    res.redirect("confirm")
                                })
                                .catch(err => console.log(err))
                        })
                    })
                }
            })
    }

})

router.get('/confirm', forwardAuthenticated, (req, res) => {
    res.render('accounts/check', {
        title: "Validation"
    })
})

router.get("/login", forwardAuthenticated, (req, res) => {
    res.render("accounts/login", {
        title: "Login"
    })
})

router.post("/login", forwardAuthenticated,
    passport.authenticate('local',
        {
            successRedirect: "/home",
            failureRedirect: "/accounts/login",
            failureFlash: true
        },

    ),
)

router.delete("/logout", (req, res) => {
    req.logOut()
    req.flash("success_msg", "You are logged out")
    res.redirect('/accounts/login')
})

module.exports = router