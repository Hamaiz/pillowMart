const express = require("express");
const router = express.Router()
// const { ensureAuthenticated } = require("../config/auth")



router.get("/", (req, res) => {
    res.render("about/about", {
        title: "about",
        pageName: "| About",
        haveAuth: false
    })
})

module.exports = router