//Express related staff
const express = require("express")
const morgan = require("morgan")

const tourRouter = require("./routes/tourRoutes")
const userRouter = require("./routes/userRoutes")

const app = express()

//Middleware
// console.log(process.env.NODE_ENV)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"))// HTTP request logger
}

app.use(express.json())
app.use(express.static(`${__dirname}/public`))//serves static files

app.use((req, res, next) => {
  console.log("This message form custom middleware!!!!")
  next()
})

app.use((req, res, next) => {
  //when exactly the request happens
  req.requestTime = new Date().toISOString()
  next()
})


app.use("/api/v1/tours", tourRouter)
app.use("/api/v1/users", userRouter)

module.exports = app
