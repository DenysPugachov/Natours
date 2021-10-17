const mongoose = require("mongoose")
const dotenv = require("dotenv")

//Catch exception (e.g. console.log(undeclared variable))
process.on("uncaughtException", err => {
  console.log("UNHANDLED EXCEPTION! Shuting down app...")
  console.log(err.name, err.message)
  //shutdown app immediately
  process.exit(1)
})

//config need to be defined before require("app")
dotenv.config({ path: "./config.env" })
const app = require("./app")

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD,
)

mongoose
  .connect(process.env.DATABASE_LOCAL, {
    // for local DB connection
    // .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    // console.log(con.connections)
    console.log("DB connection successful!")
  })

//server
const port = process.env.PORT || 8000
const server = app.listen(port, () => {
  console.log(
    `mode: ${process.env.NODE_ENV}
    App running on port ${port}...`,
  )
})

//handle global errors (catch unhandled rejection promises )
process.on("unhandledRejection", err => {
  console.log(err.name, err.message)
  console.log("UNHANDLED REJECTION! Shuting down app...")
  //close the server (wait for ending req.)
  server.close(() => {
    //shutdown app immediately
    process.exit(1)
  })
})
