import imagekit from "../configs/imageKit.js";
import Booking from "../Models/Booking.js";
import Car from "../Models/car.js";
import User from "../Models/User.js";
import fs from "fs";


//API to change role

export const changeRoleToOwner=async(req,res)=>{
    try{
        const {_id}=req.user;
        await User.findByIdAndUpdate(_id,{role:"owner"})
        res.json({success:true,message:"Now you can list cars"})
    }catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}

//API to list Car

export const addCar=async(req,res)=>{
    try{
        const {_id}=req.user;
        let car=JSON.parse(req.body.carData);
        const imageFile=req.file;

        //Upload image to imagekit
        const fileBuffer=fs.readFileSync(imageFile.path)
        const response= await imagekit.upload({
            file:fileBuffer,
            fileName:imageFile.originalname,
            folder:'/cars'
        })

        // Optimization through imagekit URL transformation
var optimizedImageURL = imagekit.url({
    path : response.filePath,
    transformation : [
        {width:'1280'},//Width resizing
        {quality:'auto'},//Auto compression
    {format:'webp'} //convert to modern format
]
});

const image=optimizedImageURL;
await Car.create({...car, owner: _id, image, imageFileId: response.fileId, isAvailable: true })

res.json({ success:true,message:"Car Added" })


    }catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}

//API to list Owner Cars
export const getOwnerCars=async(req,res)=>{
    try{
        const {_id}=req.user;
        const cars=await Car.find({owner:_id})
        res.json({success:true,cars})
    }
    catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}

//API to Toggle Car Availability

export const toggleCarAvailability=async(req,res)=>{
    try{
        const {_id}=req.user
        const {carId}=req.body
        const car=await Car.findById(carId)

        //Checking is car belongs to the user
        if(car.owner.toString()!== _id.toString()){
            return res.json({success:false,message:"Unauthorized"});
        }
        
        car.isAvailable=!car.isAvailable;
        await car.save()

        res.json({success:true,message:"Availability Toggled"})
    }catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}

//API to delete a car
export const deleteCar = async (req, res) => {
  try {
    const { _id } = req.user;
    const { carId } = req.body;
    const car = await Car.findById(carId);

    if (!car) {
      return res.json({ success: false, message: "Car not found" });
    }

    if (car.owner.toString() !== _id.toString()) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    // ✅ Delete image from ImageKit
    if (car.imageFileId) {
      await imagekit.deleteFile(car.imageFileId);
    }

    // ✅ Delete car from DB
    await Car.findByIdAndDelete(carId);

    res.json({ success: true, message: "Car Deleted Successfully" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//API to get Dashboard Data
export const getDashboardData = async (req, res) => {
  try {
    const { _id, role } = req.user;

    if (role !== 'owner') {
      return res.json({ success: false, message: "Unauthorized" });
    }

    const cars = await Car.find({ owner: _id });

    const bookings = await Booking.find({ owner: _id })
      .populate('car')
      .sort({ createdAt: -1 });

    const pendingBookings = await Booking.find({ 
      owner: _id, 
      status: "pending" 
    });
    
    const confirmedBookings = await Booking.find({ 
      owner: _id, 
      status: "confirmed" 
    });

    const recentBookings = bookings?.length ? bookings.slice(0, 5) : [];

    const monthlyRevenue = confirmedBookings.reduce((acc, booking) => {
      return acc + (booking.price || 0);
    }, 0);

    const dashboardData = {
      totalCars: cars.length,
      totalBookings: bookings.length,
      pendingBookings: pendingBookings.length,
      confirmedBookings: confirmedBookings.length, // Changed from completeBookings
      recentBookings,
      monthlyRevenue,
    };

    res.json({ success: true, dashboardData });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};


//API to update user image

export const updateUserImage=async(req,res)=>{
    try{
        const {_id}=req.user;
        const imageFile=req.file;

        //Upload image to imagekit
        const fileBuffer=fs.readFileSync(imageFile.path)
        const response= await imagekit.upload({
            file:fileBuffer,
            fileName:imageFile.originalname,
            folder:'/users'
        })

        // Optimization through imagekit URL transformation
var optimizedImageURL = imagekit.url({
    path : response.filePath,
    transformation : [
        {width:'400'},//Width resizing
        {quality:'auto'},//Auto compression
    {format:'webp'} //convert to modern format
]
});

const image=optimizedImageURL;
await User.findByIdAndUpdate(_id,{image});
res.json({success:true,message:"Done"})
    }
    catch{
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}