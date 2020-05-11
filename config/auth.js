module.exports = {
    ensureAuthenticated: function (req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }
        req.flash("error_msg", "Please log in to view that resource")
        res.redirect("/accounts/login")
    },
    forwardAuthenticated: function (req, res, next) {
        if (!req.isAuthenticated()) {
            return next()
        }
        res.redirect("/")
    },
    isHolder: function (req, res, next) {
        if (req.isAuthenticated() && res.locals.user.admin === 1) {
            next()
        } else {
            res.status(400).send('Bad Request' + `
                <script>
                    setTimeout(() => {
                        window.location = "/"
                    }, 2000);
                </script>
            `)
        }
    }
}

// exports.resetPassword = (req, res) => {
//     User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires:{$gt: Date.now()}})
//     .then((user) => {
//         if(!user){

//         }

//         user.password
//     })
// }
