const mongoose = require("mongoose")

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
    // accessToken: {
    //     type: String
    // },
    date: {
        type: Date,
        default: Date.now
    }
})

// userSchema.method.generateRandomToken = function () {
//     var user = this,
//         chars = '_!abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
//         token = new Date().getTime() + '_';
//     for (x = 0; x < 16; x++) {
//         var i = Math.floor(Math.random() * 62);
//         token += chars.charAt(i)
//     }
//     return token
// }



module.exports = mongoose.model("User", userSchema)