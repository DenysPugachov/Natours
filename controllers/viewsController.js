const Tour = require("../models/tourModel")
const User = require("../models/userModel")
const catchAsync = require("../utils/catchAsync")
const AppError = require("../utils/appError")

exports.getOverview = catchAsync(async (req, res, next) => {
  //1. Get tour data form Collection
  const tours = await Tour.find()
  res.status(200).render("overview", {
    title: "All tours",
    tours,
  })
})

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: "reviews",
    fields: "review rating user",
  })

  if (!tour) {
    return next(new AppError("There is no tour with that name!", 404))
  }

  res
    .status(200)
    .set
    // "Content-Security-Policy",
    // "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;",
    ()
    .render("tour", {
      title: `${tour.title} Tour`,
      tour,
    })
})

exports.getLoginForm = catchAsync(async (req, res, next) => {
  res.status(200).render("login", {
    title: "Log in ",
  })
})

exports.getAccount = (req, res) => {
  res.status(200).render("account", {
    title: "Your account",
  })
}

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true, // get new(updated) document as a result
      runValidators: true,
    },
  )
  //after updating user data, render account page again
  res.status(200).render("account", {
    title: "Your account",
    user: updatedUser,
  })
})
