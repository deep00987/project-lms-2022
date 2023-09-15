const res = require("express/lib/response")
const db = require("../database")
const util = require('util');
const query = util.promisify(db.query).bind(db);


async function getClassInfo(request){
  let class_room_id = +request.params.id
  let student_id = request.body.client.id
  let result= {};

  //classroom teacher dept info 
  let sql1 = `
    SELECT class_room.class_room_id,class_room.class_name,teacher.teacher_id, teacher.fname, teacher.lname,teacher.email, department.dept_name, 
    course.course_name, course.course_code 
    FROM  class_room, teacher, course, department 
    WHERE class_room.teacher_id = teacher.teacher_id
    AND teacher.dept_id = department.dept_id
    AND class_room.course_id = course.course_id
    AND class_room.class_room_id = ${class_room_id};
  `
  let sql1_0 = `
    select dp_path from teacher_dp where teacher_id = ? ;
  `
  let sql1_0_1 = `
    select dp_path from student_dp where student_id = ? ;
  `

  //current student info
  let sql2 = `
    select student.student_id,student.fname, student.lname, student.email, 
    department.dept_name
    from student, department
    WHERE student.dept_id = department.dept_id
    AND student.student_id = ${student_id};
  `
  let sql3 = `
    select class_post.class_post_id, class_post.class_room_id, teacher.teacher_id, class_post.student_id, 
    teacher.fname, teacher.lname, class_post.content, class_post.attachment, 
    class_post.created_at
    from class_post, teacher 
    Where class_post.teacher_id = teacher.teacher_id 
    AND class_post.class_room_id = ${class_room_id};
  `
  let sql6 = `
    select student.fname, student.lname,student.email, student.student_id, student.dept_id, department.dept_name
    from student, student_class,department
    where student.student_id = student_class.student_id 
    AND student.dept_id = department.dept_id
    AND student_class.class_room_id = ${class_room_id};
  `

  let rows;
  try {
    rows = await query(sql1)
    console.log(rows)
    result["class_room_teacher_info"] = JSON.parse(JSON.stringify(rows))
    let class_teacher_dp = await query(sql1_0, [result["class_room_teacher_info"][0].teacher_id])
    console.log("data_test", class_teacher_dp)
    if(class_teacher_dp.length === 0){
      result["class_room_teacher_info"][0]["dp_path"] = "default.png"
    }else{
      result["class_room_teacher_info"][0]["dp_path"] = class_teacher_dp[0]?.dp_path
    }

  } catch (error) {
    console.log(error)
    return "soemthing went wrong"
  }

  try {
    rows = await query(sql2)
    console.log(rows)
    result["current_student_info"] = JSON.parse(JSON.stringify(rows))
    let student_dp = await query(sql1_0_1, [result["current_student_info"][0].student_id])
    if(student_dp.length === 0){
      result["current_student_info"][0]["dp_path"] = "default.png"
    }else{
      result["current_student_info"][0]["dp_path"] = student_dp[0]?.dp_path
    }

  } catch (error) {
    console.log(error)
    return "soemthing went wrong"
  }

  try {
    rows = await query(sql3)
    console.log(rows)
    result["class_room_posts"] = JSON.parse(JSON.stringify(rows))

    // let dp = await query(sql1_0)
    // console.log(JSON.parse(JSON.stringify(dp)))
    // if(dp.length === 0){
    //   result["class_room_posts"].forEach(post => {
    //     post["dp_path"] = "default.png"
    //   })
    // }else{
    //   result["class_room_posts"].forEach(post => {
    //     post["dp_path"] = JSON.parse(JSON.stringify(dp))[0]["dp_path"]
    //   })
    // }

    for( let i = 0; i < result?.class_room_posts.length; i++){
      let post_dp = await query(sql1_0, [result["class_room_posts"][i]?.teacher_id])
      if (post_dp.length === 0) {
        result["class_room_posts"][i]["dp_path"] = "default.png"
      } else {
        const newLocal = "dp_path";
        // result["class_room_posts"].forEach(post => {
        //   result?.class_room_posts[i].dp_path = post_dp[0]?.dp_path
        // })'
        result["class_room_posts"][i]["dp_path"] = post_dp[0]?.dp_path
      }
    }

    

    for( let i = 0; i < result?.class_room_posts.length; i++){
      
      try {
        let sql4 = `
          select class_comments.comment_id, class_comments.student_id, class_comments.teacher_id,
          class_comments.class_post_id, class_comments.class_room_id,
          class_comments.content, student.fname, student.lname, student.dept_id, class_comments.created_at
          from class_comments, student
          where class_comments.student_id = student.student_id
          AND class_comments.class_room_id = ${result?.class_room_posts[i].class_room_id}
          AND class_comments.class_post_id = ${result?.class_room_posts[i].class_post_id};
        `
        let sql_5 = `
          select class_comments.comment_id, class_comments.teacher_id,
          class_comments.class_post_id, class_comments.class_room_id,          
          class_comments.content, teacher.fname, teacher.lname, teacher.dept_id, class_comments.created_at
          from class_comments, teacher
          where class_comments.teacher_id = teacher.teacher_id
          AND class_comments.class_room_id = ${result?.class_room_posts[i].class_room_id}
          AND class_comments.class_post_id = ${result?.class_room_posts[i].class_post_id};
       ` 
       
        let result2 = await query(sql_5)
        console.log(result2)
        let result1 = await query(sql4)
       
        let jsonObj = {"post_comments": JSON.parse(JSON.stringify(result1))}

        for(let i = 0; i < jsonObj.post_comments.length; i++){
          console.log("item", jsonObj.post_comments[i].student_id)
          let student_dp = await query(sql1_0_1, [jsonObj.post_comments[i].student_id])
          if(student_dp.length > 0){
            console.log("item_dp", student_dp[0].dp_path)
            jsonObj.post_comments[i]["dp_path"] = student_dp[0].dp_path
          }else{
            console.log("item_dp", student_dp)
            jsonObj.post_comments[i]["dp_path"] = "default.png"
          }
        }

        let data2 = JSON.parse(JSON.stringify(result2))

        for(let i = 0; i < data2.length; i++){
          console.log("test222", data2[i])
          let teacher_dp = await query(`select dp_path from teacher_dp where teacher_id = ${data2[i]?.teacher_id};`)
          if(teacher_dp.length > 0){
            //console.log("item_dp", student_dp[0].dp_path)
            data2[i]["dp_path"] = teacher_dp[0].dp_path
          }else{
            //console.log("item_dp", student_dp)
            data2[i]["dp_path"] = "default.png"
          }
        }

        data2.forEach(element => {
          jsonObj["post_comments"].push(element)
        });

        Object.assign(result?.class_room_posts[i], jsonObj)
        
      } catch (error) {
        console.log(error)
        return "soemthing went wrong"
      }
    }
    //console.log(JSON.stringify(result1))

    
    
  } catch (error) {
    console.log(error)
    return "soemthing went wrong"
  }

  try {
    rows = await query(sql6)
    console.log(rows)
    result["class_room_students"] = JSON.parse(JSON.stringify(rows))

    for(let i = 0; i < result["class_room_students"].length; i++){
      let student_dp = await query(sql1_0_1, [result["class_room_students"][i].student_id])
      if(student_dp.length > 0){
        console.log("item_dp", student_dp[0].dp_path)
        result["class_room_students"][i]["dp_path"] = student_dp[0].dp_path
      }else{
        console.log("item_dp", student_dp)
        result["class_room_students"][i]["dp_path"] = "default.png"
      }
    }


  } catch (error) {
    console.log(error)
    return "soemthing went wrong"
  }

  
  //console.log(result)
  return result

}

module.exports = {getClassInfo}