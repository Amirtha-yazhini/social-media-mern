const express = require('express')
const router = express.Router()
const {check, validationResult} = require('express-validator')
const auth = require('../../middleware/auth')


const Profile = require('../../models/Profile')
const Post = require('../../models/Post');
const User = require('../../models/User');


// @route post api/posts
//@desc   create
//@access Private
router.post('/',[auth,[
    check('text','Text is required').not().isEmpty()
]],async(req, res) =>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    try{
        const user = await User.findById(req.user.id).select('-password')

        const newPost = new Post( {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        })

        const post = await newPost.save()
        res.json(post)
    }catch(err){
        console.log(err.message)
        res.status(500).send("server error")
    }
 


})



// @route Get api/posts
//@desc   get all posts
//@access Private
router.get('/',auth,async(req, res)=>{
    try{
        const posts = await Post.find().sort({likes: -1})
        res.json(posts)
    }catch(error){
        console.log(error.message)
        res.status(500).send("server error")
    }
})

// @route Get api/posts/:id
//@desc   get  post by id
//@access Private
router.get('/:id',auth,async(req, res)=>{
    try{
        const post = await Post.findById(req.params.id)
        if(!post){
            return res.status(404).json({msg: "No post found"})
        }
        res.json(post)
    }catch(error){
        console.log(error.message)
        if(err.kind==='ObjectId'){
            return res.status(404).json({msg: "No post found"})
        }
        res.status(500).send("server error")
    }
})

// @route Delete api/posts/:id
//@desc   delete a post
//@access Private
router.delete('/:id',auth,async(req, res)=>{
    try{
        const post = await Post.findById(req.params.id)
        if(!post){
            return res.status(404).json({msg: "No post found"})
        }
        //Check on the user 
        if(post.user.toString() !== req.user.id){
            return res.status(401).json({msg: "User not authorised"})
        }
        await post.remove()

        res.json({msg: "Post remove success"})
        
    }catch(error){
        console.log(error.message)
        if(err.kind==='ObjectId'){
            return res.status(404).json({msg: "No post found"})
        }
        res.status(500).send("server error")
    }
})


// @route Put api/posts/like/:id
//@desc   like a post
//@access Private

router.put('/like/:id',auth,async(req, res)=>{
    try{
        const post  =await Post.findById(req.params.id)

        //CHeck if the post has already been liked
        if(post.likes.filter(like=> like.user.toString() === req.user.id ).length>0){
            return res.status(400).json({msg:"post liked already"})
        }
        post.likes.unshift({user: req.user.id})
        await post.save()

        res.json(post.likes)

    }catch(e){
        console.log(e.message)
        res.status(500).send("server error")
    }
})



// @route Put api/posts/unlike/:id
//@desc   like a post
//@access Private

router.put('/like/:id',auth,async(req, res)=>{
    try{
        const post  =await Post.findById(req.params.id)

        //CHeck if the post has already been liked
        if(post.likes.filter(like=> like.user.toString() === req.user.id ).length = 0){
            return res.status(400).json({msg:"post has not yet been liked"})
        }
        //Get remove index
        const removeIndex = post.likes.map(like=> like.user.toString()).indexOf(req.user.id)
        post.likes.splice(removeIndex,1)
        await post.save()

        res.json(post.likes)

    }catch(e){
        console.log(e.message)
        res.status(500).send("server error")
    }
})



// @route post api/posts/comment/:id
//@desc   comment on a post
//@access Private
router.post('/comment/:id',[auth,[
    check('text','Text is required').not().isEmpty()
]],async(req, res) =>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    try{
        const user = await User.findById(req.user.id).select('-password')
        const post = await Post.findById(req.params.id)

        const newComment = new Post( {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        })
        post.comments.unshift(newComment)

        await post.save()
        res.json(post.comments)
    }catch(err){
        console.log(err.message)
        res.status(500).send("server error")
    }
 


})


// @route post api/posts/comment/:id/:comment_id
//@desc   Delete comment
//@access Private

router.delete('/comment/:id/:comment_id',auth,async(req, res)=>{
    try{
        const post = await Post.findById(req.params.id)
        //pull out comments
        const comment  = post.comments.find(comment=> comment.id === req.params.comment_id)

        //Make sure comment exists

        if(!comment){
            return res.status(404).json({message: "comment does not exist"})
        }
        
        //check user 

        if(comment.user.toString() !==  req.user.id){
            return res.status(401).json({message: "user not authorised"})

        }

        //Get remove index
        const removeIndex = post.comments.map(comment=> comment.user.toString()).indexOf(req.user.id)
        post.comments.splice(removeIndex,1)
        await post.save()
        res.json(post.comments)

    }catch(e){
        console.log(err.message)
        res.status(500).send("server error")
    

    }
})



module.exports = router