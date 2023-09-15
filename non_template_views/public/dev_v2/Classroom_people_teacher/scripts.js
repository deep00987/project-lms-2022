const posts = document.querySelectorAll(".post__container")
const commentItem = document.querySelectorAll(".post__reply__container")
const comment__util__btn = document.querySelectorAll(".util__comment__btn__mui")
const post__util__btn = document.querySelectorAll(".util__post__btn__mui")
const CSRF_TOKEN = document.querySelector('meta[name="csrf-token"]').getAttribute('content')


const modal_close_btn = document.querySelector(".custom__close__btn")
const modal_wrapper = document.querySelector(".custom__modal__wrapper")

modal_close_btn.addEventListener("click", processModalClose.bind())
modal_wrapper.addEventListener("click", processModalClose.bind())

commentItem.forEach(item =>{
  item.addEventListener("click", handlePostComment.bind())
})

comment__util__btn.forEach(btn => {
  btn.addEventListener("click", handleCommmentUtil.bind())
})

post__util__btn.forEach(btn => {
  btn.addEventListener("click", handlePostUtil.bind())
})


posts.forEach(post=>{
  post.addEventListener("click", processPostEvent.bind())
})

function processPostEvent(e){
  //console.log(e.target)
  if(e.target.classList.contains("show__comments__btn")){
    let data = e.currentTarget.querySelector(".post__comment__container")
    e.target.closest('.post__comment__header').classList.toggle("toggle__border")
    data.classList.toggle("hidden")
    console.log(data)
  }
  
}

function handlePostComment(e){
  if(e.target.classList.contains("commentButton") || e.target.classList.contains("material-icons-sharp")){
    let res = e.currentTarget.querySelector(".commentTerm").value.trim()
    if(!res){
      processModalOpen()
    }
    let data = {
      "comment_content": res,
      "class_room_id":e.currentTarget.getAttribute("data_room_id"),
      "class_post_id":e.currentTarget.getAttribute("data_post_id"), 
    }
    
    console.log(data)
  }
}

function handleCommmentUtil(e){
  const parentTarget = e.target.closest(".comment__item")
  data = {
    "comment_id": parentTarget.getAttribute("data_id"),
    "post_id": parentTarget.getAttribute("data_post_id")
  }
  console.log(data)
}


function handlePostUtil(e){
  const parentTarget = e.target.closest(".post__container")
  data = {
    "post_id": parentTarget.getAttribute("data-id")
  }
  console.log(data)
}


function processModalClose(){
  document.querySelector(".custom__modal__wrapper").classList.remove('modal__active')
  document.querySelector(".custom__modal__body").classList.remove('modal__animation')
  setTimeout(()=>{
    location.reload()
  }, 100);
}

function processModalOpen(){
  document.querySelector(".modal-title").textContent = "Action Unsuccessful"
  document.querySelector(".modal-body-text").textContent = "Write Something to post a comment"
  document.querySelector(".custom__modal__wrapper").classList.add('modal__active')
  document.querySelector(".custom__modal__body").classList.add('modal__animation')
}

const logout__btn = document.querySelector(".logout__btn__classroom")
logout__btn.addEventListener("click", processStaffLogout.bind())

function processStaffLogout(e){
  e.preventDefault()
  console.log(e)
  //e.preventDefalut()
  fetch("/api/auth/staff/logout")
  .then(response=>response.json())
  .then(data=>{
    console.log(data)
    window.location.href = "/staff/login"
  })
}

const remove_class_btn_teacher = document.querySelector(".teacher__remove__class__btn");
remove_class_btn_teacher.addEventListener("click", handleClassDelete.bind())


function handleClassDelete(e){
  //console.log(e.target.closest(".teacher__remove__class__btn").getAttribute("data_c_r_id"))
  const class_room_id = +e.target.closest(".teacher__remove__class__btn").getAttribute("data_c_r_id")
  console.log(class_room_id)

  data = {
    "class_room_id": class_room_id
  }
  fetch('/api/staff/class/delete_class_room',{
    method:'POST',
    headers: {
      'content-type' : 'application/json',
      'CSRF-Token': CSRF_TOKEN,
    },
    body: JSON.stringify(data)
  }).then(response =>response.json())
  .then(data =>{
    console.log(data)
    
    window.location.href = '/development/teacher/classes'
  })


}