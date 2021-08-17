const dotenv = require("dotenv")

//config need to be defined before require("app")
dotenv.config({ path: "./config.env" })
// console.log(process.env)

const app = require("./app")


const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`App running on port ${port}...`)
})
