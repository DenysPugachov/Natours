const multer = require("multer")
const User = require("../models/userModel")
const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")
const factory = require("./handlerFactory")

//Store file to the disk
const multerStorage = multer.diskStorage({
  //destination where to store files
  destination: (req, file, cb) => {
    cb(null, "public/img/users")
  },
  //extract file name form uploaded file
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1] // get extension of the file
    //fileName: user-id-timeStamp.jpeg
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
  },
})

//filter uploaded files => only images allow
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true) // no error (file => image)
  } else {
    cb(new AppError("Not an image! Please upload only images!", 400), false)
  }
}

// Define settings for upload new user images
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
})

exports.uploadUserPhoto = upload.single("photo")

const filterObj = (obj, ...allowedFields) => {
  const newFilteredObj = {}
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) {
      newFilteredObj[el] = obj[el]
    }
  })
  return newFilteredObj
}

// pass current user id to URL params (implement getCurrent with getOne)
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id
  next()
}

exports.updateMe = catchAsync(async (req, res, next) => {
  // console.log("---23-userController: file: ", req.file)
  // console.log("---23-userController: body: ", req.body)

  // 1.Create err if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use route updateMyPassword!",
        400,
      ),
    )
  }
  // specify allowed fields to be update
  const filteredBody = filterObj(req.body, "name", "email")
  //add file path to update middleware
  if (req.file) filteredBody.photo = req.file.filename

  // 3.Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
  })

  res.status(200).json({
    status: "success",
    data: { updatedUser },
  })
})

exports.deleteMe = catchAsync(async (req, res, next) => {
  // find current logged user and switch active: false
  await User.findByIdAndUpdate(req.user.id, { active: false })

  res.status(204).json({
    status: "success",
    data: null,
  })
})

exports.getAllUsers = factory.getAll(User)
exports.createUser = factory.createOne(User)
exports.getUser = factory.getOne(User)
// Do NOT update password with this
exports.updateUser = factory.updateOne(User)
exports.deleteUser = factory.deleteOne(User)

// exports.deleteUser = (req, res) => {
//   //500 => internal server error
//   res.status(500).json({
//     status: "error",
//     message: "This route is not et defined :(",
//   })
// }
