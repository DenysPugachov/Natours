const mongoose = require("mongoose")
const validator = require("validator")
const Tour = require("./tourModel")

// review / rating / createdAt / ref to tour / ref to user who wrote the review

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Write an list 1 word."],
      trim: true,
      minlength: [3, "A review must have min 3 char."],
      maxlength: [2000, "A review size overflow (2000 char)."],
      validate: {
        validator: val =>
          validator.isAlpha(val, ["en-US"], { ignore: " .,0123456789!" }),
        message: "A review must only contain characters between A-Z. ",
      },
    },
    rating: {
      type: Number,
      required: [true, "Please, rate this tour."],
      min: [1, "Rating, must be above 1.0"],
      max: [5, "Rating, must be below 5.0"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    tour: {
      // Parent referencing
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "Review must belong to a tour."],
    },
    user: {
      // Parent referencing
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user (author)."],
    },
  },
  //option object to calculate data
  {
    //calculate this data every time when outputted as JSON
    toJSON: { virtuals: true }, //virtual to be part of output
    toObject: { virtuals: true }, //output as Object
  },
)

// populate referencing data with middleware
reviewSchema.pre(/^find/, function (next) {
  // populate({ path: "tour", select: "name" })
  this.populate({
    path: "user",
    select: "name photo",
  })
  next()
})

//static method for calculating average rating for selected Tour(tourId)
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  //this = current model
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }, // select all the reviews that match tourId
    },
    {
      $group: {
        //_id: groping all tours together by tour
        _id: "$tour",
        //fields to be displayed
        nRating: { $sum: 1 }, // + 1 to each tour that match in previous step
        avgRating: { $avg: "$rating" }, // average of ratings
      },
    },
  ])
  console.log("stats=", stats)

  //update Tour with statistics data
  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0].nRating,
    ratingsAverage: stats[0].avgRating,
  })
}

// .post = after new review has been created
reviewSchema.post("save", function () {
  //this => current review
  //this.constructor => current Model
  this.constructor.calcAverageRatings(this.tour)
})

//create Model out of schema
const Review = mongoose.model("Review", reviewSchema)

module.exports = Review
