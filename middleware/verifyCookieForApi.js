const jwt = require('jsonwebtoken')




function verifyCookieForApi(request, response, next){
    const token = request.cookies.JWT_COOKIE
    console.log(token)
    //console.log(request)
    if(!token){
      
      return response.status(401).json({
        "success":0,
        "msg": "access denied"
      })
      
    }
    
    try{
        //console.log(request)
        const verified = jwt.verify(token, process.env.JWT_SECRET)
        if(verified.is_staff){
          return response.status(401).json({
            "success": 0,
            "msg": "Invalid token"
          })
        }else{
          console.log("verified: ", verified)
          request.body.client = verified
        }
        
        
        next()
    }catch(err){
        console.log(err)
        
        return response.status(401).json({
            "success": 0,
            "msg": "Invalid token"
        })
    }


}

module.exports = verifyCookieForApi