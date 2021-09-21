const mongoose = require("mongoose")
const slugify = require("slugify")
const validator = require("validator")
// const User = require("./userModel")

//Schema
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name!"],
      unique: true, // no duplicate name
      trim: true,
      maxlength: [40, "A tour name length must have >= 40 char. "],
      minlength: [10, "A tour name length must have < 10 char. "],
      validate: {
        validator: val => validator.isAlpha(val, ["en-US"], { ignore: " " }),
        message: "A tour name must only contain characters between A-Z. ",
      },
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "A tour mus have a duration. "],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a group size. "],
    },
    difficulty: {
      type: String,
      required: [true, "A tour should have a difficulty. "],
      // validator for String ONLY!
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is either: easy, medium, difficult. ",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0. "],
      max: [5, "Rating must be below 5.0. "],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price! "],
    },
    priceDiscount: {
      type: Number,
      //CUSTOM VALIDATOR
      validate: {
        validator: function (discountVal) {
          // this only points to current doc on NEW document creation
          return discountVal < this.price
        },
        message: "Discount price {VALUE} should be below the regular price! ",
      },
    },
    summery: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      required: [true, "A tour must have a description. "],
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image. "],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, //hide field form showing for user
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    // reviews: [
    //   // Child referencing Tour -> Review
    //   {
    //     type: mongoose.Schema.ObjectId,
    //     ref: "Review", // connected with
    //   },
    // ],
  },
  //optional object
  {
    //each time as data outputted as JSON
    toJSON: { virtuals: true }, //virtual to be part of output
    toObject: { virtuals: true }, //output as Object
  },
)

//VIRTUAL PROPERTY: not persisted(saved) on DB, created on GET req.
// (*not work with query selection)
tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7
})

// virtual populating tour with reviews
tourSchema.virtual("reviews", {
  ref: "Review", // name of the model than we want to reference
  foreignField: "tour", // name of the field where in the ref:("Review") is stored info(id) about tour
  localField: "_id", // where this info(id) is actually stored in the current(Review.tour) model
})

//DOCUMENT MIDDLEWARE(hook): runs before events: .save(), .create() (NOT for .update())
//this = current document object
tourSchema.pre("save", function (next) {
  //slug - short alias for long URL
  this.slug = slugify(this.name, { lower: true })
  next() // call next middleware on the stack
})

// // retrieve full guide info in Tour document (Embedding)
// tourSchema.pre("save", async function (next) {
//   // this => current document
//   const guidesPromises = this.guides.map(async id => await User.findById(id))
//   this.guides = await Promise.all(guidesPromises)
//   next()
// })

//QUERY MIDDLEWARE => pre: processing query ("find" Hook) before execution
// this = current query obj
// /^find/ => all the command starts with "find..." (findOne, findAndDelete, findAndUpdate)
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } }) // find & hide all documents with "secretTour: true"
  this.start = Date.now()
  next()
})

// populate data about "guides" with id (Referencing)
tourSchema.pre(/^find/, function (next) {
  this.populate({ path: "guides", select: "name" })
  next()
})

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds! `)
  next()
})

// AGGREGATION MIDDLEWARE => exclude "secretTour: true" from aggregation result
// this = current aggregation obj
tourSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
  console.log(this.pipeline())
  next()
})

//Model(UpperCase)
const Tour = mongoose.model("Tour", tourSchema)

module.exports = Tour
