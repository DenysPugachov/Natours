import axios from "axios"
import { showAlert } from "./alerts"

export const updateData = async (name, email) => {
  try {
    const res = await axios({
      method: "PATCH",
      url: "http://localhost:3000/api/v1/users/updateme",
      data: {
        name,
        email,
      },
    })

    if (res.data.status === "success") {
      showAlert("success", "Data updated successfully.")
    }
  } catch (err) {
    console.log(`--19-updateSetting: catch(err)`)
    showAlert("error", err.response.data.message)
  }
}
