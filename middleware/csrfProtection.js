const csrf = require('csurf')
let csrfProtection = csrf({ cookie: { httpOnly: true, }})


// function csrfProtection(req, res, next){
//   csrf(req, res, function (err) {
//     if (err) {
//         return res.status(403).json({"success": 0, "msg": "Unauthorized"})
//     } else {
//         next();
//     }
// });
// }

function csrfErrorHandler(err, req, res, next) {
  if (err.code !== 'EBADCSRFTOKEN') return next(err)
  console.log(err.code === 'EBADCSRFTOKEN'?'form tampered with': "nothing")
  // handle CSRF token errors here
  return res.status(403).json({success: 0, msg: "CSRF TOKEN ERROR"})
}

function csrfErrorHandlerForm(err, req, res, next) {
  console.log(req)
  if (err.code !== 'EBADCSRFTOKEN') return next(err)
  console.log(err.code === 'EBADCSRFTOKEN'?'form tampered with': "nothing")
  // handle CSRF token errors here
  return res.send("<h1>CSRF ERROR</h1>")
}

module.exports = {csrfProtection, csrfErrorHandler, csrfErrorHandlerForm}