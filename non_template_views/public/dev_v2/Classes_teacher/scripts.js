
const test = document.querySelector('.test')
const test2 = document.querySelector('.test2')


const modal_close_btn = document.querySelector(".custom__close__btn")
const modal_wrapper = document.querySelector(".custom__modal__wrapper")

const course_name_input = document.querySelector(".course_name_input")
const class_room_name_data = document.querySelector(".classroom_name_data")
const classroom_create_btn = document.querySelector(".classroom_create_btn")
const CSRF_TOKEN = document.querySelector('meta[name="csrf-token"]').getAttribute('content')



modal_close_btn.addEventListener("click", processModalClose.bind())
modal_wrapper.addEventListener("click", processModalClose.bind())
classroom_create_btn.addEventListener("click", processClassroomCreate.bind())



test.addEventListener('click', function(e){
  
  if(!document.querySelector('.classroom_form_wapper').classList.contains('hidden2')){
    document.querySelector('.class_room_parent').classList.remove('hidden2')
    document.querySelector('.classroom_form_wapper').classList.add('hidden2')
    test.querySelector(".icon").classList.toggle("link__icon")
    test2.querySelector(".icon").classList.toggle("link__icon")
  }
  
})

test2.addEventListener('click', function(e){
  
  if(!document.querySelector('.class_room_parent').classList.contains('hidden2')){
    document.querySelector('.classroom_form_wapper').classList.remove('hidden2')
    document.querySelector('.class_room_parent').classList.add('hidden2')
    test.querySelector(".icon").classList.toggle("link__icon")
    test2.querySelector(".icon").classList.toggle("link__icon")
  }
  
})

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

course_name_input.addEventListener("change", function(e){
  let index = course_name_input.selectedIndex
  document.querySelector(".course_code").placeholder = course_name_input.options[index].getAttribute("data-course-code")
})

function processClassroomCreate(e){
  e.preventDefault()
  console.log(e.target)

  const class_name = class_room_name_data.value
  const course_id = course_name_input.value
  console.log(class_name, course_id)

  if(!class_name || !course_id){
    processModalOpen({
      "header": "Action Unsuccessful!",
      "msg":"Please fill out the Form to continue"
    })
    return
  }
  const data = {class_name,course_id}
  fetch('/api/staff/class/create', {
    method:"POST", 
    headers: {
      'content-type' : 'application/json',
      'CSRF-Token': CSRF_TOKEN
    },
    body: JSON.stringify(data)
  }).then(response=>response.json())
  .then(data =>{
    console.log(data)
    //alert(data.msg)
    let header = (data?.success === 1)?`Action Successful`: `Action Unsuccessful`
    let msg =  (data?.success === 1)?`Class created successfully!`: data?.msg
    const result = {
      "header": header,
      "msg": msg
    }
    processModalOpen(result)
  })

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