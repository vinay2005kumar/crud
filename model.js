const mongoose=require('mongoose')
const schema=mongoose.Schema({
    name:String,
    age:Number,
    salary:Number,
    file:String
},{collection:'employee'})
module.exports=mongoose.model('employee',schema)