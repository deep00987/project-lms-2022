const posts = document.querySelectorAll(".post__container")
const commentItem = document.querySelectorAll(".post__reply__container")
const comment__util__btn = document.querySelectorAll(".util__comment__btn__mui")
const post__util__btn = document.querySelectorAll(".util__post__btn__mui")
const CSRF_TOKEN = document.querySelector('meta[name="csrf-token"]').getAttribute('content')
const class__leave__btn = document.querySelector('.student__remove__class__btn')

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

class__leave__btn.addEventListener("click", handleClassDelete.bind())

posts.forEach(post=>{
  post.addEventListener("click", processPostEvent.bind())
  const comment_count = +post.querySelector(".post__comment__header").getAttribute("data_c_count")
  console.log(comment_count)
  if(comment_count === 0){
    post.querySelector(".post__comment__header").classList.toggle("toggle__border")
    console.log(post.querySelector(".post__comment__header"))
    post.querySelector(".post__comment__container").classList.toggle("hidden")
    console.log(post.querySelector(".post__comment__container"))
    
  }
})

$(document).ready(function () {
  $('.mdl-layout__content').animate({
      scrollTop: $(`#${localStorage.getItem("scrollPosition")}`).offset().top
  }, 'slow');
  //document.getElementById(localStorage.getItem("scrollPosition")).scrollIntoView({behavior: 'smooth'})
  localStorage.setItem("scrollPosition", ``)
});


function processPostEvent(e){
  //console.log(e.target)
  if(e.target.classList.contains("show__comments__btn")){
    let data = e.currentTarget.querySelector(".post__comment__container")
    e.target.closest('.post__comment__header').classList.toggle("toggle__border")
    data.classList.toggle("hidden")
    console.log(data)
  }
  
}

async function handlePostComment(e){
  if(e.target.classList.contains("commentButton") || e.target.classList.contains("material-icons-sharp")){
    let res = await e.currentTarget.querySelector(".commentTerm")
    let sp = e.currentTarget.parentNode.querySelector(".post__comment__header").getAttribute("id")
    localStorage.setItem('scrollPosition', sp)
    if(!res.value){
      processModalOpen({
        "title": "Action unsuccessful",
        "msg" : "filed cannot be empty"
      })
      return
    }
    let data = {
      "content": res.value.trim(),
      "class_room_id":e.currentTarget.getAttribute("data_room_id"),
      "class_post_id":e.currentTarget.getAttribute("data_post_id"), 
    }
    
    console.log(data)
    //let data = {class_post_id,class_room_id, content}
    if(!data.content){
      return
    }

    await fetch('/api/classroom/comment',{
      method:'POST',
      headers: {
        'content-type' : 'application/json',
        'CSRF-Token': CSRF_TOKEN,
      },
      body: JSON.stringify(data)
    }).then(response =>response.json())
    .then(data =>{
      console.log(data)
      processModalOpen({
        "title" : (data.success = 1)? `Action successful` : `Action unsuccessful`,
        "msg" : data.msg
      })
      
      //window.location.reload()
    })


    console.log(data)
  }
}

async function handleCommmentUtil(e){
  const parentTarget = e.target.closest(".comment__item")
  let sp = e.currentTarget.closest(".menu").parentNode.parentNode.previousElementSibling.getAttribute("id")
  localStorage.setItem('scrollPosition', sp)
  data = {
    "comment_id": parentTarget.getAttribute("data_id"),
    "class_post_id": parentTarget.getAttribute("data_post_id"),
    "class_room_id": parentTarget.getAttribute("data_room_id")
  }

  if(!data.comment_id || !data.class_room_id || !data.class_post_id){
    processModalOpen({
      "title": "Action unsuccessful",
      "msg" : "Something went wrong"
    })
    return
  }

  await fetch('/api/classroom/comment/delete',{
      method:'POST',
      headers: {
        'content-type' : 'application/json',
        'CSRF-Token': CSRF_TOKEN,
      },
      body: JSON.stringify(data)
    }).then(response =>response.json())
    .then(data =>{
      console.log(data)
      processModalOpen({
        "title" : (data.success = 1)? `Action successful` : `Action unsuccessful`,
        "msg" : data.msg
      })
      
      //window.location.reload()
    })


  console.log(data)
}

function handleClassDelete(e){
  const class_room_id = +e.target.closest(".student__remove__class__btn").getAttribute("data_c_r_id")
  console.log(e.target, class_room_id)

  const data = {class_room_id : class_room_id}
  console.log(data)

  fetch("/api/classroom/leave", {
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
      let header = (data?.success === 1) ? `Action Successful` : `Action Unsuccessful`
      let msg = (data?.success === 1) ? `Class left successfully!` : data?.msg
      const result = {
        "header": header,
        "msg": msg
      }
      //processModalOpen(result)
      window.location.href = '/development/student/classes'
    })


}


async function processModalClose(){
  document.querySelector(".custom__modal__wrapper").classList.remove('modal__active')
  document.querySelector(".custom__modal__body").classList.remove('modal__animation')
  setTimeout(()=>{
    document.location.reload()
  }, 200);
}

function processModalOpen(data){
  document.querySelector(".modal-title").textContent = data.title
  document.querySelector(".modal-body-text").textContent = data.msg
  document.querySelector(".custom__modal__wrapper").classList.add('modal__active')
  document.querySelector(".custom__modal__body").classList.add('modal__animation')
}

const logout__btn = document.querySelector(".logout__btn__classroom")
logout__btn.addEventListener("click", processLogout.bind())

function processLogout(e) {
  console.log(e.target)

  fetch("/api/auth/logout")
    .then(response => response.json())
    .then(data => {
      console.log(data)
      window.location.href = "/login"
    })


}
