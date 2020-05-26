const router = require("express").Router()
const { check, validationResult } = require('express-validator');
const Contact = require("../models/Contact")


router.get("/", (req, res) => {
    const name = ""
    const email = ""
    const phone = ""
    const message = ""

    res.render("contact/index", {
        title: "contact",
        pageName: "| Contact",
        showHeader: true,
        name,
        email,
        phone,
        message
    })
})

router.post("/", [
    check("name", "Please provide a name").notEmpty(),
    check("email", "Please provide a correct email").isEmail(),
    check("phone", "Please provide a correct phone Number").isMobilePhone(),
    check("message", "Message is also required").notEmpty(),
], async (req, res) => {
    const { name, email, phone, message } = req.body

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        let errorsArray = []

        errors.errors.forEach(element => {
            errorsArray.push({ msg: element.msg })
            console.log(element.msg);

        });

        res.render("contact/index", {
            title: "contact",
            pageName: "| Contact",
            showHeader: true,
            errors: errorsArray,
            user: null,
            name,
            email,
            phone,
            message
        })
    } else {
        try {
            const contact = new Contact({
                name,
                email,
                phone,
                message
            })

            await contact.save()

            req.flash("success_msg", "You Message has been recieved. We will contact you soon.")
            res.redirect("/contact")
        } catch (error) {
            req.flash("error_msg", "An error occured while sending message.")
            res.redirect("/contact")
        }
    }

})

module.exports = router