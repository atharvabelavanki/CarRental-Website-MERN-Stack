import { useContext, createContext, useState, useEffect, useCallback } from "react";
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from "react-router-dom";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;
export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();
  const currency = import.meta.env.VITE_CURRENCY;

  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [cars, setCars] = useState([]);
  // Add ownerCars state
  const [ownerCars, setOwnerCars] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch user - wrapped in useCallback
  const fetchUser = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/user/data');
      if (data.success) {
        setUser(data.user);
        setIsOwner(data.user.role === 'owner');
      } else {
        navigate('/');
      }
    } catch (error) {
      toast.error(error.message);
    }
  }, [navigate]);

  // ✅ Fetch cars
  const fetchCars = async () => {
    try {
      const { data } = await axios.get('/api/user/cars');
      data.success ? setCars(data.cars) : toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Add fetchOwnerCars function
  const fetchOwnerCars = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/owner/cars');
      if (data.success) {
        setOwnerCars(data.cars);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [axios]);

  // ✅ Logout logic
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsOwner(false);
    axios.defaults.headers.common['Authorization'] = '';
    toast.success("You have been logged out");
  };

  // ✅ On first load
  useEffect(() => {
    const token = localStorage.getItem('token');
    setToken(token);
    fetchCars();
  }, []);

  // ✅ When token changes
  // ✅ When token changes
useEffect(() => {
  const loadUser = async () => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      try {
        await fetchUser();
      } catch (error) {
        console.error("Failed to fetch user:", error);
        logout(); // Auto logout if token is invalid
      }
    }
  };
  loadUser();
}, [token, fetchUser]);

  // ✅ Provide all states and functions
  const value = {
    navigate,
    currency,
    axios,
    user,
    setUser,
    token,
    setToken,
    isOwner,
    setIsOwner,
    fetchUser,
    showLogin,
    setShowLogin,
    logout,
    fetchCars,
    cars,
    setCars,
    pickupDate,
    setPickupDate,
    returnDate,
    setReturnDate,
    // Add these to context
    ownerCars,
    setOwnerCars,
    fetchOwnerCars,
    loading,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};
