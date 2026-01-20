const mongoose=require("mongoose");
const SubSecSchema=new mongoose.Schema({
 title:{
    type:String,
    required:true
 },
 timeDuration:{
    type:String,

 },
 videoUrl:{
    type:String,
    required:true,  
 },
 description:{
    type:String,
    trim:true
 },
 additionalUrl:{
    type:String,
 } 
 
});
module.exports=mongoose.model("SubSec",SubSecSchema);