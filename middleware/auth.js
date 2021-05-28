const jwt = require('jsonwebtoken')
const config = require('config')




module.exports = function(req, res, next) {
    //Get the token from header
    const token = req.header('x-auth-token')

    //check if no token 
    if(!token){
        res.status(401).send("No token, authorization denied")
    }

    //Verify token
    try {
        const decoded = jwt.verify(token,config.jwtSecret)
        req.user = decoded.user
        next()
    }catch(e){
        res.status(401).send("token not valid")
    }
}