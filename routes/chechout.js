const router = require("express").Router()
const stripe = require("stripe")(process.env.STRIPE_KEY)
const { ensureAuthenticated } = require("../config/auth")
const sgMail = require("@sendgrid/mail")
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

//Models
const Token = require("../models/Token")

router.get("/", ensureAuthenticated, async (req, res) => {
    try {
        const publicAPIKEY = process.env.PUBLIC_KEY
        const { cart } = req.session
        let total = 0
        cart.forEach(e => {
            let sub = e.qty * e.price
            total += +sub
        })

        //Rendering Page
        res.render("cart/checkout", {
            pageName: "| Checkout",
            title: "checkout",
            showHeader: true,
            script: true,
            cart: req.session.cart,
            publicAPIKEY,
            total,
        })

    } catch (error) {
        res.status(500).json({ "error": error.message })
    }
})


//Send Stripe
router.get("/stripe-key", ensureAuthenticated, (req, res) => {
    res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});


//STRIPE POST
router.post("/pay", ensureAuthenticated, async (req, res) => {
    const { id, email, name } = req.user
    const { paymentMethodId, paymentIntentId, token } = req.body

    let total = 0
    const { cart } = req.session
    cart.forEach(e => {
        let sub = e.qty * e.price
        total += +sub
    })

    try {
        let intent

        if (paymentMethodId) {

            intent = await stripe.paymentIntents.create({
                amount: total * 100,
                currency: "usd",
                payment_method: paymentMethodId,
                confirmation_method: "manual",
                confirm: true
            })

        } else if (paymentIntentId) {

            intent = await stripe.paymentIntents.confirm(paymentIntentId);

        }

        res.send(generateResponse(intent, total, name, email, token, cart, id, req));
    } catch (e) {
        if (e.code === "authentication_required") {
            res.send({
                error:
                    "This card requires authentication in order to proceeded. Please use a different card."
            });
        } else {
            res.send({ error: e.message });
        }
    }

})


//FUNCTION
const generateResponse = (intent, price, name, email, token, cart, id, req) => {
    switch (intent.status) {
        case "requires_action":
        case "requires_source_action":
            return {
                requiresAction: true,
                clientSecret: intent.client_secret
            };
        case "requires_payment_method":
        case "requires_source":
            return {
                error: "Your card was denied, please provide a new payment method"
            };
        case "succeeded":
            console.log("💰 Payment received!");

            emailOutput(price, name, email)
            saveDataBase(cart, token, id, req)
            return { clientSecret: intent.client_secret };
    }
};

function emailOutput(price, name, email) {
    const date = new Date
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const year = date.getFullYear()
    const month = months[date.getMonth()]
    const day = date.getDate()
    const fullDate = `${month} ${day}, ${year}`

    const output = `
    <table width="100%" border="0" cellspacing="0" cellpadding="0"
        style="width:100%!important;line-height: 1.4;color: #839197;">
        <tr>
            <td align="center">
                <table width="600" border="0" cellspacing="0" cellpadding="40"
                    style="border:1px solid #eaeaea;border-radius:5px;margin:40px 0">
                    <tr>
                        <td align="center">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td width="100%">
                                        <table align="center" width="570" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td style="padding:10px 35px;">
                                                    <h1
                                                        style="color: #437789;text-align: center;font-size: 20px;margin-bottom: 20px;">
                                                        Reset Password for
                                                        <span style="color: #325a67;font-size: 23px">Pillow
                                                            Mart</span>
                                                    </h1>
                                                    <div style="color: #839197; margin-bottom: 10px;">Hello <strong
                                                            style="color: #325a67;">${name}</strong>,
                                                    </div>
                                                    <p style="color: #839197;">Thanks for your purchase from <span
                                                            style="color: #325a67;font-size: 23px;font-weight: bold;">Pillow
                                                            Mart</span>.
                                                        We feel happy to have you as a customer. These are the items
                                                        that you purchased,
                                                    </p>

                                                    <table style=" margin: 30px auto;" align="center" width="100%"
                                                        cellpadding="0" cellspacing="0">
                                                        <tr>
                                                            <td style="line-height:1px;font-size:1px;background-color:#e2e3e4"
                                                                width="100%" height="1">&nbsp;</td>
                                                        </tr>
                                                        <tr height="15">
                                                            <td style="line-height:1px;font-size:1px;color: #313131;"
                                                                width="100%" height="15">&nbsp;</td>
                                                        </tr>
                                                        <tr height="15">
                                                            <td style="line-height:1px;font-size:1px;color: #313131;"
                                                                width="100%" height="15">&nbsp;</td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <table style="min-width:250px" width="250"
                                                                    cellspacing="0" cellpadding="0" border="0"
                                                                    align="left">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td align="center">
                                                                                <div
                                                                                    style="font-family:Ariel,Helvetica,sans-serif;font-size:16px;color:#313131;text-align:left;line-height:24px;">
                                                                                    <strong
                                                                                        style="color: #325a67;">Person
                                                                                        Name:</strong><br>
                                                                                    <span
                                                                                        style="color: #839197;">${name}</span><br><br>
                                                                                    <strong
                                                                                        style="color: #325a67;">Order
                                                                                        Date:</strong><br>
                                                                                    <span style="color: #839197;">${fullDate}</span><br>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>

                                                                <table style="min-width:250px" width="250"
                                                                    cellspacing="0" cellpadding="0" border="0"
                                                                    align="right">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td align="right">
                                                                                <div
                                                                                    style="font-family:Ariel,Helvetica,sans-serif;font-size:16px;color:#313131;text-align:left;line-height:24px;">
                                                                                    <strong style="color: #325a67;">Bill
                                                                                        To:</strong><br>
                                                                                    <a href="mailto:hamaiz5502@gmail.com"
                                                                                        target="_blank"
                                                                                        style="color: #839197;">${email}</a><br><br>
                                                                                    <strong
                                                                                        style="color: #325a67;">Source:</strong><br>
                                                                                    <span
                                                                                        style="color: #839197;">Pillowmart</span><br>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                        <tr height="1">
                                                                            <td style="line-height:1px;font-size:1px"
                                                                                width="100%" height="1">&nbsp;</td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>

                                                                <tbody>
                                                                    <tr height="50">
                                                                        <td style="line-height:1px;font-size:1px" width="100%" height="10">&nbsp;</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td
                                                                            style="font-family:arial,helvetica,sans-serif;text-transform:uppercase;font-size:14px;color:#b2b2b2;text-align:left;line-height:24px">
                                                                            <div
                                                                                style="font-family:arial,helvetica,sans-serif;font-size:14px;color:#b2b2b2;text-align:left">
                                                                                <strong>HERE'S WHAT YOU
                                                                                    PAID:</strong>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                    <tr height="1">
                                                                        <td style="line-height:1px;font-size:1px;background-color:#e2e3e4"
                                                                            width="100%" height="1">&nbsp;</td>
                                                                    </tr>

                                                                    <tr height="10">
                                                                        <td style="line-height:1px;font-size:1px"
                                                                            width="100%" height="10">&nbsp;</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td align="center">

                                                                        </td>
                                                                    </tr>

                                                                    <tr height="10">
                                                                        <td style="line-height:1px;font-size:1px"
                                                                            width="100%" height="10">&nbsp;</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td align="center">
                                                                            <h2 style="color: #839197;">Amout Paid:
                                                                                <span
                                                                                    style="color: #325a67;">$${price}</span>
                                                                            </h2>
                                                                        </td>
                                                                    </tr>
                                                                    <tr height="10">
                                                                        <td style="line-height:1px;font-size:1px"
                                                                            width="100%" height="10">&nbsp;</td>
                                                                    </tr>
                                                                    <tr height="10">
                                                                        <td style="line-height:1px;font-size:1px"
                                                                            width="100%" height="10">&nbsp;</td>
                                                                    </tr>
                                                                    <tr height="10">
                                                                        <td style="line-height:1px;font-size:1px"
                                                                            width="100%" height="10">&nbsp;</td>
                                                                    </tr>

                                                                </tbody>
                                                            </td>
                                                        </tr>
                                                    </table>


                                                    <p style="color: #839197;">Thanks,<br>Pillowmart Team</p>
                                                    <table
                                                        style="margin-top: 25px;padding-top: 20px;border-top: 1px solid #E7EAEC;">
                                                        <tr>
                                                            <td>
                                                                <p class="sub" style="color: #839197;">If you didn't attempt to buy buy the
                                                                    products but
                                                                    received
                                                                    this
                                                                    email, or if the location doesn't match, pleasereply
                                                                    to this email or get in contact with us.
                                                                </p>
                                                            </td>
                                                        </tr>
                                                    </table>

                                                    <p style="font-size: 15px;text-align: center;color: #839197;">
                                                        Pillowmart, Inc.
                                                        <br>&copy; Copyrights reserved
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
    `

    const msg = {
        to: email,
        from: `PillowMart <${process.env.GM_EMAIL}>`,
        subject: "Your Pillowmart Receipt",
        html: output

    }

    sgMail
        .send(msg)

}

async function saveDataBase(cart, token, id, req) {
    let getCart = []

    cart.forEach(e => {
        const { id, qty } = e
        getCart.push({ id, qty })
    })
    const tokens = new Token({
        token,
        user: id,
        product: getCart
    })

    try {
        delete req.session.cart
        await tokens.save()
    } catch (err) {

        console.log("There was error saving token");
    }
}


module.exports = router