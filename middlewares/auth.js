const jwt=require("jsonwebtoken");
require("dotenv").config();
const user=require("../models/User");
exports.auth=async(req,res,next)=>{
    try{
        const token=req.header("Authorization")?.replace("Bearer ", "") ||req.cookies.token||req.body.token;
        if(!token){
            return res.status(401).json({
                success:flase,
                message:"Unauthorized"
            })
        }
       try{
             const decoded=jwt.verify(token,process.env.JWT_SECRET);//payload ka data bhi decode hoga
                req.user=decoded;//req.user me payload ka data store kar denge help in checking user type

        }
        catch(err){
            return res.status(401).json({
                success:false,
                message:"Invalid token"
            });
        }
        next();
    }
    catch(err){
        console.log(err);
        return res.status(401).json({
            success:false,
            message:"error in auth middleware"
        })
    }
}
exports.isStudent=async(req,res,next)=>{
    try{

    
    if(req.user.accountType!=="Student"){
            return res.status(403).json({
                success:false,
                message:"This route is only for students"
            })    
    }
    next();
}
catch(err){
    console.log(err);
        return res.status(401).json({
            success:false,
            message:"error in isStudent middleware"
        })
}
}
exports.isInstructor=async(req,res,next)=>{
    try{
    if(req.user.accountType!=="Instructor"){
            return res.status(403).json({
                success:false,
                message:"This route is only for Instructors"
            })    
    }
    next();
}
catch(err){
    console.log(err);
        return res.status(401).json({
            success:false,
            message:"error in isInstructor middleware"
        })
}
}
exports.isAdmin=async(req,res,next)=>{
    try{
       if(req.user.accountType!=="Admin"){
            return res.status(403).json({
                success:false,
                message:"This route is only for Admins"
            })    
    }
    next();
}
catch(err){
    console.log(err);
        return res.status(401).json({
            success:false,
            message:"error in isAdmin middleware"
        })
}
}
