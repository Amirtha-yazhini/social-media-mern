const mongoose = require('mongoose')
const config = require('config')
const db = config.get('mongoURI')

const connectDB = async()=>{
    try{
       await mongoose.connect(db,{ useNewUrlParser: true,useCreateIndex:true })
       console.log("MongoDB connected successfully")
    }catch(e){
        console.log(err.message)
        // exit process with failure
        process.exit(1)
    }
}


module.exports = connectDB