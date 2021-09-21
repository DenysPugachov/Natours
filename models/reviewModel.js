const mongoose = require("mongoose")
const validator = require("validator")
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
        validator: val => validator.isAlpha(val, ["en-US"], { ignore: " " }),
        message: "A review must only contain characters between A-Z. ",
      },
    },
    rating: {
      type: Number,
      required: [true, "Please, rate this tour."],
      min: [1, "Rating, must be above 1.0"],
      max: [1, "Rating, must be below 5.0"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "Review must belong to a tour."],
    },
    user: {
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
  this.populate("tour", "user")
})

//create Model out of schema
const Review = mongoose.model("Review", reviewSchema)

module.exports = Review
