const res = require("express/lib/response")
const db = require("../database")
const util = require('util');
require('dotenv').config()
const nodemailer = require('nodemailer');
const query = util.promisify(db.query).bind(db);


async function testInfo(request){
  let class_room_id = +request.params.id
  let teacher_id = request.body.client.id
  let result= {};
  let sql1 = `
    select fname, lname, email,teacher_id, department.dept_name, teacher.dept_id
    from teacher, department
    where teacher.dept_id = department.dept_id 
    AND teacher.teacher_id = ${teacher_id};
  `
  let sql1_0 = `
    select dp_path from teacher_dp where teacher_id = ${teacher_id};
  `
  let sql1_0_1 = `
    select dp_path from student_dp where student_id = ? ;
  `

  let sql2 = `
    SELECT class_room.class_room_id, class_room.class_name, course.course_name,course.course_code
    FROM class_room, course
    where class_room.course_id = course.course_id
    AND class_room.class_room_id = ${class_room_id}; 
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
    result["teacher_info"] = JSON.parse(JSON.stringify(rows))
    let dp = await query(sql1_0)
    console.log(JSON.parse(JSON.stringify(dp)))
    if(dp.length === 0){
      result["teacher_info"][0]["dp_path"] = "default.png"
    }else{
      result["teacher_info"][0]["dp_path"] = JSON.parse(JSON.stringify(dp))[0]["dp_path"]
    }
  } catch (error) {
    console.log(error)
    return "soemthing went wrong"
  }

  try {
    rows = await query(sql2)
    console.log(rows)
    result["class_room_info"] = JSON.parse(JSON.stringify(rows))
  } catch (error) {
    console.log(error)
    return "soemthing went wrong"
  }

  try {
    rows = await query(sql3)
    console.log(rows)
    result["class_room_posts"] = JSON.parse(JSON.stringify(rows))
    let dp = await query(sql1_0)
    console.log(JSON.parse(JSON.stringify(dp)))
    if(dp.length === 0){
      result["class_room_posts"].forEach(post => {
        post["dp_path"] = "default.png"
      })
    }else{
      result["class_room_posts"].forEach(post => {
        post["dp_path"] = JSON.parse(JSON.stringify(dp))[0]["dp_path"]
      })
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

        let result1 = await query(sql4)
        // let test = result1.map(item => item.student_id)
        // console.log(test)


        let result2 = await query(sql_5)
        let jsonObj = {"post_comments": JSON.parse(JSON.stringify(result1))}

        // jsonObj?.post_comments.forEach(item =>{
        //   console.log("item", item.student_id)
        //   let student_dp = await query(sql1_0_1, [item.student_id])
        //   console.log("item_dp", student_dp[0].dp_path)
        // })

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

        console.log(data2)

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

        console.log(JSON.parse(JSON.stringify(result1)))
        Object.assign(result?.class_room_posts[i], jsonObj)
        //result?.class_room_posts[i]["post_comments"] = JSON.parse(JSON.stringify(result1)) 
      } catch (error) {
        console.log(error)
        return "soemthing went wrong"
      }
    }


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

  
  console.log(result)
  return result

}


async function uploadClassContents(req){
  let title = req.body?.title.trim()
  let teacher_id = req._current_client.id
  let classroom_id = +req.body.classroom_id
  let attachment = req?.files[0]?.originalname
  


  console.log(title, teacher_id, classroom_id, attachment)
  console.log(attachment)

  let rows;
  let result = {}
  let sql1 = `
    INSERT INTO class_post (class_room_id, teacher_id, content, attachment)
    VALUES
    (?, ?, ? ,?);
  `
  //recipient list
  let sql2 = `
    select student.email, student.student_id, student.fname
    from student_class, student 
    where student_class.student_id = student.student_id
    AND student_class.class_room_id = ${classroom_id};
  `
  let sql3 = `
    select teacher.fname, teacher.lname, teacher.email, class_room.class_name, class_room.class_room_id
    from class_room, teacher
    where class_room.teacher_id = teacher.teacher_id 
    AND class_room.class_room_id = ${classroom_id}; 
  `

  const email = process.env.EMAIL
  const pass = process.env.EMAIL_PASS

  try {
    rows = await query(sql1, [classroom_id, teacher_id, title, attachment])
    console.log(rows)
    result["class_room_data"] = JSON.parse(JSON.stringify(rows))

    const email = process.env.EMAIL
    const pass = process.env.EMAIL_PASS

    console.log(email, pass)
    let res_rows = await query(sql2)
    let res_rows_2 = await query(sql3)
    let list_of_recipients = res_rows.map(item => item.email)
    console.log(list_of_recipients)

    let data_email = {
      list_of_recipients,
      sender_email: email,
      sender_pass: pass,
      payload: title,
      attachment
    }

    let email_meta = JSON.parse(JSON.stringify(res_rows_2))

    console.log("notification_test", rows.insertId)

    let notification_data = {
      teacher_id,
      classroom_id,
      class_post_id: rows.insertId,
    }

    send_mail_to_students(data_email, email_meta)

    insertIntoNotifications(notification_data)
   

    

  } catch (error) {
    console.log(error)
    return "soemthing went wrong"
  }

  

  return result

}

async function insertIntoNotifications(data){
  let sql1 = `
    Select fname, lname from teacher where teacher_id = ${data?.teacher_id};
  `
  let sql2 = `
    Select class_name from class_room where class_room_id = ${data?.classroom_id} AND teacher_id = ${data?.teacher_id};
  `
  let sql3 = `
    INSERT INTO notifications (class_room_id, class_post_id, teacher_id, content)
    Values (?, ?, ?, ?);
  `

  let rows;
  try {
    rows = await query(sql1)
  } catch (error) {
    return "soemthing went wrong"
  }

  let t_fname = rows[0].fname;
  let t_lname = rows[0].lname;
  

  try {
    rows = await query(sql2)
  } catch (error) {
    return "something went wrong"
  }

  let class_name = rows[0].class_name

  console.log("test100001", t_fname, t_lname, class_name)

  let content = `${t_fname} ${t_lname} posted on classroom ${class_name}`;

  try {
    rows = await query(sql3, [data?.classroom_id, data?.class_post_id, data?.teacher_id, content])
  } catch (error) {
    return "something went wrong"
  }

}





async function send_mail_to_students(data , sender_data){
  console.log("TEST345", data, sender_data)

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: data.sender_email,
        pass: data.sender_pass,
    }
  });
  console.log(data)
  let mailOptions = {
    from: data.email, // sender address
    subject: `${sender_data[0].fname} ${sender_data[0].lname} posted new content on classroom: ${sender_data[0].class_name}`, // Subject line
    text: `${data.payload}`, // plaintext body
    to: data.list_of_recipients,
    html: `
    <!DOCTYPE html>
    <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
    
    <head>
      <title></title>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
      <!--[if !mso]><!-->
      <link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet" type="text/css">
      <link href="https://fonts.googleapis.com/css?family=Abril+Fatface" rel="stylesheet" type="text/css">
      <link href="https://fonts.googleapis.com/css?family=Merriweather" rel="stylesheet" type="text/css">
      <link href="https://fonts.googleapis.com/css?family=Montserrat" rel="stylesheet" type="text/css">
      <link href="https://fonts.googleapis.com/css?family=Nunito" rel="stylesheet" type="text/css">
      <link href="https://fonts.googleapis.com/css?family=Bitter" rel="stylesheet" type="text/css">
      <link href="https://fonts.googleapis.com/css?family=Permanent+Marker" rel="stylesheet" type="text/css">
      <link href="https://fonts.googleapis.com/css?family=Roboto+Slab" rel="stylesheet" type="text/css">
      <link href="https://fonts.googleapis.com/css?family=Cabin" rel="stylesheet" type="text/css">
      <link href="https://fonts.googleapis.com/css?family=Oxygen" rel="stylesheet" type="text/css">
      <link href="https://fonts.googleapis.com/css?family=Oswald" rel="stylesheet" type="text/css">
      <link href="https://fonts.googleapis.com/css?family=Lato" rel="stylesheet" type="text/css">
      <link href="https://fonts.googleapis.com/css?family=Ubuntu" rel="stylesheet" type="text/css">
      <link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet" type="text/css">
      <link href="https://fonts.googleapis.com/css?family=Droid+Serif" rel="stylesheet" type="text/css">
      <link href="https://fonts.googleapis.com/css?family=Playfair+Display" rel="stylesheet" type="text/css">
      <link href="https://fonts.googleapis.com/css?family=Poppins" rel="stylesheet" type="text/css">
      <!--<![endif]-->
      <style>
        * {
          box-sizing: border-box;
        }
    
        body {
          margin: 0;
          padding: 0;
        }
    
        a[x-apple-data-detectors] {
          color: inherit !important;
          text-decoration: inherit !important;
        }
    
        #MessageViewBody a {
          color: inherit;
          text-decoration: none;
        }
    
        p {
          line-height: inherit
        }
    
        @media (max-width:700px) {
          .row-content {
            width: 100% !important;
          }
    
          .column .border,
          .mobile_hide {
            display: none;
          }
    
          table {
            table-layout: fixed !important;
          }
    
          .stack .column {
            width: 100%;
            display: block;
          }
    
          .mobile_hide {
            min-height: 0;
            max-height: 0;
            max-width: 0;
            overflow: hidden;
            font-size: 0px;
          }
        }
      </style>
    </head>
    
    <body style="margin: 0; background-color: #ffffff; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
      <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff; background-image: none; background-position: top left; background-size: auto; background-repeat: no-repeat;">
        <tbody>
          <tr>
            <td>
              <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                <tbody>
                  <tr>
                    <td>
                      <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff; color: #000000; width: 680px;" width="680">
                        <tbody>
                          <tr>
                            <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; background-color: #edeff4; padding-left: 25px; padding-right: 25px; padding-top: 20px; padding-bottom: 20px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                              <table class="heading_block" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                <tr>
                                  <td>
                                    <h1 style="margin: 0; color: #393d47; direction: ltr; font-family: Open Sans, Helvetica Neue, Helvetica, Arial, sans-serif; font-size: 23px; font-weight: 700; letter-spacing: normal; line-height: 120%; text-align: left; margin-top: 0; margin-bottom: 0;"><span class="tinyMce-placeholder">LMS <span style="color: #694eef;">Application</span></span></h1>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
              <table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                <tbody>
                  <tr>
                    <td>
                      <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f6f7fb; color: #000000; width: 680px;" width="680">
                        <tbody>
                          <tr>
                            <td class="column column-1" width="16.666666666666668%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                              <div class="spacer_block" style="height:5px;line-height:5px;font-size:1px;">&#8202;</div>
                              <table class="image_block mobile_hide" width="100%" border="0" cellpadding="5" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                <tr>
                                  <td>
                                    <div align="center" style="line-height:10px"><img src="https://d15k2d11r6t6rl.cloudfront.net/public/users/Integrators/BeeProAgency/786833_770592/post-5-256.png" style="display: block; height: auto; border: 0; width: 34px; max-width: 100%;" width="34" alt="I'm an image" title="I'm an image"></div>
                                  </td>
                                </tr>
                              </table>
                              <div class="spacer_block" style="height:5px;line-height:5px;font-size:1px;">&#8202;</div>
                            </td>
                            <td class="column column-2" width="83.33333333333333%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                              <table class="text_block" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                <tr>
                                  <td style="padding-bottom:10px;padding-left:5px;padding-right:5px;padding-top:15px;">
                                    <div style="font-family: sans-serif">
                                      <div class="txtTinyMce-wrapper" style="font-size: 12px; mso-line-height-alt: 24px; color: #555555; line-height: 2; font-family: Open Sans, Helvetica Neue, Helvetica, Arial, sans-serif;">
                                        <p style="margin: 0; font-size: 12px; text-align: center; mso-line-height-alt: 34px; letter-spacing: 1px;"><span style="font-size:17px;"><strong>New content uploaded by ${sender_data[0].fname} ${sender_data[0].lname} on classroom ${sender_data[0].class_name}&nbsp;</strong></span></p>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
              <table class="row row-3" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                <tbody>
                  <tr>
                    <td>
                      <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f6f7fb; color: #000000; width: 680px;" width="680">
                        <tbody>
                          <tr>
                            <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                              <table class="heading_block" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                <tr>
                                  <td style="padding-bottom:15px;padding-left:60px;padding-right:15px;padding-top:15px;text-align:center;width:100%;">
                                    <h3 style="margin: 0; color: #393d47; direction: ltr; font-family: Open Sans, Helvetica Neue, Helvetica, Arial, sans-serif; font-size: 15px; font-weight: 700; letter-spacing: normal; line-height: 120%; text-align: left; margin-top: 0; margin-bottom: 0;"><span class="tinyMce-placeholder">${data.payload}</span></h3>
                                  </td>
                                </tr>
                              </table>
                              <table class="button_block" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                <tr>
                                  <td style="padding-bottom:30px;padding-left:10px;padding-right:10px;padding-top:25px;text-align:center;">
                                    <div align="center">
                                      <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="http://localhost:5500/development/student/classroom/${sender_data[0].class_room_id}" style="height:44px;width:196px;v-text-anchor:middle;" arcsize="57%" stroke="false" fillcolor="#6732cb"><w:anchorlock/><v:textbox inset="0px,0px,0px,0px"><center style="color:#ffffff; font-family:Arial, sans-serif; font-size:15px"><![endif]--><a href="http://localhost:5500/development/student/classroom/${sender_data[0].class_room_id}" target="_blank" style="text-decoration:none;display:inline-block;color:#ffffff;background-color:#6732cb;border-radius:25px;width:auto;border-top:0px solid #FFFFFF;border-right:0px solid #FFFFFF;border-bottom:0px solid #FFFFFF;border-left:0px solid #FFFFFF;padding-top:07px;padding-bottom:7px;font-family:Open Sans, Helvetica Neue, Helvetica, Arial, sans-serif;text-align:center;mso-border-alt:none;word-break:keep-all;"><span style="padding-left:25px;padding-right:25px;font-size:15px;display:inline-block;letter-spacing:2px;"><span style="font-size: 12px; line-height: 2; word-break: break-word; mso-line-height-alt: 24px;"><span style="font-size: 15px; line-height: 30px;" data-mce-style="font-size: 15px; line-height: 30px;">Go to Classroom</span></span></span></a>
                                      <!--[if mso]></center></v:textbox></v:roundrect><![endif]-->
                                    </div>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
              <table class="row row-4" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                <tbody>
                  <tr>
                    <td>
                      <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #6732cb; color: #000000; width: 680px;" width="680">
                        <tbody>
                          <tr>
                            <td class="column column-1" width="66.66666666666667%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                              <table class="text_block" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                <tr>
                                  <td style="padding-bottom:10px;padding-left:10px;padding-right:10px;padding-top:15px;">
                                    <div style="font-family: sans-serif">
                                      <div class="txtTinyMce-wrapper" style="font-size: 12px; mso-line-height-alt: 14.399999999999999px; color: #555555; line-height: 1.2; font-family: Open Sans, Helvetica Neue, Helvetica, Arial, sans-serif;">
                                        <p style="margin: 0; font-size: 12px;"><span style="font-size:13px;" id="a1fec877-a6f0-41cd-bbd7-b6d0f14ad2e2"><span style="color:#ffffff;">Email generated at:&nbsp; ${new Date().toLocaleString("en-IN")}</span></span></p>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              </table>
                              <table class="text_block" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                <tr>
                                  <td style="padding-bottom:15px;padding-left:10px;padding-right:10px;padding-top:10px;">
                                    <div style="font-family: sans-serif">
                                      <div class="txtTinyMce-wrapper" style="font-size: 12px; mso-line-height-alt: 14.399999999999999px; color: #ffffff; line-height: 1.2; font-family: Open Sans, Helvetica Neue, Helvetica, Arial, sans-serif;">
                                        <p style="margin: 0; font-size: 12px;"><span style="font-size:13px;">You are receiving this email because you have joined this classroom where the post was made at.</span></p>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              </table>
                            </td>
                            <td class="column column-2" width="33.333333333333336%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                              <table class="text_block" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                <tr>
                                  <td style="padding-top:5px;">
                                    <div style="font-family: sans-serif">
                                      <div class="txtTinyMce-wrapper" style="font-size: 12px; mso-line-height-alt: 14.399999999999999px; color: #555555; line-height: 1.2; font-family: Open Sans, Helvetica Neue, Helvetica, Arial, sans-serif;">
                                        <p style="margin: 0; font-size: 12px; mso-line-height-alt: 14.399999999999999px;">&nbsp;</p>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              </table>
                              <table class="social_block" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                <tr>
                                  <td style="padding-bottom:15px;padding-left:10px;padding-right:10px;padding-top:10px;text-align:center;">
                                    <table class="social-table" width="108px" border="0" cellpadding="0" cellspacing="0" role="presentation" align="center" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                      <tr>
                                        <td style="padding:0 2px 0 2px;"><a href="https://www.facebook.com/" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/circle-color/facebook@2x.png" width="32" height="32" alt="Facebook" title="Facebook" style="display: block; height: auto; border: 0;"></a></td>
                                        <td style="padding:0 2px 0 2px;"><a href="https://twitter.com/" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/circle-color/twitter@2x.png" width="32" height="32" alt="Twitter" title="Twitter" style="display: block; height: auto; border: 0;"></a></td>
                                        <td style="padding:0 2px 0 2px;"><a href="https://www.linkedin.com/" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/circle-color/linkedin@2x.png" width="32" height="32" alt="LinkedIn" title="LinkedIn" style="display: block; height: auto; border: 0;"></a></td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table><!-- End -->
    </body>
    
    </html>

    `
  }
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });  
  
}




module.exports = {testInfo, uploadClassContents}
