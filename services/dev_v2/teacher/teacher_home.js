const db = require("../../../database")
const util = require('util')

const query = util.promisify(db.query).bind(db);

async function getTeacherHome(request,response){
  let teacher_id = request.body.client.id
  let result= {};
  let sql1 = `
    select fname, lname, email,teacher_id, department.dept_name, teacher.dept_id
    from teacher, department
    where teacher.dept_id = department.dept_id 
    AND teacher.teacher_id = ${teacher_id};
  `
  let sql1_1 = `
    select dp_path from teacher_dp where teacher_id = ${teacher_id};
  `
  let sql2 = `
    select course.course_id, course.course_name, course_code 
    from teacher, course, dept_course
    where teacher.dept_id = dept_course.dept_id 
    AND dept_course.course_id = course.course_id
    AND teacher.teacher_id = ${teacher_id};
  
  `
  let sql3 = `
    select course.course_id, course.course_name,course.course_code
    from teacher_course, course 
    where teacher_course.course_id = course.course_id 
    AND teacher_id = ${teacher_id};
  `

  let sql4 = `
    SELECT class_room.class_room_id, course.course_id, course.course_code,course.course_code,
    class_room.class_name, teacher.fname, teacher.lname
    FROM teacher, course, class_room
    WHERE teacher.teacher_id = class_room.teacher_id 
    AND class_room.course_id = course.course_id
    AND teacher.teacher_id = ${teacher_id};
  `


  let rows;
  try {
    rows = await query(sql1)
    console.log(rows)
    result["teacher_info"] = JSON.parse(JSON.stringify(rows))
    let dp = await query(sql1_1)
    console.log(JSON.parse(JSON.stringify(dp)))
    if(dp.length === 0){
      result["teacher_info"][0]["dp_path"] = "default.png"
    }else{
      result["teacher_info"][0]["dp_path"] = JSON.parse(JSON.stringify(dp))[0]["dp_path"]
    }
  } catch (error) {
    console.log(error)
    result["teacher_info"] = []
  }

  try {
    rows = await query(sql2)
    console.log(rows)
    result["available_courses"] = JSON.parse(JSON.stringify(rows))
    //return response.json({"success": 1, "data": JSON.parse(JSON.stringify(rows))})
  } catch (error) {
    console.log(error)
    result["available_courses"] = []
  }

  try {
    rows = await query(sql3)
    console.log(rows)
    result["courses_teaching"] = JSON.parse(JSON.stringify(rows))
    //return response.json({"success": 1, "data": JSON.parse(JSON.stringify(rows))})
  } catch (error) {
    console.log(error)
    result["courses_teaching"] = []
  }


  try {
    rows = await query(sql4)
    console.log(rows)
    result["class_rooms_created"] = JSON.parse(JSON.stringify(rows))
    //return response.json({"success": 1, "data": JSON.parse(JSON.stringify(rows))})
  } catch (error) {
    console.log(error)
    result["class_rooms_created"] = []
  }

  return result

}



module.exports = { getTeacherHome }