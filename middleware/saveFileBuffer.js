const fs = require('fs');
const path = require("path")
// Uint8Array

async function saveFileBuffer(req, res, next){
  const buffer = req.files[0]?.buffer
  const file_name = req.files[0]?.originalname
  const file_path = path.join(__dirname,'..', '_static_', file_name)
  console.log(buffer)
  const data = new Uint8Array(Buffer.from(buffer));
  console.log(file_path)
  fs.writeFile(file_path, Buffer.from(data), 'binary',  (err)=> {
    if (err) {
        console.log("There was an error writing the image")
    }
    else {
        console.log("Written File :" + file_path)
        next()
    }
  });
}

async function saveFileBufferClassroom(req, res, next){
  const buffer = req.files[0]?.buffer
  const file_name = req.files[0]?.originalname
  console.log(file_name)
  if(!file_name){
    console.log("No file supplied")
    next()
  }else{
    const file_path = path.join(__dirname, '..', '/uploads/class_room', file_name)
    console.log(buffer)
    const data = new Uint8Array(Buffer.from(buffer));
    console.log(file_path)
    fs.writeFile(file_path, Buffer.from(data), 'binary', (err) => {
      if (err) {
        console.log("There was an error writing the image")
      }
      else {
        console.log("Written File :" + file_path)
        next()
      }
    });  
  }
  
}




module.exports = {saveFileBuffer, saveFileBufferClassroom}