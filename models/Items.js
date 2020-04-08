const mongoose = require("mongoose")

const itemSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    price: {
        type: String
    },
    dimensions: {
        type: String
    },
    weight: {
        type: String
    },
    availability: {
        type: Boolean
    },
    img_url: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }

})

module.exports = mongoose.model("Item", itemSchema)