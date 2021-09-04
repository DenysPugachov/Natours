const fs = require("fs")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const Tour = require("../../models/tourModel")

dotenv.config({ path: "./config.env" })

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD,
)

mongoose
  // .connect(process.env.DATABASE_LOCAL,{ // for local DB connection
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connection successful!"))

//read JSON file
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, "utf-8"),
)

//import data to DB
const importData = async () => {
  try {
    await Tour.create(tours)
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

console.log(process.argv)f
