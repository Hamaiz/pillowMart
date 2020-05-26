const router = require("express").Router()
const { check, validationResult, oneOf } = require('express-validator');
const path = require("path")
const fetch = require("node-fetch")
const Dropbox = require("dropbox").Dropbox;
const crypto = require("crypto")
const sharp = require("sharp")
const { isHolder } = require('../config/auth')
const stripe = require("stripe")(process.env.STRIPE_KEY)


//! MODELS
const Page = require("../models/Pages")
const Product = require("../models/Product")
const Token = require("../models/Token")
const Contact = require("../models/Contact")
const User = require("../models/User")

//!Dropbox
let dbx = new Dropbox({
    accessToken: process.env.ACCESS_TOKEN,
    fetch: fetch
})


//*========Admin Route=========*//
router.get("/", isHolder, async (req, res) => {
    try {
        const justToken = await Token.find({ paid: false })
        const tokens = await Token.find({ paid: false }).populate('user').populate('product.id').exec()
        let tokenDetail = []
        await justToken.forEach(async element => {
            const data = await stripe.tokens.retrieve(element.token)
            tokenDetail.push({
                street: data.card.address_line1,
                city: data.card.address_city,
                zip: data.card.address_zip
            })
        });
        const balance = await stripe.balance.retrieve()
        const contact = await Contact.find()


        res.render('admin/admin', {
            layout: false,
            token: tokens,
            balance,
            tokenDetail,
            contact
        });
    } catch (error) {
        console.log(error.message);
        res.sendStatus(400)
    }
})

router.get("/delete-contact/:id", isHolder, async (req, res) => {
    try {
        const { id } = req.params
        let contact = await Contact.findById(id)
        await contact.remove()
        res.redirect("back")
    } catch (error) {
        req.flash("error_msg", "An error occured")
        res.redirect("back")
    }
})

router.post("/edit-paid/:id", async (req, res) => {
    try {
        if (req.user.admin === 1) {
            const { id } = req.params
            let token = await Token.findById(id)
            token.paid = true
            await token.save()
            res.sendStatus(200)
        } else {
            res.sendStatus(400)
        }
    } catch (error) {
        res.sendStatus(400)
    }
})

//Users
router.get("/users", isHolder, async (req, res) => {
    try {
        const user = await User.find({ admin: 0 })

        res.render('admin/admin-user', {
            layout: false,
            user
        });
    } catch (error) {
        console.log(error.message);
        res.sendStatus(400)
    }
})

//Items
router.get("/items", isHolder, async (req, res) => {
    try {
        let tokenDetail = []
        const justToken = await Token.find()
        await justToken.forEach(async element => {
            const data = await stripe.tokens.retrieve(element.token)
            tokenDetail.push({
                street: data.card.address_line1,
                city: data.card.address_city,
                zip: data.card.address_zip
            })
        });

        const tokens = await Token.find().populate('user').populate('product.id').exec()

        res.render('admin/admin-items', {
            layout: false,
            token: tokens,
            tokenDetail
        });
    } catch (error) {
        console.log(error.message);
        res.sendStatus(400)
    }
})

//*==========Pages Route=========*//
router.get("/pages", isHolder, (req, res) => {
    Page.find({}).sort({ sorting: -1 }).exec((err, pages) => {
        res.render("admin/pages", {
            showHeader: false,
            pageName: "| admin",
            pages
        })
    })
})

//ADD PAGE
router.get("/pages/add-page", isHolder, (req, res) => {

    const title = ""
    const slug = ""
    // const content = ""

    res.render("admin/add-page", {
        showHeader: false,
        pageName: "| admin",
        title,
        slug,
        // content
    })
})

router.post("/pages/add-page", [
    check("title", "Title must have a value").notEmpty(),
    // check("content", "Content must have a value").notEmpty(),
    check("image", "You must upload an image").custom((value, { req }) => {
        const imgUrl = req.files !== null ? req.files.image.name : ""

        const extension = (path.extname(imgUrl)).toLowerCase();
        switch (extension) {
            case '.jpg':
                return '.jpg';
            case '.jpeg':
                return '.jpeg';
            case '.png':
                return '.png';
            default:
                return false;
        }
    })

], (req, res) => {
    let { title, slug } = req.body
    slug = slug.replace(/\s+/g, '-').toLowerCase()
    if (slug === "") slug = title.replace(/\s+/g, '-').toLowerCase()



    const imageUrl = req.files !== null ? req.files.image.name : ""


    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        let errorsArray = []

        errors.errors.forEach(element => {
            errorsArray.push({ msg: element.msg })
        });

        res.render("admin/add-page", {
            showHeader: false,
            pageName: "| admin",
            errors: errorsArray,
            title,
            slug,
            // content
        })
    } else {
        Page.findOne({ slug: slug }, (err, page) => {
            if (page) {
                const errors = [{ msg: "Page already exist" }]
                res.render("admin/add-page", {
                    showHeader: false,
                    pageName: "| admin",
                    errors,
                    title,
                    slug,
                    // content
                })
            } else {

                const randomNumber = crypto.randomBytes(24).toString('hex')

                const imageData = req.files !== null ? req.files.image.data : ""

                dbx.filesUpload({
                    path: `/Blogs/${randomNumber}/${imageUrl}`,
                    contents: imageData
                })
                    .then(response => {
                        dbx.sharingCreateSharedLink({
                            path: `/Blogs/${randomNumber}/${imageUrl}`,
                        })
                            .then(data => {
                                let { url } = data
                                const answer = url.replace(/w{3}.dropbox/g, "dl.dropboxusercontent").replace(/[?]dl=0/g, "")

                                //New Product
                                const page = new Page({
                                    title,
                                    slug,
                                    // content,
                                    sorting: 0,
                                    anotherId: randomNumber,
                                    img_url: answer
                                })
                                page.save(err => {
                                    if (err) return console.log(err);
                                    req.flash("success_msg", "Page Created")
                                    res.redirect(`/cf5480873fae9cf6c5c9/pages/edit-page/${page._id}`)
                                })

                            })
                            .catch(err => console.log(err))
                    })
                    .catch(error => {
                        console.log(error);
                    })
            }
        })
    }


})

//RE-ORDER PAGE
router.post("/pages/reorder-page", (req, res) => {
    const { ids } = req.body
    var count = 0

    for (let i = 0; i < ids.length; i++) {
        const { id } = ids[i]
        count++;

        (function (count) {
            Page.findById(id, (err, page) => {

                page.sorting = count;
                page.save(err => {
                    if (err)
                        return console.log(err);
                })
            })
        })(count);
    }
})

//EDIT PAGE
router.get("/pages/edit-page/:id", isHolder, (req, res) => {
    const { id } = req.params

    Page.findById(id, (err, page) => {
        if (err) return console.log(err);
        res.render("admin/edit-page", {
            showHeader: false,
            pageName: "| admin",
            title: page.title,
            slug: page.slug,
            content: page.content,
            id: page._id,
            img_url: page.img_url,
            anotherId: page.anotherId,
            galleryImages: page.galleryImages
        })
    })

})

router.post("/pages/edit-page/:id", [
    check("title", "Title must have a value").notEmpty(),
    check("content", "Content must have a value").notEmpty(),
    oneOf([
        check("pimage"),
        check("image", "You must upload an image").custom((value, { req }) => {
            const imgUrl = req.files !== null ? req.files.image.name : ""

            const extension = (path.extname(imgUrl)).toLowerCase();
            switch (extension) {
                case '.jpg':
                    return '.jpg';
                case '.jpeg':
                    return '.jpeg';
                case '.png':
                    return '.png';
                default:
                    return false;
            }
        })
    ])

], (req, res) => {
    let { title, slug, content, pimage, another, galleryImages } = req.body
    slug = slug.replace(/\s+/g, '-').toLowerCase()
    if (slug === "") slug = title.replace(/\s+/g, '-').toLowerCase()
    const { id } = req.params

    const imageUrl = req.files !== null ? req.files.image.name : ""



    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        let errorsArray = []

        errors.errors.forEach(element => {
            errorsArray.push({ msg: element.msg })
        });

        res.render("admin/edit-page", {
            showHeader: false,
            pageName: "| admin",
            errors: errorsArray,
            title,
            slug,
            content: JSON.stringify(content),
            img_url: pimage,
            id,
            anotherId: another,
            galleryImages: JSON.parse(galleryImages)
        })
    } else {
        Page.findOne({ slug: slug, _id: { '$ne': id } }, (err, page) => {
            if (page) {
                const errors = [{ msg: "Page already exist" }]
                res.render("admin/edit-page", {
                    showHeader: false,
                    pageName: "| admin",
                    errors,
                    title,
                    slug,
                    content,
                    img_url: pimage,
                    id,
                    anotherId: another,
                    galleryImages: page.galleryImages
                })
            } else {
                Page.findById(id, (err, page) => {
                    if (err) console.log(err)

                    if (imageUrl != "") {
                        if (pimage != "") {
                            const imageData = req.files !== null ? req.files.image.data : ""
                            let index = pimage.lastIndexOf("/") + 1
                            const fileName = pimage.substr(index)

                            dbx.filesDelete({
                                path: `/Blogs/${page.anotherId}/${fileName}`,
                            })
                                .then(data => {
                                    console.log("DONE");
                                })
                                .catch(err => console.log(err))

                            dbx.filesUpload({
                                path: `/Blogs/${page.anotherId}/${imageUrl}`,
                                contents: imageData
                            })
                                .then(data => {

                                    dbx.sharingCreateSharedLink({
                                        path: `/Blogs/${page.anotherId}/${imageUrl}`,
                                    })
                                        .then(data => {
                                            let { url } = data
                                            const answer = url.replace(/w{3}.dropbox/g, "dl.dropboxusercontent").replace(/[?]dl=0/g, "")



                                            page.title = title
                                            page.slug = slug
                                            page.content = content
                                            page.img_url = answer

                                            page.save(err => {
                                                if (err) return console.log(err);
                                                req.flash("success_msg", "Page Updated")
                                                res.redirect("/cf5480873fae9cf6c5c9/pages")
                                            })
                                        })
                                        .catch(err => console.log(err))
                                })
                                .catch(error => console.log(error))
                        } else {
                            const imageData = req.files !== null ? req.files.image.data : ""

                            dbx.filesUpload({
                                path: `/Blogs/${page.anotherId}/${imageUrl}`,
                                contents: imageData
                            })
                                .then(data => {

                                    dbx.sharingCreateSharedLink({
                                        path: `/Blogs/${page.anotherId}/${imageUrl}`,
                                    })
                                        .then(data => {
                                            let { url } = data
                                            const answer = url.replace(/w{3}.dropbox/g, "dl.dropboxusercontent").replace(/[?]dl=0/g, "")


                                            page.title = title
                                            page.slug = slug
                                            page.content = content
                                            page.img_url = answer

                                            page.save(err => {
                                                if (err) return console.log(err);
                                                req.flash("success_msg", "Page Updated")
                                                res.redirect("/cf5480873fae9cf6c5c9/pages")
                                            })
                                        })
                                        .catch(err => console.log(err))
                                })
                                .catch(error => console.log(error))
                        }
                    } else {

                        page.title = title
                        page.slug = slug
                        page.content = content

                        page.save(err => {
                            if (err) return console.log(err);
                            req.flash("success_msg", "Page Updated")
                            res.redirect("/cf5480873fae9cf6c5c9/pages")
                        })

                    }

                    // page.title = title
                    // page.slug = slug
                    // page.content = content

                    // page.save(err => {
                    //     if (err) return console.log(err);
                    //     req.flash("success_msg", "Page Updated")
                    //     res.redirect("/admin/pages")
                    // })
                })

            }
        })
    }
})


//DELETE PAGE
router.get("/pages/delete-page/:id", isHolder, (req, res) => {
    const { id } = req.params

    dbx.filesDelete({
        path: `/Blogs/${id}`
    })
        .then(response => {
            Page.findOneAndDelete({ anotherId: id }, (err) => {
                if (err) console.log(err)
            })

            req.flash("success_msg", "Page Removed")
            res.redirect("/cf5480873fae9cf6c5c9/pages")
        })
        .catch(err => console.log(err))
})

/* 
* Page Gallery
*/

router.post("/pages/product-gallery/:id", (req, res) => {
    const pageImage = req.files.file
    const { id } = req.params
    const imageData = pageImage.data

    sharp(imageData)
        .toFormat("jpeg")
        .jpeg({
            quality: 85
        })
        .toBuffer((err, data, info) => {
            if (err) console.log(err);

            const randomNumber = crypto.randomBytes(6).toString('hex')

            dbx.filesUpload({
                path: `/Blogs/${id}/gallery/${randomNumber}.jpeg`,
                contents: data
            })
                .then(response => {

                    dbx.sharingCreateSharedLink({
                        path: `/Blogs/${id}/gallery/${randomNumber}.jpeg`
                    })
                        .then(data => {
                            let { url } = data
                            const answer = url.replace(/w{3}.dropbox/g, "dl.dropboxusercontent").replace(/[?]dl=0/g, "")


                            Page.findOne({ anotherId: id }, (err, p) => {
                                p.galleryImages.push(answer)

                                p.save(err => {
                                    if (err) console.log(err);
                                    res.sendStatus(200)

                                })
                            })
                        })
                        .catch(err => console.log(err))
                })
                .catch(error => {
                    console.log(error);
                })
        })
})

//DELETE IMAGE GALLERY
router.get("/pages/delete-image/:image", isHolder, (req, res) => {
    const { image } = req.params
    const { id, link } = req.query

    const urlImage = `https://dl.dropboxusercontent.com/${link}${image}`

    Page.findOne({ anotherId: id }, (err, p) => {
        const { galleryImages } = p

        galleryImages.forEach((e, i) => {
            if (galleryImages[i] === urlImage) {
                galleryImages.splice(i, 1)
                let newGalleryImages = galleryImages

                p.galleryImages = newGalleryImages

                p.save(err => {
                    if (err) console.log(err)
                })
            }

        })

    })


    dbx.filesDelete({
        path: `/Blogs/${id}/gallery/${image}`,
    })
        .then(response => {

            req.flash("success_msg", "Image Deleted")
            res.redirect("back")

        })
        .catch(err => console.log(err))

})


//*===============Product Route*==================*//

router.get("/products", isHolder, (req, res) => {
    Product.find((err, product) => {
        res.render("admin/products", {
            showHeader: false,
            pageName: "| admin",
            product,
        })
    })
})


//ADD PRODUCT
router.get("/products/add-product", isHolder, (req, res) => {

    const title = ""
    const desc = ""
    const price = ""
    const dimensions = ""
    const weight = ""

    res.render("admin/add-product", {
        showHeader: false,
        pageName: "| admin",
        title,
        desc,
        price,
        dimensions,
        weight,
    })
})


router.post("/products/add-product", [
    check("title", "Title must have a value").notEmpty(),
    check("desc", "Description must have a value").notEmpty(),
    check("price", "Price must have a value").isDecimal(),
    check("dimensions", "Dimensions should be in this form, 30 x 30 x 30").matches(/(^\d+ x \d+ x \d+)/g),
    check("weight", "Weight must be numeric").isNumeric(),
    check("image", "You must upload an image").custom((value, { req }) => {
        const imgUrl = req.files !== null ? req.files.image.name : ""

        const extension = (path.extname(imgUrl)).toLowerCase();
        switch (extension) {
            case '.jpg':
                return '.jpg';
            case '.jpeg':
                return '.jpeg';
            case '.png':
                return '.png';
            default:
                return false;
        }
    })

], (req, res) => {
    //REQUEST BODY
    let { title, desc, price, dimensions, weight, availability } = req.body
    const slug = title.replace(/\s+/g, '-').toLowerCase()
    const imageUrl = req.files !== null ? req.files.image.name : ""


    //Error Handling
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        let errorsArray = []

        errors.errors.forEach(element => {
            errorsArray.push({ msg: element.msg })
        });

        res.render("admin/add-product", {
            showHeader: false,
            pageName: "| admin",
            errors: errorsArray,
            title,
            desc,
            price,
            dimensions,
            weight,
        })
    } else {
        Product.findOne({ slug: slug }, (err, product) => {
            if (err) console.log(err)

            if (product) {
                const errors = [{ msg: "Product title already exists" }]
                res.render("admin/add-product", {
                    showHeader: false,
                    pageName: "| admin",
                    errors,
                    title,
                    desc,
                    price,
                    dimensions,
                    weight,
                })
            } else {
                const randomNumber = crypto.randomBytes(24).toString('hex')

                dbx.filesCreateFolder({
                    path: `/Images/${randomNumber}/gallery`,
                })

                const imageData = req.files !== null ? req.files.image.data : ""

                dbx.filesUpload({
                    path: `/Images/${randomNumber}/${imageUrl}`,
                    contents: imageData
                })
                    .then(response => {
                        dbx.sharingCreateSharedLink({
                            path: `/Images/${randomNumber}/${imageUrl}`,
                        })
                            .then(data => {
                                let { url } = data
                                const answer = url.replace(/w{3}.dropbox/g, "dl.dropboxusercontent").replace(/[?]dl=0/g, "")

                                //New Product
                                const product = new Product({
                                    title,
                                    slug,
                                    anotherId: randomNumber,
                                    description: desc,
                                    price,
                                    img_url: answer,
                                    imgName: imageUrl,
                                    dimensions,
                                    weight,
                                    availability,

                                })
                                product.save(err => {
                                    if (err) return console.log(err);

                                    req.flash("success_msg", "Product Created")
                                    res.redirect("/cf5480873fae9cf6c5c9/products")
                                })
                            })
                            .catch(err => console.log(err))
                    })
                    .catch(error => {
                        console.log(error);
                    })
            }
        })
    }
})

//EDIT PRODUCT
router.get("/products/edit-product/:id", isHolder, (req, res) => {
    const { id } = req.params

    Product.findById(id, (err, p) => {
        if (err) return console.log(err);


        res.render("admin/edit-product", {
            showHeader: false,
            pageName: "| admin",
            id: p._id,
            title: p.title,
            desc: p.description,
            price: p.price,
            img_url: p.img_url,
            slug: p.slug,
            anotherId: p.anotherId,
            galleryImages: p.galleryImages,
            dimensions: p.dimensions,
            weight: p.weight,
            availability: p.availability
        })

    })
})

router.post("/products/edit-product/:id", [
    check("title", "Title must have a value").notEmpty(),
    check("desc", "Description must have a value").notEmpty(),
    check("price", "Price must have a value").isDecimal(),
    check("dimensions", "Dimensions should be in this form, 30 x 30 x 30").not().matches(/(^\d+ x \d+ x \d+)/g),
    check("weight", "Weight must be numeric").isNumeric(),
    oneOf([
        check("pimage"),
        check("image", "You must upload an image").custom((value, { req }) => {
            const imgUrl = req.files !== null ? req.files.image.name : ""

            const extension = (path.extname(imgUrl)).toLowerCase();
            switch (extension) {
                case '.jpg':
                    return '.jpg';
                case '.jpeg':
                    return '.jpeg';
                case '.png':
                    return '.png';
                default:
                    return false;
            }
        })
    ])

], (req, res) => {
    //REQUEST BODY
    let { title, desc, price, pimage, anotherId, dimensions, weight, availability, galleryImages } = req.body
    const slug = title.replace(/\s+/g, '-').toLowerCase()
    const imageUrl = req.files !== null ? req.files.image.name : ""

    const { id } = req.params

    //Error Handling
    let errors = validationResult(req)

    if (!errors.isEmpty()) {
        let errorsArray = []

        errors.errors.forEach(element => {
            errorsArray.push({ msg: element.msg })
        });

        res.render("admin/edit-product", {
            showHeader: false,
            pageName: "| admin",
            errors: errorsArray,
            title,
            desc,
            price,
            slug,
            img_url: pimage,
            id,
            dimensions,
            weight,
            availability,
            anotherId,
            galleryImages: JSON.parse(galleryImages)
        })

    } else {
        Product.findOne({ slug: slug, _id: { '$ne': id } }, (err, product) => {
            if (err) console.log(err)

            if (product) {

                const errors = [{ msg: "Product title already exists" }]
                res.render("admin/add-product", {
                    showHeader: false,
                    pageName: "| admin",
                    errors,
                    title,
                    desc,
                    price,
                    slug,
                    img_url: pimage,
                    id,
                    dimensions,
                    weight,
                    availability,
                    anotherId,
                    galleryImages: product.galleryImages,

                })

            } else {
                Product.findById(id, (err, p) => {
                    if (err) console.log(err)

                    if (imageUrl != "") {
                        if (pimage != "") {
                            const imageData = req.files !== null ? req.files.image.data : ""

                            dbx.filesDelete({
                                path: `/Images/${p.anotherId}/${p.imgName}`,
                            })
                                .then(() => { })
                                .catch(err => console.log(err))

                            dbx.filesUpload({
                                path: `/Images/${p.anotherId}/${imageUrl}`,
                                contents: imageData
                            })
                                .then(() => {

                                    dbx.sharingCreateSharedLink({
                                        path: `/Images/${p.anotherId}/${imageUrl}`,
                                    })
                                        .then(data => {
                                            let { url } = data
                                            const answer = url.replace(/w{3}.dropbox/g, "dl.dropboxusercontent").replace(/[?]dl=0/g, "")


                                            p.title = title
                                            p.slug = slug
                                            p.description = desc
                                            p.price = price
                                            p.dimensions = dimensions
                                            p.weight = weight
                                            p.availability = availability
                                            p.img_url = answer
                                            p.imgName = imageUrl

                                            p.save(err => {
                                                if (err) return console.log(err);

                                                req.flash("success_msg", "Product Created")
                                                res.redirect("/cf5480873fae9cf6c5c9/products")
                                            })
                                        })
                                        .catch(err => console.log(err))
                                })
                                .catch(error => console.log(error))
                        } else {
                            const imageData = req.files !== null ? req.files.image.data : ""

                            dbx.filesUpload({
                                path: `/Images/${p.anotherId}/${imageUrl}`,
                                contents: imageData
                            })
                                .then(data => {

                                    dbx.sharingCreateSharedLink({
                                        path: `/Images/${p.anotherId}/${imageUrl}`,
                                    })
                                        .then(data => {
                                            let { url } = data
                                            const answer = url.replace(/w{3}.dropbox/g, "dl.dropboxusercontent").replace(/[?]dl=0/g, "")


                                            p.title = title
                                            p.slug = slug
                                            p.description = desc
                                            p.price = price
                                            p.dimensions = dimensions
                                            p.weight = weight
                                            p.availability = availability
                                            p.img_url = answer
                                            p.imgName = imageUrl


                                            p.save(err => {
                                                if (err) return console.log(err);

                                                req.flash("success_msg", "Product Created")
                                                res.redirect("/cf5480873fae9cf6c5c9/products")
                                            })
                                        })
                                        .catch(err => console.log(err))
                                })
                                .catch(error => console.log(error))
                        }
                    } else {

                        p.title = title
                        p.slug = slug
                        p.description = desc
                        p.price = price
                        p.dimensions = dimensions
                        p.weight = weight
                        p.availability = availability

                        p.save(err => {
                            if (err) console.log(err)


                            req.flash("success_msg", "Product Edited")
                            res.redirect("/cf5480873fae9cf6c5c9/products")
                        })
                    }
                })
            }
        })
    }
})

router.get("/products/delete-product/:id", isHolder, (req, res) => {
    const { id } = req.params


    dbx.filesDelete({
        path: `/Images/${id}`
    })
        .then(response => {
            Product.findOneAndDelete({ anotherId: id }, (err) => {
                console.log(err)
            })

            req.flash("success_msg", "Successfuly deleted product")
            res.redirect("/cf5480873fae9cf6c5c9/products")
        })
        .catch(err => console.log(err))

})


/*
 *  Post PRODUCT GALLERY 
*/

router.post("/products/product-gallery/:id", (req, res) => {
    const productImage = req.files.file
    const { id } = req.params
    const imageData = productImage.data

    sharp(imageData)
        .toFormat("jpeg")
        .jpeg({
            quality: 85
        })
        .toBuffer((err, data, info) => {
            if (err) console.log(err);

            const randomNumber = crypto.randomBytes(6).toString('hex')

            dbx.filesUpload({
                path: `/Images/${id}/gallery/${randomNumber}.jpeg`,
                contents: data
            })
                .then(response => {

                    dbx.sharingCreateSharedLink({
                        path: `/Images/${id}/gallery/${randomNumber}.jpeg`
                    })
                        .then(data => {
                            let { url } = data
                            const answer = url.replace(/w{3}.dropbox/g, "dl.dropboxusercontent").replace(/[?]dl=0/g, "")


                            Product.findOne({ anotherId: id }, (err, p) => {
                                p.galleryImages.push(answer)

                                p.save(err => {
                                    if (err) console.log(err);
                                    res.sendStatus(200)

                                })
                            })
                        })
                        .catch(err => console.log(err))
                })
                .catch(error => {
                    console.log(error);
                })
        })
})

//DELETE IMAGE GALLERY
router.get("/products/delete-image/:image", isHolder, (req, res) => {
    const { image } = req.params
    const { id, link } = req.query

    const urlImage = `https://dl.dropboxusercontent.com/${link}${image}`

    Product.findOne({ anotherId: id }, (err, p) => {
        const { galleryImages } = p

        galleryImages.forEach((e, i) => {
            if (galleryImages[i] === urlImage) {
                galleryImages.splice(i, 1)
                let newGalleryImages = galleryImages

                p.galleryImages = newGalleryImages

                p.save(err => {
                    if (err) console.log(err)
                })
            }

        })

    })


    dbx.filesDelete({
        path: `/Images/${id}/gallery/${image}`,
    })
        .then(response => {

            req.flash("success_msg", "Image Deleted")
            res.redirect("back")

        })
        .catch(err => console.log(err))

})

module.exports = router