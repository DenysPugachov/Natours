const crypto = require("crypto")
const { promisify } = require("util") // return a promise form func
const jwt = require("jsonwebtoken")
const { appendFile } = require("fs")
const User = require("../models/userModel")
const catchAsync = require("../utils/catchAsync")
const AppError = require("../utils/appError")
const sendEmail = require("../utils/email")

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
    // role: req.body.role,// insecure, add admins only with Compass
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

//passing arguments to middleware func with array [who will allow modify data]
// eslint-disable-next-line arrow-body-style
exports.restrictTo = (...roles) => {
  // return middleware func
  return (req, res, next) => {
    //roles ["admin", "lead-guide"]. role="user"
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to reform this action", 403), // 403 = forbidden
      )
    }
    next()
  }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed  email
  const user = await User.findOne({ email: req.body.email })
  if (!user) {
    return next(new AppError("There is not user with that email", 404)) // 404 not found
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken()
  await user.save({ validateBeforeSave: false }) // false => disable all validators in schema

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    "host",
  )}/api/v1/users/resetPassword/${resetToken}`

  const message = `Forgot a password? Submit a PATCH request with your new password and passwordConfirm to ${resetURL}.
  \nIf your did not forget your password, please ignore this email.`

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (expired in 10 min.).",
      message,
    })

    res.status(200).json({
      status: "success",
      message: "Token send to email.",
    })
  } catch (err) {
    // drop created data
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save({ validateBeforeSave: false })

    return next(
      new AppError(
        "There was an error sending the email. Tyr again later!",
        500,
      ), // 500  server error
    )
  }
})

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex")

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }, // check if the token have not expired
  })

  if (!user) {
    return next(new AppError("Token is invalid, or has expired", 400)) //400 bad request
  }

  // 3) Update changedPasswordAt property for current user
  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined
  // save new password to DB
  await user.save()

  // 4) log in the user and send JWT
  const token = signToken(user._id)
  res.status(201).json({
    status: "success",
    token,
  })
})
