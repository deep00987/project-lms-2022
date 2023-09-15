const db = require("../../../database")
const util = require('util');
const { response } = require("express");

const query = util.promisify(db.query).bind(db);


async function uploadDpStudent(req, res){
  let user_id = req._current_client.id;
  let sp_path = req.files[0]?.originalname;
  let rows;
  let result = {}
  let sql0 = `
    SELECT * from student_dp  where student_id = ${user_id};
  `

  let sql1 = `
    INSERT INTO student_dp (student_id, dp_path)
    values (?, ?);
  `
  let sql2 = `
    UPDATE student_dp 
    SET dp_path = '${sp_path}' 
    WHERE student_id = ${user_id};
  `

  try {
    rows = await query(sql0)
    console.log(rows)
  } catch (error) {
    console.log(error)
    result = {
      "success": 0, 
      "msg": "not working"
    }
  }

  if(rows.length > 0){
    try {
      await query(sql2)
      console.log(rows)
      result = {
        "success" : 1,
        "msg" : "DP updated"
      }
    } catch (error) {
      console.log(error)
      result = {
        "success": 0, 
        "msg": "not working"
      }
    }
  }else{
    try {
      rows = await query(sql1, [user_id, sp_path])
      console.log(rows)
      result = {
        "success" : 1,
        "msg" : "DP uplaoded"
      }
    } catch (error) {
      console.log(error)
      result = {
        "success": 0, 
        "msg": "not working"
      }
    }
  }

  return result
}



module.exports = {uploadDpStudent}