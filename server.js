if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}

//* Require
const express = require("express");
const app = express()
const expressLayouts = require("express-ejs-layouts")

//* Routes
const indexRouter = require("./routes/home")
const aboutRouter = require("./routes/about")
const listRouter = require("./routes/list")


//* MiddleWares
app.set("view engine", "ejs")
app.set("views", __dirname + "/views")
app.set("layout", "layouts/layout")
app.use(expressLayouts)
app.use(express.static("public"))
app.use(express.urlencoded({ extended: false }))

//*Routes
app.use("/home", indexRouter)
app.use("/about", aboutRouter)
app.use("/list", listRouter)


app.get("/", (req, res) => {
    res.send("This is the login page")
})

app.listen(process.env.PORT || 3000, () => console.log("Server has started..."))