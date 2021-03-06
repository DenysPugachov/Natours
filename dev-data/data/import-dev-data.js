const fs = require("fs")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const Tour = require("../../models/tourModel")
const User = require("../../models/userModel")
const Review = require("../../models/reviewModel")

dotenv.config({ path: "./config.env" })

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD,
)

mongoose
  // for local DB connection
  // .connect(process.env.DATABASE_LOCAL, {
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connection successful!"))

//read JSON file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8"))
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, "utf-8"))
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, "utf-8"),
)

//import data to DB
const importData = async () => {
  try {
    await Tour.create(tours)
    await User.create(users, { validateBeforeSave: false })
    await Review.create(reviews)
    console.log("Data successfully loaded!")
  } catch (error) {
    console.log(error)
  }
  process.exit() //stop process in aggressive way
}

//Delete add data from DB
const deleteData = async () => {
  try {
    await Tour.deleteMany()
    await User.deleteMany()
    await Review.deleteMany()
    console.log("Data successfully deleted!")
  } catch (error) {
    console.log(error)
  }
  process.exit() //stop process in aggressive way
}

if (process.argv[2] === "--import") {
  importData()
} else if (process.argv[2] === "--delete") {
  deleteData()
} else {
  console.log("Error!!! Wrong flag. Choose one of --import or --delete")
}

console.log(process.argv)

// node ./dev-data/data/import-dev-data.js --delete
// node ./dev-data/data/import-dev-data.js --import
