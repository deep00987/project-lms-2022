const jwt = require('jsonwebtoken')


function verifyTeacherCookie(request, response, next){
    const token = request.cookies.JWT_COOKIE

    if(!token){
        return response.redirect("/staff/login");
        // return response.status(401).json({
        //     "success":0,
        //     "msg": "access denied"
        // })

    }

    try{
        const verified = jwt.verify(token, process.env.JWT_SECRET)
        console.log(verified)
        if(verified.is_staff){
          
          request.body.client = verified
          next()
        }else{
          return response.redirect('/home')
          
        }
        
    }catch(err){
        console.log(err)
        return response.redirect("/staff/login");
        // return response.status(401).json({
        //     "success": 0,
        //     "msg": "Invalid token"
        // })
    }


}

module.exports = verifyTeacherCookie