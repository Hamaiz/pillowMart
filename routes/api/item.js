const router = require("express").Router()
const Item = require("../../models/Items")

router.get("/item", async (req, res) => {
    try {
        const items = await Item.find()

        res.status(200).json(items)
    } catch (e) {
        res.status(400).json({ message: e.message })
    }
})

router.post("/item", async (req, res) => {
    const item = new Item({
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        dimensions: req.body.dimensions,
        weight: req.body.weight,
        availability: req.body.availability,
        img_url: req.body.img_url
    })
    try {
        const savedItem = await item.save()
        res.status(200).json(savedItem)
    } catch (e) {
        res.status(400).json({ message: e.message })
    }
})

// 1
// "title": "Cervical pillow for airplane car office nap pillow",
// "description":"These shredded foam pillows are great for side sleepers, back sleepers and stomach sleepers. The pliable memory foam conforms to the shape of your head and body keeping the spinal column in your neck and back aligned properly.",
// "price": "$10",
// "dimensions":"26 x 26 (inch)",
// "weight" :"3 kg",
// "availability": true,
// "img_url": "/img/product/product_list_2.png"


//2
// "title": "Coop Home Goods - Premium Adjustable Loft Pillow",
// "description":"These cooling shredded memory foam pillows will never go flat. Once fully expanded, each pillow measures 12 x 12 x 12 (inch). Memory foam is great for those who prefer soft or firm pillows. Pillows come with a FULL 10 year warranty.",
// "price": "$49",
// "dimensions":"12 x 12 x 12 (inch)",
// "weight" :"2 kg",
// "availability": true,
// "img_url" : "/img/product/product_list_1.png"

//3
// "title": "Cozy Bed European Sleep Pillow",
// "description":"This European pillow can be used as a decorative pillow or as a sleep pillow. This is for a set of 2 pillows. It has a strong microfiber cover and is generously filled. Hypoallergenic and easy care instructions",
// "price": "$10",
// "dimensions":"12 x 12 x 12 (inch)",
// "weight" :"2 kg",
// "availability":true,
// "img_url" : "/img/product/product_list_3.png"

//4
// "title": "Shredded Memory Foam Pillows",
// "description":" Plixio has designed the best pillows for sleeping. Our bamboo memory foam pillows use a cooling shredded foam technology to keep you cool all night. The breathable cover keeps your pillow dry and provides maximum comfort.",
// "price": "$10",
// "dimensions":"15 x 12 x 12 (inch)",
// "weight" :"2 kg",
// "availability":false,
// "img_url" : "/img/product/product_list_4.png"

//5
// "title": "Washable Hypoallergenic Bamboo Pillow",
// "description":"Our hypoallergenic bamboo pillow cases are a great alternative to down or latex pillows. The pillow covers are also washable. Each memory foam pillow is made from 60% polyester and 40% viscous made from bamboo.",
// "price": "$105",
// "dimensions":"12 x 16 x 16 (inch)",
// "weight" :"2 kg",
// "availability":true,
// "img_url" : "/img/product/product_list_5.png"

//6
// "title": "Luxury Plush Gel Pillow",
// "description":"Our queen bed pillows can help provide relief from several sleeping issues including snoring, insomnia, migraines, neck and back pain, allergies and TMJ.",
// "price": "$60",
// "dimensions":"12 x 12 x 12 (inch)",
// "weight" :"2 kg",
// "availability":true,
// "img_url" : "/img/product/product_list_6.png"

//7
// "title": "Cozy And Comfort Bed Pillow",
// "description":"Are you having a hard time getting to sleep? Maybe it's time to get rid of your old, worn-out pillow and invest in a memory foam pillow! Shredded memory foam pillows are soft enough to conform to the shape of your head but supportive enough to keep your neck and back aligned properly. Meanwhile, the pillow case is made from viscous of bamboo and is soft, stain resistant, and hypoallergenic. We hope you notice an immediate difference in your level of comfort and your quality of sleep.",
// "price": "$10",
// "dimensions":"12 x 12 x 12 (inch)",
// "weight" :"2 kg",
// "availability":true,
// "img_url" : "/img/product/product_list_7.png"

//8
// "title": "Reading & Bed Rest Pillows",
// "description":"This specially designed pillow is hypoallergenic which provides users with a high-quality and safe night of sleep. Dust mite resistant too! Never fear of creepy crawlies eating away at your pillow. Both the zipper cover and pillow itself are machine washable which make cleaning easy",
// "price": "$10",
// "dimensions":"12 x 12 x 12 (inch)",
// "weight" :"2 kg",
// "availability":true,
// "img_url" : "/img/product/product_list_8.png"

//9
// "title": "Bed Pillows for Sleeping 2 Pack",
// "description":"We are so confident in the quality of our product that we offer a 30-day satisfaction guarantee! If you are unsatisfied, simply contact us to return the product for a full refund.",
// "price": "$5",
// "dimensions":"12 x 12 x 12 (inch)",
// "weight" :"2 kg",
// "availability":true,
// "img_url" : "/img/product/product_list_9.png"

//10
// "title": "Get A Good Night: Sumitu Pillows",
// "description":"With their no-shift construction, our pillows are a fantastic place to rest your head. They’re stylish, luxurious, and incredibly comfortable. You’ll fall asleep fast, and stay asleep!",
// "price": "$100",
// "dimensions":"12 x 12 x 12 (inch)",
// "weight" :"2 kg",
// "availability":"false",
// "img_url" : "/img/product/product_list_10.png"

module.exports = router