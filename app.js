const db = require('./database')
const path = require("path")
const cookieParser = require('cookie-parser')
const ejs = require('ejs')
const multer = require('multer')
const cors = require('cors')
const bodyParser = require('body-parser')
const busboy = require('busboy');
const bb = require('express-busboy')
require('dotenv').config()
const fileUpload = require('express-fileupload');
const session = require('express-session')
const fs = require('fs')

//define routers
const studentRouter = require('./api/routes/students')
const authRouter = require('./api/routes/auth')
const homeRouter = require('./api/routes/dash_board')
const courseRouter = require('./api/routes/courses')
const addmissionRouter = require('./api/routes/addmission')
const teacherAuthRouter = require('./api/teacher/routes/auth')
const teacherCourseRouter = require('./api/teacher/routes/courses')
const teacherHomeRouter = require('./api/teacher/routes/home')
const classRouter = require('./api/teacher/routes/class')
const studentClassRouter = require('./api/routes/class')
const studentUtilRouter = require("./api/routes/util")
const teacherUtilRouter = require("./api/teacher/routes/util")

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, '_static_/');
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

const storage2 = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/class_room/');
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const express = require('express');

const upload = multer({
  storage: storage,
  // fileFilter: fileFilter
});

const upload_sec = multer({
  storage: storage2,
  // fileFilter: fileFilter
});



//middlewares

const verifyCookie = require('./middleware/verifyCookie')
const verifyTeacherCookie = require('./middleware/verifyTeacherCookie')
const verifyCookieForApi = require('./middleware/verifyCookieForApi')
const verifyTeacherCookieUpload = require("./middleware/verifyTeacherCookieUpload")
const verifyCookieUpload = require("./middleware/verifyCookieUpload")
const {csrfProtection, csrfErrorHandlerForm} = require("./middleware/csrfProtection")
const parseForm = bodyParser.urlencoded({ extended: false })
const {saveFileBuffer, saveFileBufferClassroom} = require("./middleware/saveFileBuffer")
const res = require('express/lib/response')

//connect to database
db.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

const static_path = path.join(__dirname, "non_template_views/public" )

const uploads = path.join(__dirname, "uploads" )
console.log(uploads)

const app = express()
app.use(cookieParser())
// app.use(cors({
//   origin : "http://localhost:5500",
//   credentials: true, // <= Accept credentials (cookies) sent by the client
// }))
app.use(bodyParser.json())
//bb.extend(app)
// app.use(fileUpload())


app.use(session({
  secret: process.env.SESSION_SECRET,
  saveUninitialized:false,
  cookie: { maxAge: 1000 * 60 * 60 },
  resave: false
}));


app.set('view engine', 'ejs')
app.set('views', './template_views')

//set up static files path
app.use(express.static(static_path))
app.use(express.static(uploads))
app.use("/_static_",express.static("_static_"))



//setup api endpoints
app.use('/api/students', studentRouter)
app.use('/api/students/update', studentUtilRouter)
app.use('/api/staff/update', teacherUtilRouter)
app.use('/api/auth', authRouter)
app.use('/api/auth/staff', teacherAuthRouter)
app.use('/api/home', homeRouter)
app.use('/api/courses', courseRouter)
app.use('/api/addmission', addmissionRouter)
app.use('/api/classroom', studentClassRouter)
app.use('/api/staff/courses', teacherCourseRouter)
app.use('/api/staff/home', teacherHomeRouter)
app.use('/api/staff/class', classRouter)


//set up views
app.get('/', function(req, res){
  res.sendFile(static_path + "/landing_page/index.html")
});
app.use('/login', (req,res)=>{
  //res.sendFile(static_path + "/login.html")
  res.redirect('/v2/login')
})

app.use('/v2/login', csrfProtection, csrfErrorHandlerForm, async (req , res)=>{
  const result = {CSRF_TOKEN: req.csrfToken()}
  res.render('dev_v2/frontend_student/Login_student/login_student.ejs', {data: result})
})

app.post('/process_v2_login',bodyParser.urlencoded({ extended: false }), csrfProtection, csrfErrorHandlerForm, async (req, res)=>{
  const {login_user_2fa} = require("./api/controllers/2fa_auth")
  const result = await login_user_2fa(req, res)

  if(!result.success){
    let data = {msg:`Invalid user credential`, client_type: "student"}
    //res.send(data)
    res.render(`dev_v2/page_401.ejs`, {data: data})
    //console.log(req.session)
    return
  }
  console.log(req.session)
  result["CSRF_TOKEN"] = req.csrfToken()
  //res.json(result)
  console.log(result)
  res.render('dev_v2/frontend_student/Login_student/verify_login_student.ejs',{data: result})
})

app.post('/verify_student_login',bodyParser.urlencoded({ extended: false }), csrfProtection, csrfErrorHandlerForm, async (req, res)=>{
  const {verify_2fa_login} = require("./api/controllers/2fa_auth")
  const result = await verify_2fa_login(req, res)

  if(!result?.success){
    let data = {msg:`Login verification failed -- ${result.msg}`, client_type: "student"}
    //res.send(data)
    res.render(`dev_v2/page_401.ejs`, {data: data})
    //console.log(req.session)
    return
  }
  req.session.destroy()
  console.log(req.session)

  const token = result?.data
  res.cookie("JWT_COOKIE",token,{
    httpOnly: true,

  })
  // console.log(req.session)
  // result["CSRF_TOKEN"] = req.csrfToken()
  res.redirect('/development/student/home')
  // console.log(result)
  // res.render('dev_v2/frontend_student/Login_student/verify_login_student.ejs',{data: result})
})



app.use('/register', (req,res)=>{
  res.sendFile(static_path + "/register.html")
})

app.use('/staff/register', (req,res)=>{
  res.sendFile(static_path + "/staff/teacher_register.html")
})

app.use('/staff/login', (req,res)=>{
  //res.sendFile(static_path + "/staff/teacher_login.html")
  res.redirect('/staff/v2/login')
})

// app.use('/test', async (req, res) =>{
//   //res.render('dev_v2/send_mail_template.ejs')
//   const data = await ejs.renderFile(__dirname + "/template_views/dev_v2/send_mail_template.ejs");
//   res.send(data)
// })

app.use('/staff/v2/login',csrfProtection, csrfErrorHandlerForm, async (req, res) => {
  const result = {CSRF_TOKEN: req.csrfToken()}
  res.render('dev_v2/frontend_teacher/Login_teacher/login_teacher.ejs', {data: result})
})


app.post('/process_v2_login_teacher', bodyParser.urlencoded({ extended: false }), csrfProtection, csrfErrorHandlerForm, async (req, res)=>{
  const {login_user_2fa_teacher} = require("./api/teacher/controllers/2fs_auth_teacher")
  const result = await login_user_2fa_teacher(req, res)

  if(!result.success){
    let data = {msg:`Invalid user credential`, client_type: "staff"}
    //res.send(data)
    res.render(`dev_v2/page_401.ejs`, {data: data})
    //console.log(req.session)
    return
  }
  console.log(req.session)
  result["CSRF_TOKEN"] = req.csrfToken()
  //res.json(result)
  console.log(result)
  res.render('dev_v2/frontend_teacher/Login_teacher/login_verify_teacher.ejs',{data: result})

})

app.post('/verify_teacher_login',bodyParser.urlencoded({ extended: false }), csrfProtection, csrfErrorHandlerForm, async (req, res)=>{
  const {verify_2fa_login_teacher} = require("./api/teacher/controllers/2fs_auth_teacher")
  const result = await verify_2fa_login_teacher(req, res)

  if(!result?.success){
    let data = {msg:`Login verification failed -- ${result.msg}`, client_type: "staff"}
    
    //res.send(data)
    res.render(`dev_v2/page_401.ejs`, {data: data})
    //console.log(req.session)
    return
  }
  req.session.destroy()
  console.log(req.session)

  const token = result?.data
  res.cookie("JWT_COOKIE",token,{
    httpOnly: true
  })
  // console.log(req.session)
  // result["CSRF_TOKEN"] = req.csrfToken()
  res.redirect('/development/teacher/home')
  // console.log(result)
  // res.render('dev_v2/frontend_student/Login_student/verify_login_student.ejs',{data: result})
})




//private views non-template
app.use('/home', express.static(path.join(__dirname, 'non_template_views/private/views/home')));

app.use('/staff/home', express.static(path.join(__dirname, 'non_template_views/private/views/staff/home')));

app.use('/home',verifyCookie, (req,res)=>{
  //res.sendFile(path.join(__dirname + '/non_template_views/private/views/home' + '/homepage.html'))
  res.redirect('/development/student/home')
})

app.use('/staff/home',verifyTeacherCookie, (req,res)=>{
  //res.sendFile(path.join(__dirname + '/non_template_views/private/views/staff/home' + '/staff_homepage.html'))
  //res.render('staff_home/home.ejs')
  res.redirect('/development/teacher/home')
})


app.use('/staff/classroom/:id',verifyTeacherCookie, async (req,res)=>{
  const {testInfo} = require('./services/classroom')
  let result = await testInfo(req)
  console.log(result)
  //app.send("working")
  //res.sendFile(path.join(__dirname + '/non_template_views/private/views/staff/home' + '/staff_homepage.html'))
  res.render('staff_home/classroom.ejs',{data : result})
  //return res.json(result)
})


app.use('/student/classroom/:id',verifyCookie, async (req,res)=>{
  const {getClassInfo} = require('./services/student_classroom')
  result = await getClassInfo(req)
  // console.log(result)
  //app.send("working")
  //res.sendFile(path.join(__dirname + '/non_template_views/private/views/staff/home' + '/staff_homepage.html'))
  //console.log(getClassInfo(req))
  res.render('student_classroom/homepage.ejs',{data : result})
  //return res.json(result)
})


app.post('/upload_content',verifyTeacherCookieUpload, multer().any(), csrfProtection, csrfErrorHandlerForm, saveFileBufferClassroom, async(req, res)=>{

  const {uploadClassContents} = require('./services/classroom')
  console.log(req)
  // if(req.files){
  //   let file1 = req.files.attachment
  //   let uploadFilePath = path.join(__dirname, '/uploads/class_room', file1.name)
  //   console.log(file1,uploadFilePath)

  //   file1.mv(uploadFilePath, function(err){
  //     console.log(err)

  //   })
  // }

  let result = await uploadClassContents(req)
  console.log(result)

  res.redirect(`/development/teacher/classroom/${req.body?.classroom_id}`)

})

app.post("/upload_student_profile_img",verifyCookieUpload, multer().any(), csrfProtection, csrfErrorHandlerForm, saveFileBuffer, async(req, res)=>{
  console.log("body:",req.body)
  console.log("body:",req._current_client)
  console.log("file:", req.file)

  const {uploadDpStudent} = require("./services/dev_v2/student/dp_upload_student")

  const res1 = await uploadDpStudent(req)
  backURL=req.header('Referer') || '/';

  //res.json(res1)
  res.redirect(backURL);

})
// upload.single("uploaded_image")
app.post("/upload_teacher_profile_img",verifyTeacherCookieUpload, multer().any(), csrfProtection, csrfErrorHandlerForm, saveFileBuffer, async(req, res)=>{
  console.log("body:",req.body)
  console.log("body:",req._current_client)
  console.log("file:", req.file)

  const {uploadDpTeacher} = require("./services/dev_v2/teacher/dp_upload_teacher")
  //res.send("ok")

  const res1 = await uploadDpTeacher(req)
  backURL=req.header('Referer') || '/';

  res.redirect(backURL);

})


app.get('/download_content/:name', async(req, res) =>{
  let filename = req.params.name;
  //let abs_path = path.join(__dirname,'uploads','class_room', filename)

  const dir = path.join(__dirname,'uploads','class_room')
  const files = fs.readdirSync(dir)

  for (const file of files) {
    console.log(file)
    if(file === filename){
      return res.sendFile(path.join(__dirname,'uploads','class_room', filename))
    }
  }

  res.status(404).send("File not found")


})


// development frontend views start here

app.use('/development/student/home', verifyCookie, csrfProtection, async(req, res)=>{
  const {getStudentHomeData} = require('./services/dev_v2/student/home')
  const data_routine_odd = require("./local_routine/routine_odd")
  const data_routine_even = require("./local_routine/routine_even")

  const result = await getStudentHomeData(req)
  result["CSRF_TOKEN"] = req.csrfToken()

  let actual_result = []
  let allowed_courses =  result?.courses_enrolled?.map(item => item.course_code)

  const find_all_classes_by_day = require("./local_routine/routine_services/find_class_service")


  //res.json(result)
  console.log(result)
  if(result?.student_info[0]?.term_id % 2 === 0){

    actual_result = find_all_classes_by_day(data_routine_even, allowed_courses)
    result["routine"] = JSON.parse(JSON.stringify(actual_result))
    res.render('dev_v2/frontend_student/Dashboard_student/home_student.ejs', {data: result})
    console.log({data: result})
    //res.json({data: result, routine: actual_result})
  }else{
    actual_result = find_all_classes_by_day(data_routine_odd, allowed_courses)
    result["routine"] = JSON.parse(JSON.stringify(actual_result))
    res.render('dev_v2/frontend_student/Dashboard_student/home_student.ejs', {data: result})
    console.log({data: result})
    //res.json({data: result, routine: actual_result})
  }

  //res.render('dev_v2/frontend_student/Dashboard_student/home_student.ejs', {data: result})

})

app.use('/development/student/courses', verifyCookie, csrfProtection, async(req, res)=>{

  const {getStudentHomeData} = require('./services/dev_v2/student/home')
  const result = await getStudentHomeData(req)
  result["CSRF_TOKEN"] = req.csrfToken()
  console.log(result)
  //res.json(result)
  res.render('dev_v2/frontend_student/Courses_student/courses_student.ejs', {data: result})

})

app.use('/development/student/classes', verifyCookie, csrfProtection, async(req, res)=>{
  const {getStudentHomeData} = require('./services/dev_v2/student/home')

  const result = await getStudentHomeData(req)
  result["CSRF_TOKEN"] = req.csrfToken()
  console.log(result)


  res.render('dev_v2/frontend_student/Classes_student/classes_student.ejs', {data: result})
})

app.use('/development/student/addmission', verifyCookie, csrfProtection, async(req, res)=>{
  const {getStudentHomeData} = require('./services/dev_v2/student/home')
  const result = await getStudentHomeData(req)
  result["CSRF_TOKEN"] = req.csrfToken()
  console.log(result)
  res.render('dev_v2/frontend_student/Addmission_student/addmission_student.ejs', {data: result})
})

app.use('/development/student/profile', verifyCookie, csrfProtection, async(req, res)=>{
  const {getStudentHomeData} = require('./services/dev_v2/student/home')
  const result = await getStudentHomeData(req)
  result["CSRF_TOKEN"] = req.csrfToken()
  console.log(result)
  res.render('dev_v2/frontend_student/Profile_student/profile_student.ejs', {data: result})
})

//development teacher views

app.use('/development/teacher/classes', verifyTeacherCookie, csrfProtection, async(req, res)=>{
  const {getTeacherHome} = require('./services/dev_v2/teacher/teacher_home')
  const result = await getTeacherHome(req)
  result["CSRF_TOKEN"] = req.csrfToken()
  console.log(result)
  res.render('dev_v2/frontend_teacher/Classes_teacher/classes_teacher.ejs', {data: result})
})

app.use('/development/teacher/courses', verifyTeacherCookie, csrfProtection, async(req, res)=>{
  const {getTeacherHome} = require('./services/dev_v2/teacher/teacher_home')
  const result = await getTeacherHome(req)
  result["CSRF_TOKEN"] = req.csrfToken()
  console.log(result)
  res.render('dev_v2/frontend_teacher/courses_teacher/courses_teacher.ejs', {data: result})
})







app.use('/development/teacher/home', verifyTeacherCookie, csrfProtection, async(req, res)=>{
  const {getTeacherHome} = require('./services/dev_v2/teacher/teacher_home')
  const data_routine_odd = require("./local_routine/routine_odd")
  const data_routine_even = require("./local_routine/routine_even")

  let actual_result = []

  const result = await getTeacherHome(req)
  const allowed_courses = result?.courses_teaching.map(item => item.course_code)

  const find_all_classes_by_day = require("./local_routine/routine_services/find_class_service")
  actual_result = find_all_classes_by_day(data_routine_odd, allowed_courses)

  console.log(allowed_courses)
  result["routine"] = JSON.parse(JSON.stringify(actual_result))
  result["CSRF_TOKEN"] = req.csrfToken()
  console.log(actual_result)
  console.log(result)


  res.render('dev_v2/frontend_teacher/Dashboard_teacher/home_teacher.ejs', {data: result})
})







app.use('/development/teacher/profile', verifyTeacherCookie,csrfProtection, async(req, res)=>{
  const {getTeacherHome} = require('./services/dev_v2/teacher/teacher_home')
  const result = await getTeacherHome(req)
  result["CSRF_TOKEN"] = req.csrfToken()

  console.log(result)
  res.render('dev_v2/frontend_teacher/Profile_teacher/profile_teacher.ejs', {data: result})
  //res.json(result)
})


app.use('/development/teacher/classroom/:id/people', verifyTeacherCookie, csrfProtection, async(req, res)=>{
  const {testInfo} = require('./services/classroom')
  let result = await testInfo(req)
  result["CSRF_TOKEN"] = req.csrfToken()

  console.log(result)
  res.render('dev_v2/frontend_teacher/Classroom_people_teacher/teacher_classroom_people.ejs' , {data: result})
  //res.json(result)
})

app.use('/development/teacher/classroom/:id', verifyTeacherCookie, csrfProtection, async(req, res)=>{
  const {testInfo} = require('./services/classroom')
  let result = await testInfo(req)
  result["CSRF_TOKEN"] = req.csrfToken()
  console.log(result)
  res.render('dev_v2/frontend_teacher/Classroom_teacher/teacher_classroom.ejs' , {data: result})
  //res.json(result)
})


app.use('/development/student/classroom/:id/people', verifyCookie, csrfProtection, async(req, res)=>{
  const {getClassInfo} = require('./services/student_classroom')
  let result = await getClassInfo(req)
  result["CSRF_TOKEN"] = req.csrfToken()
  console.log(result)
  res.render('dev_v2/frontend_student/Classroom_people_student/student_classroom_people.ejs' , {data: result})
  //res.json(result)
})

app.use('/development/student/classroom/:id', verifyCookie, csrfProtection, async(req, res)=>{
  const {getClassInfo} = require('./services/student_classroom')
  let result = await getClassInfo(req)
  result["CSRF_TOKEN"] = req.csrfToken()
  console.log(result)
  res.render('dev_v2/frontend_student/Classroom_student/student_classroom.ejs' , {data: result})
  //res.json(result)
})




// app.use('/development', verifyCookie, async(req, res)=>{
//   //res.status(404).send('what???');
//   let client = req.body.client.is_staff
//   let data = {msg:`Invalid user credential`, client_type: client?"staff":"student"}
//   res.render(`dev_v2/page_404.ejs`, {data: data})
//   //res.end()
// })

//set up util paths

app.get('/api/student/routine_odd', verifyCookie, async(req, res)=>{
  const data_routine_odd = require("./local_routine/routine_odd")
  res.json(data_routine_odd)
})

app.get('/api/student/routine_even', verifyCookie, async(req, res)=>{
  const data_routine_even = require("./local_routine/routine_even")
  res.json(data_routine_even)
})



app.get('*', verifyCookie, function(req, res){
  let client = req.body.client.is_staff
  let data = {msg:`Invalid user credential`, client_type: client?"staff":"student"}
  res.render(`dev_v2/page_404.ejs`, {data: data})
});


//app.use()



app.listen(5500, ()=>{
    console.log('connected at port 5500')
})