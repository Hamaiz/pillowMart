const router = require("express").Router()
// const { ensureAuthenticated } = require("../config/auth")


router.get("/", (req, res) => {
    res.render("home/index", {
        pageName: "| Home",
        // haveAuth: false
    })
})

module.exports = router