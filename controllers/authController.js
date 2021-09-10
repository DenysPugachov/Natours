const { promisify } = require("util") // return a promise form func
const jwt = require("jsonwebtoken")
const User = require("../models/userModel")
const catchAsync = require("../utils/catchAsync")
const AppError = require("../utils/appError")
const { appendFile } = require("fs")

const signToken = id =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })

exports.signup = catchAsync(async (req, res, next) => {
  // const newUser = await User.create(req.body)// NOT secure approach (use req.body)
  //this approach limit fields that putted here (add admins only with Compass)
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  })
  const token = signToken(newUser._id)
  res.status(201).json({
    status: "success",
    token, // needed to signup user
    data: {
      user: newUser,
    },
  })
})

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400)) // 400 => "Bad request"
  }
  const user = await User.findOne({ email }).select("+password") // "+" = allow selected hidden field
  // user exist and password correct
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password!", 401)) // 401 = unauthorize
  }
  // send token to client
  const token = signToken(user.id)
  res.status(200).json({
    status: "success",
    token,
  })
})

// protect rout from unauthenticated users
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get token
  // console.log("from protect", req.headers)
  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1]
  }

  if (!token) {
    return next(
      new AppError("Your are not logged in! Please login to get access.", 401), //401 =  unauthorize
    )
  }

  // 2) Verify token(if someone change data || token expired)
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
  // console.log("\n=decoded=", decoded)

  // 3) is user still exist at this moment?-
  const currentUser = await User.findById(decoded.id)
  if (!currentUser) {
    return next("The user with this token does not longer exist!", 401)
  }

  // 4) Check if user has change password after the token was issued?
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401),
    )
  }

  //Grant access to protected route (with current token)
  req.user = currentUser
  next()
})
