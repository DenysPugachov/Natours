const User = require("../models/userModel")
const catchAsync = require("../utils/catchAsync")

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

exports.createUser = (req, res) => {
  //500 => internal server error
  res.status(500).json({
    status: "error",
    message: "This route is not et defined :(",
  })
}
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
exports.deleteUser = (req, res) => {
  //500 => internal server error
  res.status(500).json({
    status: "error",
    message: "This route is not et defined :(",
  })
}
