/**eslint-disable */

export const hideAlert = () => {
  const el = document.querySelector(".alert")
  if (el) el.parentElement.removeChild(el) // remove alert element
}

//type is "success" or "error"
export const showAlert = (type, msg) => {
  hideAlert()
  const markup = `<div class="alert alert--${type}">${msg}</div>`
  document.querySelector("body").insertAdjacentHTML("afterbegin", markup)
  // remove all alert after 5sec
  window.setTimeout(hideAlert, 1500)
}
