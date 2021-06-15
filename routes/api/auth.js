const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const User = require('../../models/User')
const {check,validationResult} = require('express-validator')
const jwt = require('jsonwebtoken')
const config = require('../../config/default.json')
const bcrypt = require('bcryptjs')

// @route GET api/auth
//@desc   Test route
//@access Public
router.get('/',auth,async(req, res) =>{
   try{
    const user= await User.findById(req.user.id).select('-password')
    res.send(user)
   }catch(err){
    console.log(err.message)
    res.status(500).send("server error")
   }
})


// @route POST api/auth
//@desc   Authenticate User and get token
//@access Public
router.post('/',[
   
   check('email','Email is required').isEmail(),
   check('password','Password is required').exists()
],async(req, res) =>{
   const errors = validationResult(req)
   if(!errors.isEmpty()){
       return res.status(400).json({errors: errors.array()})
   }

   const {email,password} = req.body

   try{
        //See if user exists already
        let user = await User.findOne({email})
        if(!user){
           return res.status(400).json({errors: [{msg:"invalid credentials"}]})
        }

        const isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch){
         return res.status(400).json({errors: [{msg:"invalid credentials"}]})
        }
     
    

       //return jsonwebtoken
       const payload = {
           user:{
               id: user.id
           }
       }
       

       jwt.sign(payload,config.jwtSecret,{expiresIn: 360000},(err,token) => {
           if(err){
               throw err
           }
           res.json({token})
           
       })

       
   }catch(e){
       console.log(e)
       res.status(500).send("Server error")
   }

  
   
})








module.exports = router