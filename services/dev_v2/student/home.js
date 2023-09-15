const db = require("../../../database")
const util = require('util')

const query = util.promisify(db.query).bind(db);


async function getStudentHomeData(req, res){
  let user_id = req.body.client.id;
  let result = {};
  let rows;

  const sql0 = `
  select student.student_id, student.fname, student.lname, student.email, student.dept_id, dept_name, student.term_id, term_name
  from student, department, term
  where student.dept_id = department.dept_id
  AND student.term_id = term.term_id
  AND student.student_id = ${user_id};
  `

  const sql0_1 = `
    select dp_path from student_dp where student_id = ${user_id};
  `

  const sql1 = `
    select course.course_id ,course.course_code, course.course_name   
    from student, term_course, course 
    where student.dept_id = term_course.dept_id 
    AND student.term_id = term_course.term_id 
    AND term_course.course_id = course.course_id 
    AND student.student_id = ${user_id};
  `
  const sql2 = `
    select course.course_id, course.course_name, course.course_code
    from student_course, course 
    where student_course.course_id = course.course_id 
    AND student_id = ${user_id};
  `
  let sql3 = `
    select class_room.class_room_id, class_room.teacher_id,teacher.fname, teacher.lname, class_room.course_code, course.course_id, course.course_name,
    class_room.class_name
    from student_course, class_room, course, teacher
    where student_course.course_id = class_room.course_id 
    AND class_room.course_id = course.course_id
    AND class_room.teacher_id = teacher.teacher_id
    AND student_course.student_id = ${user_id};
  `
  let sql4 = `

    SELECT class_room.class_room_id, course.course_code,course.course_name, class_room.class_name, teacher.fname, teacher.lname
    FROM student_class, class_room, course, teacher  
    WHERE student_class.class_room_id = class_room.class_room_id
    AND class_room.course_id = course.course_id 
    AND class_room.teacher_id = teacher.teacher_id
    AND student_class.student_id = ${user_id};
  
  `


  try {
    rows = await query(sql0)
    console.log(rows)
    result["student_info"] = JSON.parse(JSON.stringify(rows))
    let dp = await query(sql0_1)
    console.log(JSON.parse(JSON.stringify(dp)))
    if(dp.length === 0){
      result["student_info"][0]["dp_path"] = "default.png"
    }else{
      result["student_info"][0]["dp_path"] = JSON.parse(JSON.stringify(dp))[0]["dp_path"]
    }
    
  } catch (error) {
    console.log(error)
    result["student_info"] = []
  }

  try {
    rows = await query(sql1)
    console.log(rows)
    result["available_courses"] = JSON.parse(JSON.stringify(rows))
  } catch (error) {
    console.log(error)
    result["available_courses"] = []
  }

  try {
    rows = await query(sql2)
    result["courses_enrolled"] = JSON.parse(JSON.stringify(rows))
  } catch (error) {
    console.log(error)
    result["courses_enrolled"] = []
  }

  try {
    rows = await query(sql3)
    result["classrooms_for_courses"] = JSON.parse(JSON.stringify(rows))
  } catch (error) {
    console.log(error)
    result["classrooms_for_courses"] = []
  }

  try {
    rows = await query(sql4)
    result["class_rooms_joined"] = JSON.parse(JSON.stringify(rows))
  } catch (error) {
    console.log(error)
    result["class_rooms_joined"] = []
  }

  //notifications 
  let n_res;
  let sql6 = `
    select class_room_id from student_class where student_id = ${user_id};
  `
  try {
    n_res = await query(sql6);
  } catch (error) {
    console.log("something went wrong 1")
  }
  let student_classes = n_res.map(item => item.class_room_id)

  console.log("test_debug", student_classes)

  let sql7 = `
    select * from notifications where class_room_id IN (
  `
  student_classes.forEach((item, index) => {
      sql7 += `${item}`
      if(index < student_classes.length - 1){
          sql7 += `,`
      }
  })

  sql7 += `) LIMIT 25;`

  // console.log("sql7", sql7)

  try {
    n_res = await query(sql7)
  } catch (error) {
    result["notifications"] = []
  }

  sql8 = `
    select dp_path from teacher_dp where teacher_id = ?;
  `
  sql9 = `
    select fname, lname from teacher where teacher_id = ?;
  `
  let sql10 = `
    select content from class_post where class_post_id = ? and teacher_id = ?;
  `
  let n_data = JSON.parse(JSON.stringify(n_res))

  for(let i = 0; i < n_data.length; i++){

    let dp = await query(sql8, [n_data[i].teacher_id])
    let teacher_name = await query(sql9, [n_data[i].teacher_id])
    let post_content = await query(sql10, [n_data[i].class_post_id, n_data[i].teacher_id])
    console.log(JSON.parse(JSON.stringify(dp)))
    n_data[i]["fname"] = teacher_name[0].fname
    n_data[i]["lname"] = teacher_name[0].lname
    n_data[i]["post_content"] = post_content[0].content
    if (dp.length === 0) {
      n_data[i]["dp_path"] = "default.png"
      
    } else {
      n_data[i]["dp_path"] = dp[0].dp_path
    }

  }

  console.log(n_data)
  
  result["notifications"] = n_data

  


  return result
 

}



module.exports = {getStudentHomeData}