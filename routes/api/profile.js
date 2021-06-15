const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const Profile = require('../../models/Profile')
const User = require('../../models/User')
const {check,validationResult} = require('express-validator')
const request = require('request')
const config = require('config')
const normalize = require('normalize-url')

// @route GET api/profile/me
//@desc   get current users profile
//@access Private
router.get('/me',auth,async(req, res) =>{
   try{
    const profile =await Profile.findOne({user:req.user.id}).populate('user',['name','avatar'])
    if(!profile){
        return res.status(400).json({msg:"There is no profile"})
    }
    res.json(profile)
   }catch(e){
    console.log(e.message)
    res.status(500).send("server error")
   }
})


// @route POST api/profile/
//@desc   create/update user profile
//@access Private
router.post(
  '/',
  auth,
  check('status', 'Status is required').notEmpty(),
  check('skills', 'Skills is required').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // destructure the request
    const {
      website,
      skills,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook,
      // spread the rest of the fields we don't need to check
      ...rest
    } = req.body;

    // build a profile
    const profileFields = {
      user: req.user.id,
      website:
        website && website !== ''
          ? normalize(website, { forceHttps: true })
          : '',
      skills: Array.isArray(skills)
        ? skills
        : skills.split(',').map((skill) => ' ' + skill.trim()),
      ...rest
    };

    // Build socialFields object
    const socialFields = { youtube, twitter, instagram, linkedin, facebook };

    // normalize social fields to ensure valid url
    for (const [key, value] of Object.entries(socialFields)) {
      if (value && value.length > 0)
        socialFields[key] = normalize(value, { forceHttps: true });
    }
    // add to profileFields
    profileFields.social = socialFields;

    try {
      // Using upsert option (creates new doc if no match is found):
      let profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true, upsert: true, setDefaultsOnInsert: true },
       
      );
      return res.json(profile);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server Error');
    }
  }
)

// @route GET api/profile/
//@desc   get all profiles
//@access Public

router.get('/',async(req,res)=>{
  try{
    const profiles = await Profile.find().populate('user',['name','avatar'])
    res.json(profiles)
  }catch (err){
    console.error(err.message);
    res.status(500).send('Server Error');
  }
})

// @route GET api/profile/user/:user_id
//@desc   get profile by user ID
//@access Public

router.get('/user/:user_id',async(req,res)=>{
  try{
    const profile = await Profile.findOne({user:req.params.user_id}).populate('user',['name','avatar'])
    if(!profile){
      return res.status(400).json({msg:"Profile not found"})

    }
    res.json(profile)
  }catch (err){
    console.error(err.message);
    if(err.kind == 'ObjectId'){
      return res.status(400).json({msg:"Profile not found"})
    }
    res.status(500).send('Server Error');
  }
})

// @route Delete api/profile/
//@desc   Delete profile user and posts
//@access Private

router.delete('/',auth,async(req,res)=>{
  try{
    //@todo - remove users posts

    //remove profile
    await Profile.findOneAndRemove({user:req.user.id})
    //remove user
    await User.findOneAndRemove({_id: req.user.id})
    res.json({msg: "User deleted"})
  }catch (err){
    console.error(err.message);
    res.status(500).send('Server Error');
  }
})

// @route PUT api/profile/experience
//@desc   Add profile experience
//@access Private

router.put('/experience',[auth,[
  check('title','Title is required').not().isEmpty(),
  check('company','company is required').not().isEmpty(),
  check('from',' from date is required').not().isEmpty()
]], async(req, res)=>{
  const errors = validationResult(req)
  if(!errors.isEmpty()){
    return res.status(400).json({errors: errors.array()})
  }

  const {
    title,
    company,
    location,
    from,
    to,
    current,
    description
  } = req.body

  const newExp={
    title,
    company,
    location,
    from,
    to,
    current,
    description
  }

  try{
    const profile = await Profile.findOne({user: req.user.id})
    profile.experience.unshift(newExp)

    await profile.save()

    res.json(profile)

  }catch(e){
    console.log(e.message)
    res.status(500).send("server error")
  }
})
// @route delete api/profile/experience/:exp_id
//@desc   delete profile experience
//@access Private

router.delete('/experience/:exp_id',auth,async(req, res)=>{
  try{
    const profile = await Profile.findOne({user:req.user.id})
    //Get remove index
    const removeIndex = profile.experience.map(item=>item.id).indexOf(req.params.exp_id)
    //deleting it
    profile.experience.splice(removeIndex , 1)
    await profile.save()
    res.json(profile)
  }catch(e){
    res.status(500).send('Server Error')
    console.log(e)

  }
})


// @route PUT api/profile/education
//@desc   Add profile education
//@access Private

router.put('/education',[auth,[
  check('school','school is required').not().isEmpty(),
  check('degree','degree is required').not().isEmpty(),
  check('from',' from date is required').not().isEmpty(),
  check('fieldofstudy','field of study is required').not().isEmpty()
]], async(req, res)=>{
  const errors = validationResult(req)
  if(!errors.isEmpty()){
    return res.status(400).json({errors: errors.array()})
  }

  const {
    school,
    degree,
    fieldofstudy,
    from,
    to,
    current,
    description
  } = req.body

  const newEdu={
    school,
    degree,
    fieldofstudy,
    from,
    to,
    current,
    description
  }

  try{
    const profile = await Profile.findOne({user: req.user.id})
    profile.education.unshift(newEdu)

    await profile.save()

    res.json(profile)

  }catch(e){
    console.log(e.message)
    res.status(500).send("server error")
  }
})


// @route delete api/profile/education/:edu_id
//@desc   delete profile education
//@access Private

router.delete('/education/:edu_id',auth,async(req, res)=>{
  try{
    const profile = await Profile.findOne({user:req.user.id})
    //Get remove index
    const removeIndex = profile.education.map(item=>item.id).indexOf(req.params.edu_id)
    //deleting it
    profile.education.splice(removeIndex , 1)
    await profile.save()
    res.json(profile)
  }catch(e){
    res.status(500).send('Server Error')
    console.log(e)

  }
})

// @route get api/profile/github/:username
//@desc   get profile github repos
//@access Public

router.get('/github/:username',async(req, res)=>{
  try{
    const options ={
      uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:ascending&client_id=${config.githubClientId}&client_secret=${config.githubClientSecret}`,
      method: 'GET',
      headers: {'user-agent' : 'node js'}

    }

    request(options, (error,response,body)=>{
      if(error){
        console.error(error)

      }
      if(response.statusCode !== 200){
        return res.status(404).json({msg: 'No Github profile found'})
      }
      res.json(JSON.parse(body))
    })
  }catch(e){
    console.log(e.message)
    res.status(500).send("Server error")
  }
})





module.exports = router