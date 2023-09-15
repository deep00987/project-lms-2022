
const test = document.querySelector('.test')
const test2 = document.querySelector('.test2')
const CSRF_TOKEN = document.querySelector('meta[name="csrf-token"]').getAttribute('content')

const modal_close_btn = document.querySelector(".custom__close__btn")
const modal_wrapper = document.querySelector(".custom__modal__wrapper")

const classroom_data_parent = document.querySelector(".classroom__data__parent")

classroom_data_parent.addEventListener("click", processClassInput.bind())
modal_close_btn.addEventListener("click", processModalClose.bind())
modal_wrapper.addEventListener("click", processModalClose.bind())

test.addEventListener('click', function(e){
  
  if(!document.querySelector('.table__wrapper').classList.contains('hidden2')){
    document.querySelector('.class_room_parent').classList.remove('hidden2')
    document.querySelector('.table__wrapper').classList.add('hidden2')
    test.querySelector(".icon").classList.toggle("link__icon")
    test2.querySelector(".icon").classList.toggle("link__icon")
  }
  
})

test2.addEventListener('click', function(e){
  // document.querySelector('.class_room_parent').classList.add('hidden')
  // console.log(test2)

  // const ele = document.querySelector(".hidden");
  // ele.addEventListener("animationend", function(ev) {
  //   if (ev.type === "animationend") {
  //     console.log(ev)
  //     ele.style.display = "none";
  //     document.querySelector('.table__wrapper').style.display = "flex";
  //     document.querySelector('.table__wrapper').classList.remove('hidden')
  //   }
  // });
  
  if(!document.querySelector('.class_room_parent').classList.contains('hidden2')){
    document.querySelector('.table__wrapper').classList.remove('hidden2')
    document.querySelector('.class_room_parent').classList.add('hidden2')
    test.querySelector(".icon").classList.toggle("link__icon")
    test2.querySelector(".icon").classList.toggle("link__icon")
  }
  
})


function processClassInput(e){
  e.preventDefault()
  
  if(e.target.classList.contains("course__enroll__btn")){
    const class_room_id = +e.target.closest(".class__data__row").getAttribute("data-id")
    const data = {class_room_id : class_room_id}
    console.log(data)

    
    fetch("/api/classroom/join", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        'CSRF-Token': CSRF_TOKEN 
      },
      body: JSON.stringify(data)
    }).then(response => response.json())
      .then(data => {
        console.log(data)
        //alert(data.msg)
        let header = (data?.success === 1)?`Action Successful`: `Action Unsuccessful`
        let msg =  (data?.success === 1)?`Enrolled in the class successfully!`: data?.msg
        const result = {
          "header": header,
          "msg": msg
        }
        processModalOpen(result)
      })
  }

  if(e.target.classList.contains("course__optout__btn")){
    const class_room_id = +e.target.closest(".class__data__row").getAttribute("data-id")
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
        let header = (data?.success === 1)?`Action Successful`: `Action Unsuccessful`
        let msg =  (data?.success === 1)?`Class left successfully!`: data?.msg
        const result = {
          "header": header,
          "msg": msg
        }
        processModalOpen(result)
      })
  }

}

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

const logout__btn = document.querySelector(".logout__btn")
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
