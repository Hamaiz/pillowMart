const mongoose = require("mongoose")
// const crypto = require("crypto")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    confirmed: {
        type: Boolean,
        default: false
    },
    // resetPasswordToken: {
    //     type: String,
    //     required: false
    // },
    // resetPasswordExpires: {
    //     type: Date,
    //     required: false
    // },
    date: {
        type: Date,
        default: Date.now
    }
})

// userSchema.methods.generatePasswordReset = function () {
//     this.resetPasswordToken = crypto.randomBytes(20).toString('hex')
//     this.resetPasswordExpires = Date.now() + 3600000
// }

module.exports = mongoose.model("User", userSchema)