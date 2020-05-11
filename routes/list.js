const express = require("express");
const router = express.Router()
// const { ensureAuthenticated } = require("../config/auth")
const Product = require("../models/Product")


router.get("/", (req, res) => {
    Product.find({}).sort(req.query.items).exec((err, p) => {
        res.render("product/index", {
            pageName: "| List",
            title: "product list",
            showHeader: true,
            pageName: "| admin",
            p
        })
    })
})

router.get("/:slug", (req, res) => {
    const { slug } = req.params

    Product.findOne({ slug: slug }, (err, p) => {
        res.render("product/details", {
            pageName: "| Details",
            title: "",
            showHeader: true,
            p
        })
    })

})

module.exports = router