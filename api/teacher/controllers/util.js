const res = require("express/lib/response")
const db = require("../../../database")
const bcrypt = require('bcryptjs')
const util = require('util');


const query = util.promisify(db.query).bind(db);

async function updateEmail(req, res){
  const teacher_id = req.body.client.id
  const email = req.body.email;
  let rows;
  
  let sql1 = `
    select * from teacher where email = '${email}';
  `
  let sql2 = `
    UPDATE teacher 
    SET email = '${email}'
    WHERE teacher_id = ${teacher_id};
  `

  
  try {
    rows = await query(sql1)
    console.log(rows)
  } catch (error) {
    console.log(error)
    return res.status(400).json({
      "success" : 0, 
      "msg" : "something went wrong"
    })
  }

  if(rows.length > 0 ){
    return res.status(400).json({
      "success" : 0, 
      "msg" : "email is already taken or in use"
    })
  }else{
    try {
      rows = await query(sql2)
      console.log(rows)
      return res.status(200).json({
        "success" : 1, 
        "msg" : "email Updated"
      })
    } catch (error) {
      console.log(error)
      return res.status(400).json({
        "success" : 0, 
        "msg" : "something went wrong"
      })
    }
  }

  
}


async function updatePasswd(req, res){
  const teacher_id = req.body.client.id
  const password = req.body.password;
  let rows;
  
  const hash = bcrypt.hashSync(password, 10)
 
  let sql1 = `
    UPDATE teacher 
    SET password = '${hash}'
    WHERE teacher_id = ${teacher_id};
  `


  // //update term
  try {
    rows = await query(sql1)
    console.log(rows)
    return res.status(200).json({
      "success" : 1, 
      "msg" : "Password updated"
    })
  } catch (error) {
    console.log(error)
    return res.status(400).json({
      "success" : 0, 
      "msg" : "something went wrong"
    })
  }

  
  
}


module.exports = {updateEmail, updatePasswd}