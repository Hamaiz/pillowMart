const mongoose = require("mongoose")
const crypto = require("crypto")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    admin: {
        type: Number
    },
    confirmed: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: {
        type: String,
        required: false
    },
    resetPasswordExpires: {
        type: Date,
        required: false
    },
    verificationExpires: {
        type: Date,
        default: () => new Date(+new Date() + 24 * 60 * 60 * 1000)
    },
    google: {
        id: String,
        token: String,
        email: String,
        name: String
    },
    date: {
        type: Date,
        default: Date.now
    }
})

userSchema.index(
    { 'verificationExpires': 1 },
    {
        expireAfterSeconds: 0,
        partialFilterExpression: { 'confirmed': false }
    }
);

userSchema.methods.generatePasswordReset = function () {
    this.resetPasswordToken = crypto.randomBytes(24).toString('hex')
    this.resetPasswordExpires = Date.now() + 3600000
}

module.exports = mongoose.model("User", userSchema)