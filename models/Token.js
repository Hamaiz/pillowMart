const mongoose = require("mongoose")

const tokenSchema = new mongoose.Schema({
    token: {
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    product: [
        {
            _id: false,
            id: String,
            qty: Number,
        }
    ],
    modifiedOn: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true })

module.exports = mongoose.model("Token", tokenSchema)