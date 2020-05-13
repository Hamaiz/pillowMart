const router = require("express").Router()
const jwt = require("jsonwebtoken")
const User = require("../models/User")

router.get("/:token", async (req, res) => {
    try {
        const { data } = jwt.verify(req.params.token, process.env.EMAIL_SECRET)
        // await User.update({ confirmed: true }, { where: { data } })
        await User.updateOne({ _id: data }, {
            $set: { confirmed: true },
        })
    } catch (error) {
        res.send("error")
    }
    return res.redirect('/accounts/login')
})

module.exports = router