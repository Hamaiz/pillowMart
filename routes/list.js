const express = require("express");
const router = express.Router()
const { ensureAuthenticated } = require("../config/auth")


router.get("/", ensureAuthenticated, (req, res) => {
    res.render("product/index", {
        pageName: "| List",
        title: "product list",
        haveAuth: false
    })
})

module.exports = router