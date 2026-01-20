const user=require("../models/User");
const OTP=require("../models/OTP");
const otpgen=require("otp-generator");
const Profile=require("../models/Profile");
const jwt=require("jsonwebtoken");
const bcrypt=require("bcrypt");
const sendEmail = require("../utils/sendemail");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
require("dotenv").config();
exports.sendOTP=async(req,res)=>{
    try{
        //email check kr rha if already existing or not
        const {email}=req.body;
        const exist=await user.findOne({email});
        if(exist){
            return res.status(400).json({
                success:false,
                message:"User already exists"
            }); 
        }
        //generating otp 
        //ye bruteforce hai aur industry point of view se bahut bura h 
        //i have to search for any package
        var otp=otpgen.generate(6,{
            upperCaseAlphabets:false,
            specialChars:false,
            lowerCaseAlphabets:false
        })
        //checking if otp already exists i.e. checking for uniqueness of otp
        let checkExistingOTP=await OTP.findOne({otp});
        while(checkExistingOTP){    //jbtk unique otp nahi milta tbtk loop chlega
            otp=otpgen.generate(6,{
                upperCaseAlphabets:false,
                specialChars:false,
                lowerCaseAlphabets:false
            });
             checkExistingOTP=await OTP.findOne({otp});//checking in db that otp exist or not
        }
        //is method se phele mera pre hook call hora hoga so mail pr otp bhj rha hoga
        const result=await OTP.create({email,otp});
        return res.status(401).json({
            success:true,
            message:"OTP sent to your email",
            data:result
        })
        
    }
    catch(err){
        console.log("Error in sending OTP",err);
        return res.status(500).json({
            success:false,
            message:"Error in sending OTP",
            error:err.message
        })
    }
}
    exports.signUp=async(req,res)=>{
        /*Flow of the signup->
          1)fetch all the details from req.body
          2)validate the data
          3)pass and confirmpswd check
          4)check for existing user
          5)find out the latest otp for the email
          6)match otp and check for expiry i.e. otp validation
          7)pswd hash
          8)create entry in DB
          9)return response
          */
        try{
            //data fetch from req body
            const{firstName,
                lastName,email
                ,password,confirmpswd,addDetails,
                accountType, courses,
                image,otp}=req.body;
                //validation
            if(!firstName || !lastName || !email || !password ||!confirmpswd|| !accountType||!otp){
                return res.status(401).json({
                    success:false,
                    message:"All fields are required"
                });
            }  
            // cheking password and confirm password
            if(password!==confirmpswd){
                return res.status(401).json({
                    success:false,
                    message:"Password and confirm password should be same"
                });
            }

            //already existing user check
            const existingUser=await user.findOne({email});
            if(existingUser){
                return res.status(401).json({
                    success:false,
                    message:"User already exists"
                });
            }  
            //recent otp
            const recentOTP=await OTP.findOne({email}).sort({createdAt:-1}).limit(1);  
            if(!recentOTP){
                return res.status(401).json({
                    success:false,
                    message:"OTP not found"
                })
            }
            //matching otp
            else if(recentOTP.otp!==otp){
                return res.status(401).json({
                    success:false,
                    message:"Invalid OTP"
                })
            }
            let haspwd;
            try{
                const saltRounds=10;
                haspwd=await bcrypt.hash(password,saltRounds);
                
            }
            catch(err){
                return res.status(500).json({
                    success:false,
                    message:"Error in hashing password",
                    error:err.message
                })
            }
            const profile=await Profile.create({
                gender:null,
                dateOfBirth:null,
                about:null,
                contactNumber:null
            })
            const newUser=await user.create({
                firstName,
                lastName,email
                ,password:haspwd,addDetails:profile,
                accountType,
                image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
            })
            return res.status(200).json({
                success:true,
                message:"User created successfully",
                data:newUser
            }) 
            }           
            
        catch(err){
            console.log("Error in signup",err);
            return res.status(500).json({
                success:false,
                message:"Error in signup",
                error:err.message
            })
        }
    }
    exports.login=async(req,res)=>{
        /*LOGIN KA FLOW->
        1)fetch email,password,accountType from req.body
        2)validate data
        3)check for existing user
        4)match pswd with bcrypt.compare if matches then
        5)generate jwt token by jwt.sign()
        6)create cookie and set in response
        7)return response
        8)if not matches return invalid credentials
        9)return error if any
        */ 
        try{
            const{email,password,accountType}=req.body;
            if(!email || !password || !accountType){
                return res.status(401).json({
                    success:false,
                    message:"All fields are required"
                });
            }
            const existingUser=await user.findOne({email});
            if(!existingUser){
                return res.status(401).json({
                    success:false,
                    message:"Please signup first"
                });
            }
            if(existingUser.accountType!=accountType){
                return res.status(401).json({
                    success:false,
                    message:"account type does not match"
                })
            }
            if(await bcrypt.compare(password,existingUser.password)){
                const payload={ //data that we want to store in token which will be useful in future
                    id:existingUser._id,
                    email:existingUser.email,
                    accountType:existingUser.accountType
                }
                const token=jwt.sign(payload,process.env.JWT_SECRET,{
                    expiresIn:"1d"
                });
                existingUser.toObject();
                existingUser.token = token;
                existingUser.password = undefined;
                const options={
                    expires:new Date(Date.now()+24*60*60*1000),
                    httpOnly:true
                }
                return res.cookie("token",token,options).status(200).json({
                    success:true,
                    message:"Login successful",
                    token,
                    data:existingUser
                });
            }   
            else{
                return res.status(401).json({
                    success:false,
                    message:"Invalid credentials"
                });
            }   
        }
        catch(err){
            console.log("Error in login",err);
            return res.status(500).json({
                success:false,
                message:"Error in login",
                error:err.message
            })
        }
    }
    exports.changePassword=async(req,res)=>
    {/* get data from req body
        get old ,new pswd,confirmnewpswd
        validations
        update pswd in db
        send mail-pswd changed successfully
        retun response
        */
       try{
        const userdetails=await user.findById(req.user.id);
        const{oldpassword,newPassword,confirmNewPassword}=req.body;
         if(!oldpassword || !newPassword || !confirmNewPassword){
            return res.status(401).json({
                success:false,
                message:"All fields are required"
            })
         }
         const isMatch=await bcrypt.compare(oldpassword,userdetails.password);
            if(!isMatch){
                return res.status(401).json({
                    success:false,
                    message:"Old password is incorrect"
                })
            }
            if(newPassword!==confirmNewPassword){
                return res.status(401).json({
                    success:false,
                    message:"New password and confirm new password should be same"
                })
            }
            let haspwd;
            try{
                haspwd=bcrypt.hash(newPassword,10);
                const updatedUser=await user.findByIdAndUpdate(req.user.id,{password:haspwd},{new:true});
                     //sending mail
                await sendEmail(userdetails.email,passwordUpdated(
                    userdetails.email,
                    `Password updated successfully for ${userdetails.firstName}  ${userdetails.lastName}`
                ));
                return res.status(200).json({
                    success:true,
                    message:"Password changed successfully",
                    data:updatedUser
                })
            }
            catch(err){
                console.log("Error in hashing password",err);
                return  res.status(500).json({  
                    success:false,
                    message:"Error in hashing password",
                    error:err.message
                })        
            }
        }
        catch(err){
            console.log("Error in changing password",err);
            return res.status(500).json({
                success:false,
                message:"Error in changing password",
                error:err.message
            })
        }   

    }