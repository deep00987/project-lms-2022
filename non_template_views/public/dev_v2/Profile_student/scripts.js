const modal_close_btn = document.querySelector(".custom__close__btn")
const modal_wrapper = document.querySelector(".custom__modal__wrapper")

const student_term_data_input = document.querySelector(".student_term_data_input")
const CSRF_TOKEN = document.querySelector('meta[name="csrf-token"]').getAttribute('content')

modal_close_btn.addEventListener("click", processModalClose.bind())
modal_wrapper.addEventListener("click", processModalClose.bind())


function processModalClose() {
  document.querySelector(".custom__modal__wrapper").classList.remove('modal__active')
  document.querySelector(".custom__modal__body").classList.remove('modal__animation')
  setTimeout(() => {
    window.location.href = ''
  }, 100);
}

function processModalOpen(data) {
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

function readURL(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();

    reader.onload = function (e) {
      $('#imageResult')
        .attr('src', e.target.result);
    };
    reader.readAsDataURL(input.files[0]);
  }
}

$(function () {
  $('#upload').on('change', function () {
    readURL(input);
  });
});


var input = document.getElementById('upload');
var infoArea = document.getElementById('upload-label');

input.addEventListener('change', showFileName);
function showFileName(event) {
  var input = event.srcElement;
  var fileName = input.files[0].name;
  infoArea.textContent = 'File name: ' + fileName;
  document.querySelector(".text_img_header").textContent = ``;
  document.querySelector(".text_img_info").textContent = `Uploaded Image Item`
}

let email__update__btn = document.querySelector(".btn__update__email")
email__update__btn.addEventListener("click" , handleImgUplaod.bind())

function handleImgUplaod(e){
  // processModalOpen({
  //   "header":"ok",
  //   "msg" : "ok"
  // })
  const data = document.getElementById("email_change").value;
  if(!data){
    processModalOpen({
      "header":"Action Unsuccessful",
      "msg" : "NO value entered"
    })
    return
  }
  const reg_ex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  if(!data.match(reg_ex)){
    processModalOpen({
      "header":"Action Unsuccessful",
      "msg" : "Invalid format"
    })
    return
  }
  const payload = {email : data}
  fetch("/api/students/update/email", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      'CSRF-Token': CSRF_TOKEN,
    },
    body: JSON.stringify(payload)
  }).then(response => response.json())
    .then(data => {
      console.log(data)
      //alert(data.msg)
      let header = (data?.success === 1) ? `Action Successful` : `Action Unsuccessful`
      let msg = data?.msg
      const result = {
        "header": header,
        "msg": msg
      }
      processModalOpen(result)
    })

  console.log(e.target, data)
}


let passwd__change__btn = document.querySelector(".change__passwd__btn")

passwd__change__btn.addEventListener("click", handlePasswdChange.bind())

function handlePasswdChange(e){

  const pass1 = document.getElementById("pass_1_change").value
  const pass2 = document.getElementById("pass_2_change").value

  if(!pass1 || !pass2){
    processModalOpen({"header" :"Action Unsuccessful","msg": "Field empty"})
    return
  }
  const reg_ex = /^[a-z0-9@_]+$/i
  if(!pass1.match(reg_ex) || !pass2.match(reg_ex)){
    processModalOpen({"header" :"Action Unsuccessful","msg": "Invalid format"})
    return
  }

  if(pass1 !== pass2){
    processModalOpen({"header" :"Action Unsuccessful","msg": "Both fields nust me same"})
    return
  }
  const payload = {password : pass1}
  fetch("/api/students/update/passwd", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      'CSRF-Token': CSRF_TOKEN,
    },
    body: JSON.stringify(payload)
  }).then(response => response.json())
    .then(data => {
      console.log(data)
      //alert(data.msg)
      let header = (data?.success === 1) ? `Action Successful` : `Action Unsuccessful`
      let msg = data?.msg
      const result = {
        "header": header,
        "msg": msg
      }
      processModalOpen(result)
    })

}