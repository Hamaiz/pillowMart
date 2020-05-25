const router = require("express").Router()
const Product = require("../models/Product")

router.get("/", async (req, res) => {
    try {
        const product = await Product.find()
        const firstThreeProducts = await product.slice(0, 3)

        res.render("home/index", {
            pageName: "| Home",
            showHeader: true,
            firstThreeProducts
        })

    } catch {

    }

})

module.exports = router