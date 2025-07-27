import Booking from "../Models/Booking.js";
import Car from "../Models/car.js";

// Updated availability check function
const checkAvailability = async (car, pickupDate, returnDate, excludeBookingId = null) => {
    const query = {
        car,
        pickupDate: { $lte: returnDate },
        returnDate: { $gte: pickupDate },
        status: { $ne: "cancelled" } // Exclude cancelled bookings
    };
    
    if (excludeBookingId) {
        query._id = { $ne: excludeBookingId };
    }

    const bookings = await Booking.find(query);
    return bookings.length === 0;
};

// API to check Availability of cars for a given date and location
export const checkAvailabilityOfCar = async (req, res) => {
    try {
        const { location, pickupDate, returnDate } = req.body;

        // Validate dates
        if (new Date(pickupDate) >= new Date(returnDate)) {
            return res.json({ success: false, message: "Return date must be after pickup date" });
        }

        const cars = await Car.find({ location, isAvailable: true });

        const availableCars = await Promise.all(
            cars.map(async (car) => {
                const isAvailable = await checkAvailability(car._id, pickupDate, returnDate);
                return isAvailable ? car : null;
            })
        );

        res.json({ 
            success: true, 
            availableCars: availableCars.filter(car => car !== null) 
        });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to create booking
export const createBooking = async (req, res) => {
    try {
        const { _id } = req.user;
        const { car, pickupDate, returnDate } = req.body;

        // Validate dates
        if (new Date(pickupDate) >= new Date(returnDate)) {
            return res.json({ success: false, message: "Return date must be after pickup date" });
        }

        const isAvailable = await checkAvailability(car, pickupDate, returnDate);
        if (!isAvailable) {
            return res.json({ success: false, message: "Car is not available for the selected dates" });
        }

        const carData = await Car.findById(car);
        if (!carData) {
            return res.json({ success: false, message: "Car not found" });
        }

        // Prevent owner from booking their own car
        if (carData.owner.toString() === _id.toString()) {
            return res.json({ success: false, message: "You are the owner of this car and cannot book it." });
        }

        // Calculate price
        const picked = new Date(pickupDate);
        const returned = new Date(returnDate);
        const noOfDays = Math.ceil((returned - picked) / (1000 * 60 * 60 * 24));
        const price = carData.pricePerDay * noOfDays;

        await Booking.create({ 
            car, 
            owner: carData.owner, 
            user: _id, 
            pickupDate, 
            returnDate, 
            price,
            status: "pending" 
        });

        res.json({ success: true, message: "Booking Created" });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

export const getUserBookings=async(req,res)=>{
    try{
        const {_id}=req.user;
        const bookings=await Booking.find({user:_id}).populate("car").sort({createdAt:-1})
        res.json({success:true,bookings})

    }
    catch(error){
         console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

//API to get Owner Bookings
export const getOwnerBookings=async(req,res)=>{
    try{
        if(req.user.role!=='owner'){
            return res.json({success:false,message:"Unauthorized"})
        }
        const bookings=await Booking.find({owner:req.user._id}).populate('car user').select("-user.password").sort({createdAt:-1})
        res.json({success:true,bookings})

    }
    catch(error){
         console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

//API to change booking status
export const changeBookingStatus=async(req,res)=>{
    try{
        const {_id}=req.user;
        const {bookingId,status}=req.body
        const booking=await Booking.findById(bookingId)
        if(booking.owner.toString()!==_id.toString() ){
            return res.json({success:false,message:"Unauthorized"})
        }
        booking.status=status;
        await booking.save();

        res.json({success:true,message:"Status Updated"})
    }
    catch(error){
         console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}