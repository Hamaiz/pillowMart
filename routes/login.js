const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const passport = require("passport")

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
                                    res.redirect("login")
                                })
                                .catch(err => console.log(err))
                        })
                    })
                }
            })
    }

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