if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}

//* Require
const express = require("express");
const app = express()
const expressLayouts = require("express-ejs-layouts")
const flash = require('express-flash')
const session = require("express-session")
const passport = require("passport")
const methodOverride = require("method-override")

//*Passport
const initializePassport = require("./config/passport")
initializePassport(passport)

//* Routes
const indexRouter = require("./routes/home")
const aboutRouter = require("./routes/about")
const listRouter = require("./routes/list")
const loginRouter = require("./routes/login")
const mongoose = require("mongoose")


//* MiddleWares
app.set("view engine", "ejs")
app.set("views", __dirname + "/views")
app.set("layout", "layouts/layout")
app.use(expressLayouts)
app.use(express.static("public"))
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}))
app.use(function (req, res, next) {
    if (req.method == "POST" && req.url == '/accounts/login') {
        if (req.body.remember_me) {
            req.session.cookie.maxAge = 2592000000
        }
    } else {
        req.session.cookie.expires = 21600000
    }
    next()
})
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"))


//Global var
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    res.locals.error = req.flash("error")
    next()
})

//*Routes
app.use("/home", indexRouter)
app.use("/about", aboutRouter)
app.use("/list", listRouter)
app.use("/accounts", loginRouter)
app.get("/", (req, res) => {
    res.send("Startup Page")
})


//DataBase
mongoose.connect(
    process.env.DATABASE_URL,
    {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    }
)
const db = mongoose.connection
// db.on("error", error => console.error(error))
db.on('error', console.error.bind(console, 'connection error:'));
db.once("open", _ => console.log("Connected to Mongoose"))

app.listen(process.env.PORT || 3000, () => console.log("Server has started..."))