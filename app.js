const express = require("express")
const morgan = require("morgan")
const rateLimit = require("express-rate-limit")
const helmet = require("helmet")
const mongoSanitize = require("express-mongo-sanitize")
const xss = require("xss-clean")
const hpp = require("hpp")

const globalErrorHandler = require("./controllers/errorController")
const AppError = require("./utils/appError")
const tourRouter = require("./routes/tourRoutes")
const userRouter = require("./routes/userRoutes")

const app = express()

// Global Middleware
// Set Security HTTP headers
app.use(helmet())

// Development logs
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")) // HTTP request logger
}

// limit requests from same IP
const limiter = rateLimit({
  max: 100, // allow 100 requests from same IP
  windowMs: 60 * 60 * 1000, // 1 hour
  message: "Too many requests form this IP, please try again in an hour.",
})

// Limit access to "/api" route
app.use("/api", limiter)

// Body parser = reading data from body to req.body
app.use(
  express.json({
    limit: "10kb", // limit data coming from body
  }),
)

// Data sanitization against NoSQL query injection ("email": {"$gt": "" }, + password)
app.use(mongoSanitize()) // remove all "$" and "."

// Data sanitization against XSS (Cross Site Scripting Attacks)
app.use(xss())

// protect against HTTP Parameter Pollution attacks (return only last parameter by default)
app.use(
  hpp({
    whitelist: [
      "duration",
      "difficulty",
      "ratingsAverage",
      "ratingsQuantity",
      "maxGroupSize",
      "price",
    ], // add allowed params
  }),
) // use last parameter by default(without arguments)

// Serving static files
app.use(express.static(`${__dirname}/public`)) //serves static files

// Test middleware
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
