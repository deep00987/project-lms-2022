const jwt = require('jsonwebtoken')




function verifyCookieUpload(request, response, next){
    const token = request.cookies.JWT_COOKIE

    if(!token){
        return response.redirect("/login");
        // return response.status(401).json({
        //     "success":0,
        //     "msg": "access denied"
        // })

    }

    try{
        const verified = jwt.verify(token, process.env.JWT_SECRET)
        console.log(verified)
        if(verified?.is_staff ){
          return response.redirect('/staff/home')
        }
        request._current_client = verified
        
        next()
    }catch(err){
        console.log(err)
        return response.redirect("/login");
        // return response.status(401).json({
        //     "success": 0,
        //     "msg": "Invalid token"
        // })
    }


}

module.exports = verifyCookieUpload