const express = require("express");
const router = express.Router()
const url = require("url")
const fetch = require('node-fetch');
// const { ensureAuthenticated } = require("../config/auth")


router.get("/", async (req, res) => {
    const urlWeb = url.format({
        protocol: req.protocol,
        host: req.get("host")
    })
    const fetchUrl = urlWeb + "/api/item"
    try {
        const response = await fetch(fetchUrl)
        const data = await response.json()
        // console.log(data)

        res.render("product/index", {
            pageName: "| List",
            title: "product list",
            haveAuth: false,
            data,
            urlWeb

        })

    } catch (error) {
        console.log(error);
    }
})

router.get("/:id", async (req, res) => {
    console.log(req.params.id)
})

module.exports = router