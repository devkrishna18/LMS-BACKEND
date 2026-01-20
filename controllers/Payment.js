const{instance}=require("../config/razorpay");
const Course=require("../models/Course");
const User=require("../models/User");
exports.capturePayment=async(req,res)=>{
    /*1)fetch all the details get userid and course id 
    2)validation of id's
    */
    const{courseId}=req.body;
    const userId=req.user.id;
    if(!courseId){
        return res.status(400).json({
            success:false,
            message:"Course id is required"
        })
    }
    let course;
    try{
        course=await Course.findById(courseId);
        if(!course){
            return res.status(400).json({
                success:false,
                message:"Course not found"
            })
        }
        //check if user already purchased the course
        const uid=new mongoose.Types.ObjectId(userId);//payload ke andr string type tha
        //to compare it with studentenrolled in Course model which is object id type so convert userid into object id type
        if(course.studentsEnrolled.includes(uid)){
            return res.status(400).json({
                success:false,
                message:"Already purchased the course"
            })
        }

    }

    catch(err){
        return res.status(500).json({
            success:false,
            message:err.message
        })
    }
    //3)create order using razorpay
    const amount=course.price*100;
    const currency="INR";
    const options={
        amount:amount,
        currency:currency,
        receipt:Math.random(Date.now()).toString(),
        notes:{
            courseId:courseId,
            userId:userId
        }
    }
    try{
        const paymentResponse=await instance.orders.create(options);
        console.log(paymentResponse);
        return res.status(200).json({
            success:true,
            message:"Order created successfully",
            orderId:paymentResponse.id,
            currency:paymentResponse.currency,
            amount:paymentResponse.amount,
            courseName:course.courseName,
            courseDescription:course.description,
            thumbnail:course.thumbnail
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:err.message
        })
    }
}
//verify you need to make sure the request really came from Razorpay and not from some attacker who just fakes a request to your endpoint.
exports.verifySignature=async(req,res)=>{
    //server ki secret key and razpay ki secret key ki matching
    const webhookSecret="123456789";
    const signature=req.headers["x-razorpay-signature"];//signature that razorpay sends
//creating the expected signautre 
    const shasum=crypto.createHmac("sha256",webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest=shasum.digest("hex");
    
    if(signature===digest){
        console.log("Payment is authorized");
        const{courseId,userId}=req.body.payload.payment.entity.notes;
        try{
            //if payment is authorized then eroll the student in the course
            //1)add student to course model studentenrolled array
            const enrroledCourse=await Course.findByIdAndUpdate(courseId,{
                $push:{studentsEnrolled:userId}
            },{new:true});
            if(!enrroledCourse){
                return res.status(500).json({
                    success:false,
                    message:"Course not found"
                })
            }
            console.log(enrroledCourse);
//2)add course to user model courses array
            const enrolledStudent=await User.findByIdAndUpdate(userId,{
                $push:{courses:courseId}
            },{new:true});
            if(!enrolledStudent){
                return res.status(500).json({
                    success:false,
                    message:"User not found"
                })
            }
            console.log(enrolledStudent);
            //send mail
            return res.status(200).json({
                success:true,
                message:"Signature verified and student enrolled successfully"
            })
        }
    catch(err){
        return res.status(500).json({
            success:false,
            message:err.message
        })

    }
}
else{
    console.log("Payment is not authorized");
    return res.status(500).json({
        success:false,
        message:"Invalid signature"
    })
}
}