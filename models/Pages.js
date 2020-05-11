const mongoose = require("mongoose")

const pagesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
    },
    slug: {
        type: String,
    },
    sorting: {
        type: Number,
    },
    anotherId: {
        type: String
    },
    img_url: {
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

module.exports = mongoose.model("Pages", pagesSchema)