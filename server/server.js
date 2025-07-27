import dotenv from "dotenv";
dotenv.config();



import express from "express";

import cors from "cors";
import connectDB from "./configs/db.js";
import userRouter from "./routes/userRoute.js";
import ownerRouter from "./routes/ownerRoute.js";
import bookingRouter from "./routes/bookingRoutes.js";


//initialize Express app
const app=express()
//Connect database
await connectDB()

//Middleware
app.use(cors());
app.use(express.json());

app.get('/',(req,res)=>{
    res.send("Server is running")
})

app.use('/api/user',userRouter)
app.use('/api/owner',ownerRouter)
app.use('/api/bookings',bookingRouter)
const PORT=process.env.PORT || 3000

app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`)
})