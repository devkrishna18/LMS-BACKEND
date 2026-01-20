const express=require("express");
const app=express();

require("dotenv").config();

const PORT=process.env.PORT || 2025;
const cookieParser = require("cookie-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");

app.use(express.json());
app.use(cookieParser());
app.use(
	cors({
		origin: "http://localhost:3000",
		credentials: true,
	})
)

app.use(
	fileUpload({
		useTempFiles:true,
		tempFileDir:"/tmp",
	})
)
const fs = require("fs");

console.log("Files inside ./config:", fs.readdirSync("./config"));
require("./config/database").connectDB();
require("./config/cloudinary").cloudinaryConnect();
const  userRouter=require("./routers/User");    
const  profileRouter=require("./routers/Profile");    
const  paymentRouter=require("./routers/Payment");    
const  courseRouter=require("./routers/Course");    

    
app.use("/api/v1/auth",userRouter);
app.use("/api/v1/profile",profileRouter);
app.use("/api/v1/payment",paymentRouter);
app.use("/api/v1/course",courseRouter);
 

app.get("/", (req, res) => {
	return res.json({
		success:true,
		message:'Your server is up and running....'
	});
});
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});  