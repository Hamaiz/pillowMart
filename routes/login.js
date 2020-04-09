const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const passport = require("passport")
// const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')
const sgMail = require("@sendgrid/mail")
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

//Models
const User = require("../models/User")
const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth")


router.get("/register", forwardAuthenticated, (req, res) => {
    res.render("accounts/signup", {
        pageName: "| Register",
        title: "sign up",
        // haveAuth: true
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
                                        "You are now registered, Verify email to login"
                                    )

                                    jwt.sign(
                                        {
                                            data: user._id,
                                        },
                                        process.env.EMAIL_SECRET,
                                        {
                                            expiresIn: "1d"
                                        },
                                        (err, emailToken) => {
                                            // const url = `https://pillowmart.herokuapp.com/confirmation/${emailToken}`
                                            const url = `http://localhost:3000/confirmation/${emailToken}`


                                            //?Send Grid
                                            const msg = {
                                                to: email,
                                                from: 'PillowMart Verification <pillow@mart.co>',
                                                subject: "Confirmation Email",
                                                // html: `Please click this to confirm your email: <a href="${url}">${url}</a>`
                                                html:
                                                    `
                                                <table width="100%" border="0" cellspacing="0" cellpadding="0"
                                                style="width:100%!important;line-height: 1.4;color: #839197;">
                                                <tr>
                                                    <td align="center">
                                                        <table width="600" border="0" cellspacing="0" cellpadding="40"
                                                            style="border:1px solid #eaeaea;border-radius:5px;margin:40px 0">
                                                            <tr>
                                                                <td align="center">
                                                                    <table width="100%" cellpadding="0" cellspacing="0">
                                                                        <tr>
                                                                            <td width="100%">
                                                                                <table align="center" width="570" cellpadding="0" cellspacing="0" border="0">
                                                                                    <tr>
                                                                                        <td style="padding:10px 35px;">
                                                                                            <h1
                                                                                                style="color: #8c5a89;text-align: center;font-size: 20px;margin-bottom: 20px;">
                                                                                                Verify
                                                                                                your
                                                                                                email
                                                                                                to login into
                                                                                                <span style="color: #5d3c5b;font-size: 23px">Pillow
                                                                                                    Mart</span>
                                                                                            </h1>
                                                                                            <div style="margin-bottom: 10px;">Hello <strong
                                                                                                    style="color: #5d3c5b;">${name}</strong>,
                                                                                            </div>
                                                                                            <p>Thanks for signing up for
                                                                                                <span style=" font-size: 18px;color: #5d3c5b; font-weight:
                                                                                                bold;">Pillow
                                                                                                    Mart</span>.
                                                                                                We're excited to have you as user. To complete the login
                                                                                                process,
                                                                                                please
                                                                                                click the
                                                                                                button below:
                                                                                            </p>
                                                                                            <table style=" margin: 30px auto;" align="center" width="100%"
                                                                                                cellpadding="0" cellspacing="0">
                                                                                                <tr>
                                                                                                    <td align="center">
                                                                                                        <div>
                                                                                                            <a href="${url}"
                                                                                                                style="display: inline-block;width: 200px;background-color: #8c5a89;border-radius: 3px;color: #ffffff;font-size: 15px;line-height: 45px;text-align: center;text-decoration: none;-webkit-text-size-adjust: none;mso-hide: all;margin-top: 20px;">
                                                                                                                Verify Email</a>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </table>
                                                                                            <p style="text-align: center; padding-top: 20px;">
                                                                                                Or copy and paste this URL into a new tab of your browser:
                                                                                            </p>
                                                                                            <div
                                                                                                style="word-break: break-all;margin:30px 15px 50px;text-align: center;">
                                                                                                <a href="${url}"style="text-align:center;color:#3899fa;text-decoration:none;font-size: 15px;">
                                                                                                    ${url}
                                                                                                </a>
                                                                                            </div>
                                        
                                                                                            <p>Thanks,<br>Pillowmart Team</p>
                                                                                            <table
                                                                                                style="margin-top: 25px;padding-top: 20px;border-top: 1px solid #E7EAEC;">
                                                                                                <tr>
                                                                                                    <td>
                                                                                                        <p class="sub">If you didn't attempt to log in but
                                                                                                            received
                                                                                                            this
                                                                                                            email, or if the location doesn't match, please
                                                                                                            ignore
                                                                                                            this
                                                                                                            email. If you are concerned about your account's
                                                                                                            safety,
                                                                                                            please
                                                                                                            reply to this email to get in touch with us.
                                                                                                        </p>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </table>
                                        
                                                                                            <p style="font-size: 15px;text-align: center;">
                                                                                                Pillowmart, Inc.
                                                                                                <br>&copy; Copyrights reserved
                                                                                            </p>
                                                                                        </td>
                                                                                    </tr>
                                                                                </table>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                            `

                                            }
                                            sgMail.send(msg)
                                            // (async () => {
                                            // try {
                                            // await sgMail.send(msg)
                                            // } catch (error) {
                                            // console.error(error.toString())
                                            // }
                                            // })



                                            //?Nodemailer

                                            // transporter.sendMail({
                                            // from: '"PillowMart Verification" <no-reply@pillow.mart>',
                                            // to: email,
                                            // subject: "Confirm Email",
                                            // html: `Please click this email to confirm your email: <a href="${url}">${url}</a>`
                                            // },
                                            // (err, info) => {
                                            // if (err)
                                            //    console.error(err);
                                            // else
                                            // console.log(info);
                                            // }
                                            // )
                                            //?
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
        pageName: "| Confirmation",
        title: "Validation",
        // haveAuth: true
    })
})

router.get("/login", forwardAuthenticated, (req, res) => {
    res.render("accounts/login", {
        pageName: "| Login",
        title: "Login",
        haveAuth: true
    })
})

router.post("/login", forwardAuthenticated,
    passport.authenticate('local',
        {
            successRedirect: "/list",
            failureRedirect: "/accounts/login",
            failureFlash: true
        },

    ),
)

router.delete("/logout", ensureAuthenticated, (req, res) => {
    req.logOut()
    req.flash("success_msg", "You are logged out")
    res.redirect('/accounts/login')
})

module.exports = router