import React, { useEffect, useState } from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import {motion} from 'motion/react'

const MyBookings = () => {
  const { axios, user, currency } = useAppContext()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchMyBookings = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/bookings/user')
      if (data.success) {
        setBookings(data.bookings || []) // Ensure it's always an array
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    user && fetchMyBookings()
  }, [user])

  // Format date safely
  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available'
    try {
      return dateString.split('T')[0]
    } catch {
      return 'Invalid date'
    }
  }

  if (loading) {
    return <div className="px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-48 mt-16 text-sm max-w-7xl">
      <Title title='My Bookings' subTitle='View and manage your all car bookings' align="left"/>
      <p>Loading your bookings...</p>
    </div>
  }

  if (bookings.length === 0) {
    return <div className="px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-48 mt-16 text-sm max-w-7xl">
      <Title title='My Bookings' subTitle='View and manage your all car bookings' align="left"/>
      <p>You have no bookings yet.</p>
    </div>
  }

  return (
    <motion.div
    initial={{opacity:0,y:30}}
    animate={{opacity:1,y:0}}
    transition={{duration:0.6}}
    className='px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-48 mt-16 text-sm max-w-7xl'>
      <Title title='My Bookings' subTitle='View and manage your all car bookings' align="left"/> 

      <div>
        {bookings.map((booking, index) => {
          // Skip if booking is not properly formed
          if (!booking || !booking.car || !booking.pickupDate || !booking.returnDate) {
            return null
          }

          return (
            <motion.div
            initial={{opacity:0,y:20}}
    animate={{opacity:1,y:0}}
    transition={{delay:index*0.1,duration:0.4}}
            
            key={booking._id || index} className='grid grid-cols-1 md:grid-cols-4 gap-6 p-6 border border-Color rounded-lg mt-5 first:mt-12'>
              {/* Car Image+Info */}
              <div className='md:col-span-1'>
                <div className='rounded-md overflow-hidden mb-3'>
                  <img 
                    src={booking.car.image || assets.car_placeholder} 
                    alt={`${booking.car.brand} ${booking.car.model}`} 
                    className='w-full h-auto aspect-video object-cover'
                  />  
                </div>
                <p className='text-lg font-medium mt-2'>
                  {booking.car.brand} {booking.car.model}
                </p>
                <p className='text-gray-500'>
                  {booking.car.year} • {booking.car.category} • {booking.car.location}
                </p>
              </div>

              {/* Booking info */}
              <div className='md:col-span-2'>
                <div className='flex items-center gap-2'>
                  <p className='px-3 py-1.5 bg-light rounded'> Booking #{index+1}</p>
                  <p className={`px-3 py-1 text-xs rounded-full ${
                    booking.status === 'confirmed' 
                      ? 'bg-green-400/15 text-green-600' 
                      : 'bg-red-400/15 text-red-600'
                  }`}>
                    {booking.status || 'unknown'}
                  </p>
                </div>
                
                <div className='flex items-start gap-2 mt-3'>
                  <img src={assets.calendar_icon_colored} alt='' className='w-4 h-4 mt-1'/>
                  <div>
                    <p className='text-gray-500'>Rental Period</p>
                    <p>
                      {formatDate(booking.pickupDate)} to {formatDate(booking.returnDate)}
                    </p>
                  </div>
                </div>

                <div className='flex items-start gap-2 mt-3'>
                  <img src={assets.location_icon} alt='' className='w-4 h-4 mt-1'/>
                  <div>
                    <p className='text-gray-500'>Pick-up Location</p>
                    <p>{booking.car.location || 'Location not specified'}</p>
                  </div>
                </div>
              </div>
              
              {/* Price */}
              <div className='md:col-span-1 flex flex-col justify-between gap-6'>
                <div className='text-sm text-gray-500 text-right'>
                  <p>Total Price</p>
                  <h1 className='text-2xl font-semibold text-primary'>
                    {currency} {booking.price?.toFixed(2) || '0.00'}
                  </h1>
                  <p>Booked on {formatDate(booking.createdAt)}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

export default MyBookings