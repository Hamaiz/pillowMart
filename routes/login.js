const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const passport = require("passport")
const url = require('url')
const jwt = require('jsonwebtoken')
const sgMail = require("@sendgrid/mail")
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

//Models
const User = require("../models/User")
const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth")


//*============Register============*//

/*
 * GET REGISTER
 */
router.get("/register", forwardAuthenticated, (req, res) => {
    res.render("accounts/signup", {
        pageName: "| Register",
        title: "sign up",
        showHeader: true,
        // haveAuth: true
    })
})

/*
 * POST REGISTER
 */
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
            pageName: "| Register",
            showHeader: true,
            user: null,
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
                        pageName: "| Register",
                        title: "sign up",
                        showHeader: true,
                        errors,
                        name,
                        email,
                        password
                    })
                } else {

                    const newUser = new User({
                        name,
                        email,
                        password,
                        admin: 0
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
                                            const otherUrl = url.format({
                                                protocol: req.protocol,
                                                host: req.get('host'),
                                            });
                                            const urls = `${otherUrl}/confirmation/${emailToken}`
                                            // console.log(urls);


                                            const output = `
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
                                                                                            style="color: #437789;text-align: center;font-size: 20px;margin-bottom: 20px;">
                                                                                            Verify
                                                                                            your
                                                                                            email
                                                                                            to login into
                                                                                            <span style="color: #325a67;font-size: 23px">Pillow
                                                                                                Mart</span>
                                                                                        </h1>
                                                                                        <div style="color: #839197; margin-bottom: 10px;">Hello <strong
                                                                                                style="color: #325a67;">${name}</strong>,
                                                                                        </div>
                                                                                        <p>Thanks for signing up for
                                                                                            <span style=" font-size: 18px;color: #325a67; font-weight:
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
                                                                                                        <a href="${urls}"
                                                                                                            style="display: inline-block;width: 200px;background-color: #325a67;border-radius: 3px;color: #ffffff;font-size: 15px;line-height: 45px;text-align: center;text-decoration: none;-webkit-text-size-adjust: none;mso-hide: all;margin-top: 20px;">
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
                                                                                            <a href="${urls}" style="text-align:center;color:#3899fa;text-decoration:none;font-size: 15px;">
                                                                                                ${urls}
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
                                        </table>`

                                            //?Send Grid
                                            const msg = {
                                                to: email,
                                                from: 'PillowMart <thanksdearofficial@gmail.com>',
                                                subject: "Confirmation Email",
                                                html: output

                                            }
                                            sgMail.send(msg)
                                                .then(() => {
                                                    req.flash("success_msg", "You are now registered, Verify email to login")
                                                    res.redirect("/accounts/login")
                                                }, error => {
                                                    console.log(error)
                                                    if (error.response) {
                                                        const errorMessages = [{ msg: "There was an error" }]
                                                        res.render("accounts/signup", {
                                                            title: "sign up",
                                                            pageName: "| Register",
                                                            showHeader: true,
                                                            errors: errorMessages,
                                                            name,
                                                            email,
                                                            password
                                                        })
                                                    }
                                                });



                                            // req.flash("success_msg", "You are now registered, Verify email to login")
                                            // res.redirect("/accounts/login")
                                        })

                                })
                                .catch(err => console.log(err))
                        })
                    })
                }
            })
    }

})


//*============LOGIN============*//

/*
* GET LOGIN
*/
router.get("/login", forwardAuthenticated, (req, res) => {
    res.render("accounts/login", {
        pageName: "| Login",
        title: "Login",
        haveAuth: true,
        showHeader: true
    })
})
/*
 * POST LOGIn
 */
router.post("/login", forwardAuthenticated,
    passport.authenticate('local',
        {
            successRedirect: "/",
            failureRedirect: "/accounts/login",
            failureFlash: true
        },

    ),
)

//*============LOGIN============*//

router.delete("/logout", (req, res) => {
    req.logOut()
    delete req.session.cart
    req.flash("success_msg", "You are logged out")
    res.redirect('/accounts/login')
})

module.exports = router