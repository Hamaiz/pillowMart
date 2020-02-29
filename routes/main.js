const router = require("express").Router()
const { forwardAuthenticated } = require("../config/auth")

router.get("/", forwardAuthenticated, (req, res) => {
    res.render("main/index", {
        pageName: "",
        haveAuth: true
    })
})

module.exports = router