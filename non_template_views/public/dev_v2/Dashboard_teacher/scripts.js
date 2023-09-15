
const modal_close_btn = document.querySelector(".custom__close__btn")
const modal_wrapper = document.querySelector(".custom__modal__wrapper")

modal_close_btn.addEventListener("click", processModalClose.bind())
modal_wrapper.addEventListener("click", processModalClose.bind())


// for( let i = 1; i <= 6; i++){
//   html += `
//   <div class="accordion-item">
//     <h2 class="accordion-header" id="heading__${i}">
//       <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse__${i}" aria-expanded="true" aria-controls="collapse__${i}">
//         Accordion Item #${i}
//       </button>
//     </h2>
//     <div id="collapse__${i}" class="accordion-collapse collapse" aria-labelledby="heading__${i}" data-bs-parent="#accordion__table__info">
//       <div class="accordion-body">
//         <strong>This is the first item's accordion body.</strong> 
//         It is shown by default, until the collapse plugin adds the appropriate classes that we use to style each element. 
//         These classes control the overall appearance, as well as the showing and hiding via CSS transitions. 
//         You can modify any of this with custom CSS or overriding our default variables. 
//         It's also worth noting that just about any HTML can go within the 
//         <code>.accordion-body</code>, though the transition does limit overflow.
//       </div>
//     </div>
//   </div>   
//   `
// }
// element.innerHTML = html
// console.log(html)


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