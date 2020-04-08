if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}

//* Require
const express = require("express");
const app = express()
const mongoose = require("mongoose")
const expressLayouts = require("express-ejs-layouts")
const flash = require('express-flash')
const session = require("express-session")
const MongoStore = require("connect-mongo")(session)
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
const confirmationRouter = require('./routes/confirmation')
const apiItemRouter = require("./routes/api/item")




//* MiddleWares
app.set("view engine", "ejs")
app.set("views", __dirname + "/views")
app.set("layout", "layouts/layout")
app.use(expressLayouts)
app.use(express.static("public"))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
// app.use(express.multipart())
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next()
})
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    store: new MongoStore({
        url: process.env.DATABASE_URL
    }),
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
app.use("/", indexRouter)
app.use("/about", aboutRouter)
app.use("/list", listRouter)
app.use("/accounts", loginRouter)
app.use("/confirmation", confirmationRouter)
app.use("/api", apiItemRouter)


//DataBase
mongoose.connect(
    process.env.DATABASE_URL,
    {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    }
)
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'));
db.once("open", _ => console.log("Connected to Mongoose"))

app.listen(process.env.PORT || 3000, () => console.log("Server has started..."))