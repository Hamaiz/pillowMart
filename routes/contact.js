const router = require("express").Router()

router.get("/", (req, res) => {
    res.render("contact/index", {
        title: "contact",
        pageName: "| Contact"
    })
})

module.exports = router