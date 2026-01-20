# LMS-Backend

Welcome to the backend repository  Learning Management System (LMS) platform. This RESTful API is built using the **MERN stack** and handles user authentication, course management, payment integration, and media handling.

## 🛠️ Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (with Mongoose)
* **Authentication:** JWT (JSON Web Tokens), Bcrypt (Password Hashing), OTP Verification
* **Payment Gateway:** Razorpay
* **Cloud Storage:** Cloudinary (Image & Video Uploads)
* **Email Service:** Nodemailer

## ✨ Key Features

### 🔐 Authentication & Security
* **Signup/Login:** Secure user registration and login using JWT.
* **OTP Verification:** Email verification during signup.
* **Password Reset:** Token-based password reset functionality via email.
* **Role-Based Access Control (RBAC):** Distinct routes and permissions for **Students**, **Instructors**, and **Admins**.

### 🎓 Course Management (Instructor)
* **Create Courses:** Instructors can create new courses with thumbnails, prices, and tags.
* **Section & Sub-section:** Organized content structure (Modules -> Lectures).
* **Media Upload:** Integration with Cloudinary to upload video lectures and thumbnails.
* **Draft/Publish:** Option to save courses as drafts or publish them publicly.

### 📚 Student Experience
* **Course Discovery:** Fetch all available courses or browse by category.
* **Cart Functionality:** Add multiple courses to the cart.
* **Payment Integration:** Secure checkout using Razorpay.
* **Enrolled Courses:** Dashboard to view purchased courses and track progress.
* **Rating & Reviews:** Students can rate and review courses they have completed.

