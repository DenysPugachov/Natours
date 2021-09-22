const User = require("../models/userModel")
const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")
const factory = require("./handlerFactory")

const filterObj = (obj, ...allowedFields) => {
  const newFilteredObj = {}
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) {
      newFilteredObj[el] = obj[el]
    }
  })
  return newFilteredObj
}

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find()
  //SEND RESPONSE
  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  })
})

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1.Create err if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use route updateMyPassword!",
        400,
      ),
    ) // 400 = bad request
  }

  // specify allowed fields to be update
  const filteredBody = filterObj(req.body, "name", "email")
  // 3.Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
  })

  res.status(200).json({
    status: "success",
    data: { updatedUser },
  })
})

exports.createUser = (req, res) => {
  //500 => internal server error
  res.status(500).json({
    status: "error",
    message: "This route is not et defined :(",
  })
}

exports.deleteMe = catchAsync(async (req, res, next) => {
  // find current logged user and switch active: false
  await User.findByIdAndUpdate(req.user.id, { active: false })

  res.status(204).json({
    status: "success",
    data: null,
  })
})

exports.getUser = (req, res) => {
  //500 => internal server error
  res.status(500).json({
    status: "error",
    message: "This route is not et defined :(",
  })
}

exports.updateUser = (req, res) => {
  //500 => internal server error
  res.status(500).json({
    status: "error",
    message: "This route is not et defined :(",
  })
}

exports.deleteUser = factory.deleteOne(User)
// exports.deleteUser = (req, res) => {
//   //500 => internal server error
//   res.status(500).json({
//     status: "error",
//     message: "This route is not et defined :(",
//   })
// }
