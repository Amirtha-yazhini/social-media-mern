const express = require('express')
const router = express.Router()
const {check,validationResult} = require('express-validator')
const User = require('../../models/User')
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../../config/default.json')

// @route POST api/users
//@desc   Register User
//@access Public
router.post('/',[
    check('name','Name is required').not().isEmpty(),
    check('email','Email is required').isEmail(),
    check('password','Password is required with 6 or more characters').isLength({min:6})
],async(req, res) =>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }

    const {name,email,password} = req.body

    try{
         //See if user exists already
         let user = await User.findOne({email})
         if(user){
            return res.status(400).send("User already exists")
         }

        //Get users gravatar
        const avatar = gravatar.url(email,{
            s: "200",
            r:"pg",
            d:"mm"
        })
        user = new User({
            name,email,avatar,password
        })

        //encrypt passwords 
        const salt = await bcrypt.genSalt(10)
        user.password= await bcrypt.hash(password,salt)
        await user.save()


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