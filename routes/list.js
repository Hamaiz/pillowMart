const express = require("express");
const router = express.Router()
const url = require("url")
const fetch = require('node-fetch');
// const { ensureAuthenticated } = require("../config/auth")

const Item = require("../models/Items")


router.get("/", async (req, res) => {
    const urlWeb = url.format({
        protocol: req.protocol,
        host: req.get("host")
    })
    const fetchUrl = urlWeb + "/api/item"
    try {
        const response = await fetch(fetchUrl)
        const data = await response.json()

        res.render("product/index", {
            pageName: "| List",
            title: "product list",
            data
        })

    } catch (error) {
        console.log(error);
    }
})

router.get("/:id", async (req, res) => {
    try {
        const detail = await Item.findById(req.params.id)

        res.render("product/details", {
            pageName: "| Details",
            title: "",
            detail
        })

    } catch (error) {
        console.log(error)
        res.redirect("/list")
    }
})

module.exports = router