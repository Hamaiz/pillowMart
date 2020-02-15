const express = require("express");
const router = express.Router()

router.get("/", (req, res) => {
    res.render("product/index", {
        name: "product list"
    })
})

module.exports = router