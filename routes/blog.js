const router = require("express").Router()
const Page = require("../models/Pages")

//Blogs
router.get("/", (req, res) => {
    console.log(req.session);

    Page.find({}).sort({ sorting: 1 }).exec((err, pages) => {
        res.render("blog/index", {
            pageName: "| Blogs",
            showHeader: true,
            pages
        })
    })
})


//Blogs Detail
router.get('/:slug', (req, res) => {
    const { slug } = req.params


    Page.findOne({ slug: slug }, (err, page) => {
        let { title, img_url, slug, content } = page

        const another = JSON.parse(content).blocks
        another.forEach(item => {
            console.log(item)
        })

        let html = []
        for (let block of JSON.parse(content).blocks) {
            switch (block.type) {
                case 'paragraph':
                    html.push(`<p>${block.data.text}</p>`);
                    break
                case 'header':
                    html.push(`<h${block.data.level}>${block.data.text}</h${block.data.level}>`);
                    break
                case 'image':
                    html.push(`<img src="${block.data.url}" class="${(block.data.stretched === true) ? "biggerWidth" : "smallWidth"}"></img>`);
                    break
                case 'quote':
                    html.push(`<blockquote class="blockquote"><p>${block.data.text}</p><footer class="blockquote-footer">${block.data.caption}</footer></blockquote>`);
                    break
                case 'list':
                    let str = `<${(block.data.style === 'ordered') ? 'ol' : 'ul'}>`
                    block.data.items.forEach(item => {
                        str += `<li>${item}</li>`
                    })
                    str += `</${(block.data.style === 'ordered') ? 'ol' : 'ul'}>`
                    html.push(str)
                    break
                case 'embed':
                    if (block.data.service === "youtube")
                        html.push(`<div class="blog_frame"><iframe src='${block.data.embed}' allowfullscreen></iframe></div>`);
            }
        }

        res.render("blog/single", {
            pageName: "| Blogs",
            showHeader: true,
            title,
            img_url,
            slug,
            content: html
        })

    })
})

module.exports = router