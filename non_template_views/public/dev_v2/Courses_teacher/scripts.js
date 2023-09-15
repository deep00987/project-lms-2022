const modal_close_btn = document.querySelector(".custom__close__btn")
const modal_wrapper = document.querySelector(".custom__modal__wrapper")
const course_data_parent = document.querySelector(".course__data__parent")
const CSRF_TOKEN = document.querySelector('meta[name="csrf-token"]').getAttribute('content')

modal_close_btn.addEventListener("click", processModalClose.bind())
modal_wrapper.addEventListener("click", processModalClose.bind())
course_data_parent.addEventListener('click', processCourseInput.bind())

function processModalClose(){
  document.querySelector(".custom__modal__wrapper").classList.remove('modal__active')
  document.querySelector(".custom__modal__body").classList.remove('modal__animation')
  setTimeout(()=>{
    window.location.href = ''
  }, 100);
}

function processModalOpen(data){
  document.querySelector(".modal-title").textContent = data?.header
  document.querySelector(".modal-body-text").textContent = data?.msg
  document.querySelector(".custom__modal__wrapper").classList.add('modal__active')
  document.querySelector(".custom__modal__body").classList.add('modal__animation')
}



function processCourseInput(e){
  e.preventDefault()
  //console.log(e.target.closest(".course__data__row").getAttribute("data-id"))

  if(e.target.classList.contains("course__enroll__btn")){
    const course_id = +e.target.closest(".course__data__row").getAttribute("data-id")
    console.log(course_id)
    const data = {course_id : course_id}
    console.log(data)
    fetch("/api/staff/courses/start_teaching", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        'CSRF-Token': CSRF_TOKEN,
      },
      body: JSON.stringify(data)
    }).then(response => response.json())
      .then(data => {
        console.log(data)
        //alert(data.msg)
        let header = (data?.success === 1)?`Action Successful`: `Action Unsuccessful`
        let msg =  (data?.success === 1)?`Started teaching course successfully!`: data?.msg
        const result = {
          "header": header,
          "msg": msg
        }
        processModalOpen(result)
      })
  }

  if(e.target.classList.contains("course__optout__btn")){
    const course_id = +e.target.closest(".course__data__row").getAttribute("data-id")
    console.log(course_id)

    const data = {course_id : course_id}
    console.log(data)
    fetch("/api/staff/courses/opt_out", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        'CSRF-Token': CSRF_TOKEN,
      },
      body: JSON.stringify(data)
    }).then(response => response.json())
      .then(data => {
        console.log(data)
        //alert(data.msg)
        let header = (data?.success === 1)?`Action Successful`: `Action Unsuccessful`
        let msg =  (data?.success === 1)?`Course left successfully!`: data?.msg
        const result = {
          "header": header,
          "msg": msg
        }
        processModalOpen(result)
      })
  }

}

const logout__btn = document.querySelector(".logout__btn")
logout__btn.addEventListener("click", processStaffLogout.bind())

function processStaffLogout(e){
  console.log(e)
  //e.preventDefalut()
  fetch("/api/auth/staff/logout")
  .then(response=>response.json())
  .then(data=>{
    console.log(data)
    window.location.href = "/staff/login"
  })
}