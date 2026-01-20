const mongoose=require("mongoose");
require("dotenv").config();
exports.connectDB=()=>{
    mongoose.connect(process.env.DB_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true,
    }).then(()=>{
        console.log("DB connected");
    })
    .catch((err)=>{
        console.log("DB connection failed",err);
    });
}