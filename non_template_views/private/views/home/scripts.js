const dataContainer = document.querySelector('.student__data__new')
const logout_link = document.querySelector('.logout__link')

const dashboard = document.querySelector('.nav__dashboard')
const addmission = document.querySelector('.nav__addmission')
const courses = document.querySelector('.nav__courses')
const classes = document.querySelector('.nav__classes')
const student_name = document.querySelector('.student__data')
const dash_c2 = document.querySelector('.dash__c2')

//event listeners 
logout_link.addEventListener('click', logoutUser.bind())
dashboard.addEventListener('click', ShowStudentInfo.bind())
addmission.addEventListener('click', getAddmission.bind())
courses.addEventListener('click', getCoursesData.bind())
classes.addEventListener('click', showClassRooms.bind())

ShowStudentInfo()




function ShowStudentInfo(){

  fetch("http://localhost:5500/api/home", {
    method:'GET',
    headers: {
      'content-type':'application/json'
    },
  
  }).then(response =>response.json())
    .then(data =>{
      // if(!data.success){
      //   return
      // }
      console.log(data)
      student_name.innerHTML = `<p>${data.student_info[0].fname} ${data.student_info[0].lname}</p>`
      getDashBoard(data)
      // console.log(data.data[0])
      
    })
    
}


function logoutUser(e){
  console.log(e)
  //e.preventDefalut()
  fetch("http://localhost:5500/api/auth/logout")
  .then(response=>response.json())
  .then(data=>{
    console.log(data)
    window.location.href = "/login"
  })

}

function getDashBoard(data){
  
  const html1 = `
    <div class = "data_row_1">
      <div class = "data_1_item data_1_1">
        <h3>Student Info</h3>
        <hr>
        <p>Name: ${data.student_info[0]?.fname} ${data.student_info[0]?.lname}</p>
        <p>Email: ${data.student_info[0]?.email}</p>
        <p>Student ID: ${data.student_info[0]?.student_id}</p>
      </div>
      <div class = "data_1_item data_1_2">
        <h3>Academics</h3>
        <hr>
        <p>Departmnet: ${data.student_info[0]?.dept_name} </p>
        <p>Term: ${data.student_info[0]?.term_name}</p>
      </div>
  `
  let html2 = `
    <div class = "data_1_item data_1_3">
      <h3>Available courses</h3>
      <hr>   
  `
  data.available_courses.forEach(item=>{
    console.log(item)
    html2 += `
      <p> ${item.course_code} <p>
    `
  })
  html2+= `
      </div>
    </div>
  `
  const result = html1 + html2
  console.log(result)
  document.querySelector('.dash__c2').innerHTML = ``
  document.querySelector('.dash__c2').insertAdjacentHTML('beforeend', result)

  let newHtml = `
    <div class = "data_dynamic_item">
      <p>Courses You are currently enrolled in --></p>
  `
  console.log(data.courses_enrolled.length)
  if(data.courses_enrolled.length === 0){
    newHtml += `<p>No courses</p>`
  }else{
    data.courses_enrolled.forEach(item =>{
      newHtml += `<p>${item.course_name}</p>`
    })
  }
  newHtml += `
    </div>
  `

  document.querySelector('.dash__c2').insertAdjacentHTML('beforeend', newHtml)
}

function getCoursesData(){
  let html = `
    <div class = "course_data_wrapper">
      <div class = "data_row_x">
        <div>Available courses to enroll</Sdiv>
        <table class = "course__data ">
          <tr>
            <th>Course ID</th>
            <th>Course Code</th>
            <th>Course Name</th>
            <th>Enroll</th>
            <th>Opt out</th>
          </tr>
          
          
       
  `
  
  fetch("http://localhost:5500/api/home", {
    method:'GET',
    headers: {
      'content-type':'application/json'
    },
  
  }).then(response =>response.json())
    .then(data =>{
      // if(!data.success){
      //   return
      // }
      console.log(data?.available_courses)
      
      data.available_courses.forEach(obj =>{

        html += `
        <tr class = "data__row" data-id = "${obj?.course_id}"> 
          <td>${obj?.course_id}</td>
          <td>${obj?.course_code}</td>
          <td>${obj?.course_name}</td>
          <td><button class = "enroll-btn">Enroll</button></td>
          <td><button class = "opt-out-btn">Opt out</button></td>  
        </tr>
        `
      })      
      html += `
          </table>
          </div>
        </div>
      `
      // console.log(data.data[0])
      dash_c2.innerHTML = html
      document.querySelector(".course__data").addEventListener("click", processCourseData.bind())
    })
  
}

function processCourseData(e){
  const course_id = +e.target.closest(".data__row").getAttribute("data-id")
  const data = {course_id : course_id}
  if(e.target.classList.contains('enroll-btn')){
    fetch("http://localhost:5500/api/courses/enroll",{
      method:"POST",
      headers:{
        "content-type":"application/json"
      },
      body: JSON.stringify(data)
      }).then(response=>response.json())
      .then(data=>{
      console.log(data)
      alert(data.msg)
      
    })
  }

  if(e.target.classList.contains('opt-out-btn')){
    fetch("http://localhost:5500/api/courses/opt_out",{
      method:"POST",
      headers:{
        "content-type":"application/json"
      },
      body: JSON.stringify(data)
      }).then(response=>response.json())
      .then(data=>{
      console.log(data)
      alert(data.msg)
      
    })
  }

  
}

function getAddmission(e){

  let html = `
    <div class = "addmission_data_wrapper">
      <div class = "data_row_1">
        <div class="custom-ele form-sub-group">
          <label for="term">Select term to get addmission</label>
          <select name="term" id="form__term" required>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
          <button class = "term-addmission-btn">Submit</button>
        </div>
      </div>
    </div>
  ` 

  dash_c2.innerHTML = html
  document.querySelector(".term-addmission-btn").addEventListener('click', processAddmission.bind())

}

function processAddmission(){
  
  const term_id = +document.getElementById("form__term").value

  let data = {term_id : term_id}
  console.log(term_id)
  fetch("http://localhost:5500/api/addmission", {
    method:"POST",
    headers:{
      "content-type":"application/json"
    },
    body: JSON.stringify(data)
  }).then(response => response.json())
  .then(data => {
    console.log(data)
    alert(data?.msg)
    ShowStudentInfo()
  })

}

function showClassRooms(e){
  console.log(e)
  let html = `
    <div class = "course_data_wrapper">
      <div class = "course_data_btn">
        <button class = "joined_class_btn">Joined classes</button>
        <button class = "available_class_btn">Available classes</button>
      </div>
      <div class = "data_row_x available_class_rooms hidden">
        <div class = "header_class_room_data">Available Classrooms to join <i class="fa fa-arrow-right icon" aria-hidden="true"></i></div>
        <table class = "course__data ">
          <tr>
            <th>Classroom ID</th>
            <th>Course Code</th>
            <th>Course Name</th>
            <th>Join Class</th>
            <th>Leave Class</th>
          </tr> 
       
  `
  
  fetch("http://localhost:5500/api/home", {
    method:'GET',
    headers: {
      'content-type':'application/json'
    },
  
  }).then(response =>response.json())
    .then(data =>{
      // if(!data.success){
      //   return
      // }
      console.log(data?.classrooms_for_courses)
      
      data?.classrooms_for_courses.forEach(obj =>{

        html += `
        <tr class = "data__row" data-id = "${obj?.class_room_id}"> 
          <td>${obj?.class_room_id}</td>
          <td>${obj?.course_code}</td>
          <td>${obj?.course_name}</td>
          <td><button class = "enroll-btn">Join class</button></td>
          <td><button class = "opt-out-btn">Leave class</button></td>  
        </tr>
        `
      })      
      html += `
          </table>
          </div>
        </div>
        <div class = "joined_class_rooms" >
          
        </div>
      `
      // console.log(data.data[0])
      dash_c2.innerHTML = html
      showJoinedClassRooms();
      dash_c2.addEventListener('click', function(e){
        if(e.target.classList.contains('available_class_btn')){
          console.log(e.target)
          document.querySelector('.joined_class_rooms').classList.add('hidden')
          document.querySelector('.available_class_rooms').classList.remove('hidden')
        }
        if(e.target.classList.contains('joined_class_btn')){
          console.log(e.target)
          document.querySelector('.available_class_rooms').classList.add('hidden')
          document.querySelector('.joined_class_rooms').classList.remove('hidden')
          showJoinedClassRooms();
        }
      })


      document.querySelector(".course__data").addEventListener("click", processClassRoom.bind())
    })


}

function processClassRoom(e){
  const class_room_id = +e.target.closest(".data__row").getAttribute("data-id")
  const data = {class_room_id : class_room_id}
  console.log(data)

  if(e.target.classList.contains('enroll-btn')){
    fetch("http://localhost:5500/api/classroom/join",{
      method:"POST",
      headers:{
        "content-type":"application/json"
      },
      body: JSON.stringify(data)
      }).then(response=>response.json())
      .then(data=>{
      console.log(data)
      alert(data.msg)
      
    })
  }

  if(e.target.classList.contains('opt-out-btn')){
    fetch("http://localhost:5500/api/classroom/leave",{
      method:"POST",
      headers:{
        "content-type":"application/json"
      },
      body: JSON.stringify(data)
      }).then(response=>response.json())
      .then(data=>{
      console.log(data)
      alert(data.msg)
      
    })
  }

}

function showJoinedClassRooms(){

  let html = `
  <div class="card-main-container">
  <hr>
  
  <div class="cards"> 
`
  
  let html2 = `
        </div>
      </div>
    `

  fetch('http://localhost:5500/api/home/',{
    method:"GET",
    headers: {
      'content-type' : 'application/json'
    },
  }).then(response=>response.json())
  .then(data=>{
    console.log(data)

    if(data?.class_rooms_joined.length === 0){
      html += `
        <div class = "classroom_place_holder">
          <p>No classrooms to show</p>
        </div> 
      `
    }else{
      
      data?.class_rooms_joined.forEach(item => {
        html +=`
          <div class="card" data-id = "${item?.class_room_id}">
            
            <div class="card__title">
              <div class = "card__title_body"><p><i class="fa fa-wpforms  fa-lg icon" aria-hidden="true"></i> ${item?.class_name}</p></div>
            </div>
            <div class = "card__body">
              <div class = "card__body__item"><p><i class="fa fa-book icon" aria-hidden="true"></i> Code: ${item?.course_code}</p></div>
              <div class = "card__body__item"><p> <i class="fa fa-user icon" aria-hidden="true"></i> Instructor: ${item?.fname} ${item?.lname}</p></div>
            </div>
          </div>
        `
      })

    }

    html += html2;
    document.querySelector('.joined_class_rooms').innerHTML = html
    document.querySelector('.cards').addEventListener('click', openClassRoom.bind())
  })


}

function openClassRoom(e){
  let classID = e.target.closest('.card').getAttribute('data-id')
  console.log(classID)
  window.location.href = `/student/classroom/${classID}`
}
