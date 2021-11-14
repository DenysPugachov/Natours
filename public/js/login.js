/* eslint-disable */

import axios from "axios"
import { showAlert } from "./alerts"

export const login = async (email, password) => {
  console.log(email, password)
  try {
    const res = await axios({
      method: "POST",
      url: "http://localhost:3000/api/v1/users/login",
      data: {
        email,
        password,
      },
    })

    if (res.data.status === "success") {
      showAlert("success", "You are logged in successfully")
      // reload & redirect ot home page
      window.setTimeout(() => {
        location.assign("/")
      }, 1500)
    }
    console.log(res)
  } catch (err) {
    showAlert("error", err.response.data.message)
  }
}

export const logout = async () => {
  try {
    const res = await axios({
      method: "GET",
      url: "http://localhost:3000/api/v1/users/logout",
    })
    //TODO: location.reload(true) => force reload page (deprecated)
    if (res.data.status === "success") location.assign("/login")
  } catch (err) {
    console.log(err.response)
    showAlert("error", "Error logging out! Try again.")
  }
}
