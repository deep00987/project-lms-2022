


const teacher_name = document.querySelector('.teacher__data')
const teacher_course = document.querySelector('.nav__courses')
const dash_c2 = document.querySelector('.dash__c2')
const nav__dashboard = document.querySelector('.nav__dashboard')
const nav__classes = document.querySelector('.nav__classes')

const logout_btn = document.querySelector(".logout__link")



//event listeners
logout_btn.addEventListener('click', logoutUser.bind())
teacher_course.addEventListener('click', getTeacherCoursesData.bind())
nav__dashboard.addEventListener('click', ShowTeacherInfo.bind())
nav__classes.addEventListener('click', goToClasses.bind())

ShowTeacherInfo()

function logoutUser(e){
  console.log(e)
  //e.preventDefalut()
  fetch("http://localhost:5500/api/auth/staff/logout")
  .then(response=>response.json())
  .then(data=>{
    console.log(data)
    window.location.href = "/staff/login"
  })

}


function ShowTeacherInfo(){

  fetch("http://localhost:5500/api/staff/home", {
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
      teacher_name.innerHTML = `<p>${data.teacher_info[0].fname} ${data.teacher_info[0].lname}</p>`
      getDashBoard(data)
      // console.log(data.data[0])
      
    })
    
}

function getDashBoard(data){
  const html1 = `
    <div class = "data_row_1">
      <div class = "data_1_item data_1_1">
        <h3>Teacher Info</h3>
        <hr>
        <p>Name: ${data.teacher_info[0]?.fname} ${data.teacher_info[0]?.lname}</p>
        <p>Email: ${data.teacher_info[0]?.email}</p>
        <p>Teacher ID: ${data.teacher_info[0]?.teacher_id}</p>
      </div>
      <div class = "data_1_item data_1_2">
        <h3>Department</h3>
        <hr>
        <p>Departmnet ID: ${data.teacher_info[0]?.dept_id} </p>
        <p>Assigned Departmnet: ${data.teacher_info[0]?.dept_name} </p>
      </div>
  `
  let html2 = `
    <div class = "data_1_item data_1_3">
      <h3>Available courses to teach</h3>
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
    <div class = "data_row_2" >
      <div class = "data_2_item">
        <h3>Courses You are currently teaching</h3>
        <hr>
  `
  console.log(data.courses_teaching.length)
  if(data.courses_teaching.length === 0){
    newHtml += `<p>No courses</p>`
  }else{
    data.courses_teaching.forEach(item =>{
      newHtml += `<p>${item.course_name}</p>`
    })
  }
  newHtml += `
      </div>
    </div>
  `

  document.querySelector('.dash__c2').insertAdjacentHTML('beforeend', newHtml)
}

function getTeacherCoursesData(){
  let html = `
    <div class = "course_data_wrapper">
      <div class = "data_row_x">
        <div>Available courses to teach</Sdiv>
        <table class = "course__data ">
          <tr>
            <th>Course ID</th>
            <th>Course Code</th>
            <th>Course Name</th>
            <th>Start Teaching</th>
            <th>Opt out</th>
          </tr>
          
          
       
  `
  
  fetch("http://localhost:5500/api/staff/home", {
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
          <td><button class = "enroll-btn">Teach</button></td>
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
      document.querySelector(".course__data").addEventListener("click", processTeacherCourseData.bind())
    })
  
}


function processTeacherCourseData(e){
  const course_id = +e.target.closest(".data__row").getAttribute("data-id")
  const data = {course_id : course_id}
  if(e.target.classList.contains('enroll-btn')){
    fetch("http://localhost:5500/api/staff/courses/start_teaching",{
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
    fetch("http://localhost:5500/api/staff/courses/opt_out",{
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

function goToClasses(e){
  console.log(e)

  let html = `
    
    <div class = "course_data_btn">
      <button class = "create_class_btn">Create classes</button>
      <button class = "show_class_btn">Show classes</button>
    </div>

    <div class = "create_class">
      <h3>Create a new Classroom</h3>
    
      <div class="class_form_container">
        <form class = "class_form">
          <label for="classname">Class Name</label>
          <input type="text" id="form_class_name" name="classname" placeholder="Class name.." required>
          <label for="country">Course code</label>
          <select class="course_code_select" name="course_code">
  `      
  fetch('http://localhost:5500/api/staff/home/',{
    method:"GET",
    headers:{'content-type':'application/json'},
  }).then(response=>response.json())
  .then(data=>{
    data.courses_teaching.forEach(course=>{
      html+= `
        <option value="${course.course_id}">${course.course_code}</option>
      `
    })

    html += `
          </select>
          <input type="submit" class = "create_new_class" value="Submit">
        </form>
      </div>
    
    </div>

    <div class = "display_class hidden" >
      
    </div>
  `
    dash_c2.innerHTML = ``
    dash_c2.innerHTML = html

    dash_c2.addEventListener('click', function(e){
      if(e.target.classList.contains('create_class_btn')){
        console.log(e.target)
        document.querySelector('.display_class').classList.add('hidden')
        document.querySelector('.create_class').classList.remove('hidden')
      }
      if(e.target.classList.contains('show_class_btn')){
        console.log(e.target)
        document.querySelector('.create_class').classList.add('hidden')
        document.querySelector('.display_class').classList.remove('hidden')
        showClasses.call(e.target);
      }
    })
    document.querySelector('.create_new_class').addEventListener('click', createNewClassroom.bind())

  })
      

}

function createNewClassroom(e){
  e.preventDefault()
  const class_name = document.getElementById('form_class_name').value;
  const course_id = document.querySelector('.course_code_select').value;
  console.log(class_name, course_id)

  const data = {class_name,course_id}

  if(!class_name){
    alert("fill out all the form")
    return
  }

  fetch('http://localhost:5500/api/staff/class/create', {
    method:"POST", 
    headers: {
      'content-type' : 'application/json',
    },
    body: JSON.stringify(data)
  }).then(response=>response.json())
  .then(data =>{
    console.log(data)
    alert(data.msg)
  })
}

function showClasses(){
  console.log("wop")
  console.log(this)

  let html = `
    <div class="card-main-container">
    <hr>
    
    <div class="cards"> 
  `
  let dyna = `
      <div class="card card-3">
        <h2 class="card__title">Ut enim ad minim veniam.</h2>
        <p class="card__apply">
          <a class="card__link" href="#">Apply Now <i class="fas fa-arrow-right"></i></a>
        </p>
      </div>
  `

  let html2 = `
        </div>
      </div>
    `

  fetch('http://localhost:5500/api/staff/home/',{
    method:"GET",
    headers: {
      'content-type' : 'application/json'
    },
  }).then(response=>response.json())
  .then(data=>{
    console.log(data)
    
    if(data?.class_rooms_created.length === 0){
      html += `
        <div class = "classroom_place_holder">
          <p>No classrooms to show</p>
        </div> 
      `
    }else{
      
      data?.class_rooms_created.forEach(item => {
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
    document.querySelector('.display_class').innerHTML = html
    document.querySelector('.cards').addEventListener('click', openClassRoom.bind())
  })


  
}

function openClassRoom(e){
  let classID = e.target.closest('.card').getAttribute('data-id')
  console.log(classID)
  window.location.href = `/staff/classroom/${classID}`
}
