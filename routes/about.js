const express = require("express");
const router = express.Router()
const { ensureAuthenticated } = require("../config/auth")



router.get("/", ensureAuthenticated, (req, res) => {
    res.render("about/about", {
        title: "about"
    })
})

module.exports = router