const router = require("express").Router()

const Product = require("../models/Product")

router.get("/", (req, res) => {
    if (req.session.cart && req.session.cart.length === 0) {
        delete req.session.cart
        res.redirect("/cart")
    } else {
        res.render("cart/index", {
            pageName: "| Cart",
            title: "cart",
            showHeader: true,
            cart: req.session.cart
        })
    }
})

router.get("/add/:id", async (req, res) => {
    const { id } = req.params
    const { qty } = req.query

    const quantity = (!qty) ? 1 : qty

    await Product.findById(id, (err, p) => {
        if (err)
            console.log(err)


        if (typeof req.session.cart === "undefined") {
            req.session.cart = []
            req.session.cart.push({
                id: p._id,
                title: p.title,
                qty: quantity,
                price: p.price,
                img_url: p.img_url,
            })
            req.flash("success_msg", "Product added to cart")

        } else {
            const { cart } = req.session

            let newItem = true
            for (let i = 0; i < cart.length; i++) {
                if (cart[i].id == id) {
                    newItem = false
                    req.flash("error_msg", "Already added to cart")
                    break;
                }
            }

            if (newItem) {
                cart.push({
                    id: p._id,
                    title: p.title,
                    qty: quantity,
                    price: p.price,
                    img_url: p.img_url,
                })
                req.flash("success_msg", "Product added to cart")

            }
        }
        console.log(req.session.cart)
        res.redirect("back")
    })

})


// router.get("/clear/:id", (req, res) => {
//     console.log(req.params.id)
//     const { id } = req.params
//     const { cart } = req.session

//     cart.forEach((element, index, object) => {
//         if (id === element.id) {
//             object.splice(index, 1)
//         }
//     });
//     req.flash("success_msg", "Product removed from cart")
//     res.redirect("back")

// })

router.get("/update/:id", (req, res) => {

    const { cart } = req.session
    const { id } = req.params
    const { action } = req.query

    for (let i = 0; i < cart.length; i++) {
        if (cart[i].id === id) {
            switch (action) {
                case "add":
                    cart[i].qty++
                    break;

                case "remove":
                    cart[i].qty--
                    if (cart[i].qty < 1)
                        cart.splice(i, 1)
                    break;

                case "clear":
                    cart.splice(i, 1)
                    if (cart.length === 0)
                        delete req.session.cart
                    break;

                default:
                    console.log("Update problem")
                    break;

            }
            break
        }
    }

    req.flash("success_msg", "Cart Updated")
    res.redirect('/cart')
})


router.get("/clear", (req, res) => {
    delete req.session.cart
    req.flash("success_msg", "All items removed from cart")
    res.redirect('/cart')
})


module.exports = router 