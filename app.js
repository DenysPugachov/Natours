//Express related staff
const express = require("express")
const morgan = require("morgan")

const globalErrorHandler = require("./controllers/errorController")
const AppError = require("./utils/appError")
const tourRouter = require("./routes/tourRoutes")
const userRouter = require("./routes/userRoutes")

const app = express()

//Middleware
// console.log(process.env.NODE_ENV)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")) // HTTP request logger
}

app.use(express.json())
app.use(express.static(`${__dirname}/public`)) //serves static files

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString()
  next()
})
//ROUTES
app.use("/api/v1/tours", tourRouter)
app.use("/api/v1/users", userRouter)

//this code only be reached if was NOT handled on previous routers
// .all("*", ...) => all HTTP methods(get, post, patch, put, delete)
app.all("*", (req, res, next) => {
  //pass args to the Error handling middleware
  next(new AppError(`Can't find ${req.originalUrl} on this server`))
})

//Error handling middleware in one place
app.use(globalErrorHandler)

module.exports = app
