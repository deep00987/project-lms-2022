const jwt = require('jsonwebtoken')

function verifyToken(request, response, next){

    const token = request.header('auth-token')
    if(!token){
        return response.status(401).json({
            "success":0,
            "msg": "access denied"
        })

    }

    try{
        const verified = jwt.verify(token, process.env.JWT_SECRET)
        console.log(verified)
        request.body.client = verified
        console.log(request.body.client)
        next()
    }catch(err){
        console.log(err)
        return response.status(401).json({
            "success": 0,
            "msg": "Invalid token"
        })
    }

}

module.exports = verifyToken