const Review = require("../models/reviewModel")
const catchAsync = require("../utils/catchAsync")
const factory = require("./handlerFactory")

exports.getAllReviews = catchAsync(async (req, res, next) => {
  // get all review for tour(.../tours/tourId/reviews)
  let filterByTourId = {}
  if (req.params.tourId) filterByTourId = { tour: req.params.tourId }

  const reviews = await Review.find(filterByTourId)

  res.status(200).json({
    status: "success",
    results: reviews.length,
    data: {
      reviews,
    },
  })
})

exports.setTourUserIds = (req, res, next) => {
  //Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId
  if (!req.body.user) req.body.user = req.user.id
  next()
}

exports.createReview = factory.createOne(Review)

exports.updateReview = factory.updateOne(Review)

exports.deleteReview = factory.deleteOne(Review)

// exports.createReview = catchAsync(async (req, res, next) => {
//   const newReview = await Review.create(req.body)
//   res.status(201).json({
//     status: "success",
//     data: {
//       review: newReview,
//     },
//   })
// })
