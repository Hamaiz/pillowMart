const mongoose = require("mongoose")


const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String
    },
    anotherId: {
        type: String
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    dimensions: {
        type: String
    },
    weight: {
        type: String
    },
    availability: {
        type: String
    },
    img_url: {
        type: String
    },
    imgName: {
        type: String
    },
    galleryImages: [
        { type: String }
    ],
    date: {
        type: Date,
        default: Date.now
    }

})

module.exports = mongoose.model("Product", productSchema)