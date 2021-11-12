const AppError = require("../utils/appError")

const handleJWTExpiredError = () =>
  new AppError("Your token has expired!, Please log in again.", 401)

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again.", 401) // 401 unauthorize

const handleValidationErrorDB = err => {
  console.log("handleValidationErrorDB=err =>", err)
  const errors = Object.values(err.errors).map(el => el.message)
  const message = `Invalid input data. ${errors.join(" ")}`
  return new AppError(message, 400)
}

const handleDuplicateFieldsDB = err => {
  const message = `Duplicate field value: "${err.keyValue.name}". Please use another value.`
  return new AppError(message, 400)
}

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`
  return new AppError(message, 400)
}

const sendErrorDev = (err, req, res) => {
  //originalUrl =  url without host (just route) start with /api.
  // a)Error for API
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    })
  }
  // b)Error for RENDERED WEBSITE
  console.error("ERROR! ", err)
  return res.status(err.statusCode).render("error", {
    title: "Something went wrong!",
    msg: err.message,
  })
}

const sendErrorProd = (err, req, res) => {
  console.log("Production mode!")
  // a)Error for API:
  //originalUrl =  url without host (just route) start with /api.
  if (req.originalUrl.startsWith("/api")) {
    //Operational = trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      })
    }
    //Programming error, or other unknown error: do NOT send error to client.
    // console.error("ERROR! ", err)

    console.log("======62 errorController Not operational, production mode!")
    //Send generic message
    return res.status(err.statusCode).render("error", {
      title: "Something went wrong!",
      msg: err.message,
    })
  }

  // b)Error for WEBSITE:
  //1.Operational = trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).render("error", {
      title: "Something went wrong!",
      msg: err.message,
    })
  }
  //2.Programming error, or other unknown error: do NOT send error to client
  //Send generic message
  return res.status(err.statusCode).render("error", {
    title: "Something went wrong!",
    msg: "Please try again later",
  })
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500 // 500 - internal sever error
  err.status = err.status || "error"

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res)
  } else if (process.env.NODE_ENV === "production") {
    //deep copy obj ({...err} => error.name=undefined)
    let error = JSON.parse(JSON.stringify(err)) // not copy err.message!!!
    error.message = err.message // fixing buggy copy form obj err

    if (error.name === "CastError") error = handleCastErrorDB(error)
    if (error.code === 11000) error = handleDuplicateFieldsDB(error)
    if (error.name === "ValidationError") error = handleValidationErrorDB(error)
    if (error.name === "JsonWebTokenError") error = handleJWTError()
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError()

    sendErrorProd(error, req, res)
  } else {
    console.error("process.env.NODE_ENV === unknown!???????")
  }
}

// test git 2
