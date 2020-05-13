const express = require("express");
const router = express.Router()
// const { ensureAuthenticated } = require("../config/auth")
const Product = require("../models/Product")


router.get("/", async (req, res) => {
    let query = Product.find()

    if (req.query.search != null && req.query.search != "") {
        query = query.regex("title", new RegExp(req.query.search, "i"))
    }

    query.sort(req.query.items)
    try {
        const p = await query.exec()
        res.render("product/index", {
            pageName: "| List",
            title: "product list",
            showHeader: true,
            pageName: "| admin",
            p,
            searchOptions: req.query.search
        })
    } catch{
        res.redirect("back")
    }
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