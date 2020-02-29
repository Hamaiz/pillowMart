const router = require("express").Router()
const { ensureAuthenticated } = require("../config/auth")


router.get("/", ensureAuthenticated, (req, res) => {
    res.render("home/index", {
        pageName: "| Home",
        haveAuth: false
    })
})

module.exports = router