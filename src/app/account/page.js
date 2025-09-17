"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/authContext";
import Cookies from "js-cookie";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  User, 
  ShoppingBag, 
  MapPin, 
  CreditCard, 
  Settings, 
  Mail, 
  Phone, 
  Calendar,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Plus,
  Download,
  Loader2,
  AlertCircle,
  CardSimIcon,
  CreditCardIcon,
  Eye,
  Navigation,
  Bell,
  Globe,
  Clock,
  Wallet,
  CalendarDays
} from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

export default function ProfilePage() {
  const { user: authUser, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // State for user data
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  
  // Form states
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    email: "",
    username: ""
  });

  // Address form state (updated for new API structure)
  const [addressForm, setAddressForm] = useState({
    field: "",
    address1: "",
    address2: "",
    country: "",
    city: "",
    state: "",
    postal_code: ""
  });

  // Saved Cards state
  const [savedCards, setSavedCards] = useState([]);
  const [newCard, setNewCard] = useState({
    card_number: "",
    expiry: "",
    cvv: "",
    cardholder_name: ""
  });
  const [showAddCard, setShowAddCard] = useState(false);

  // Preferences state
  const [preferences, setPreferences] = useState({
    notification_preferences: [],
    language: "en",
    currency: "USD",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  // Booking system state
  const [bookings, setBookings] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [showBookingForm, setShowBookingForm] = useState(false);

  // Check token and redirect if not authenticated
  useEffect(() => {
    const token = Cookies.get('token');
    if (!authLoading && (!authUser || !token)) {
      router.push("/auth");
      return;
    }
  }, [authUser, authLoading, router]);

  // Helper function to handle API requests with token validation
  const makeAuthenticatedRequest = async (url, options = {}) => {
    const token = Cookies.get('token');
    
    if (!token) {
      router.push("/auth");
      return null;
    }

    const defaultOptions = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      // Handle unauthorized or forbidden responses
      if (response.status === 401 || response.status === 403) {
        Cookies.remove('token');
        router.push("/auth");
        return null;
      }

      return response;
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  };

  // Fetch user data on component mount
  useEffect(() => {
    if (authUser) {
      fetchUserData();
      fetchUserOrders();
      fetchMyBookings();
    }
  }, [authUser]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/auth/me`);
      
      if (!response) return; // Already handled redirect
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      setUserData(data);
      setAddresses(data.addresses || []);
      setSavedCards(data.saved_cards || []);
      setProfileForm({
        full_name: data.full_name || "",
        email: data.email || "",
        username: data.username || ""
      });
      
      // Set preferences
      setPreferences({
        notification_preferences: data.notification_preferences || [],
        language: data.language || "en",
        currency: data.currency || "USD",
        timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
      });
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError("Failed to load user data");
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrders = async () => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/orders/user/${authUser?.username}`);
      
      if (!response) return; // Already handled redirect
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.data || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  };

  // Booking system functions
  const fetchMyBookings = async () => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/bookings/my`);
      
      if (!response) return;
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data || []);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    }
  };

  const fetchAvailableSlots = async (date) => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/bookings/slots/available?date=${date}`);
      
      if (!response) return;
      
      if (!response.ok) {
        throw new Error('Failed to fetch available slots');
      }

      const data = await response.json();
      setAvailableSlots(data || []);
    } catch (err) {
      console.error("Failed to fetch available slots:", err);
      setError("Failed to fetch available slots");
    }
  };

  const createBooking = async (slotCode) => {
    try {
      setLoading(true);
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/bookings/${authUser.username}`, {
        method: 'POST',
        body: JSON.stringify({ slot_code: slotCode })
      });

      if (!response) return;

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create booking');
      }

      const newBooking = await response.json();
      setBookings([...bookings, newBooking]);
      setSuccess("Booking created successfully!");
      setShowBookingForm(false);
      setSelectedSlot("");
      fetchAvailableSlots(selectedDate); // Refresh available slots
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const closeOrderDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  };

  const updateUserProfile = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/users/${userData.username}`, {
        method: 'PUT',
        body: JSON.stringify(profileForm)
      });

      if (!response) return; // Already handled redirect

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const updatedUser = await response.json();
      setUserData(updatedUser);
      setEditingProfile(false);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Updated address functions for new API
  const addAddress = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/users/${userData.username}/addresses`, {
        method: 'POST',
        body: JSON.stringify(addressForm)
      });

      if (!response) return;

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add address');
      }

      const updatedAddresses = await response.json();
      setAddresses(updatedAddresses);
      setAddressForm({
        field: "",
        address1: "",
        address2: "",
        country: "",
        city: "",
        state: "",
        postal_code: ""
      });
      setShowAddAddress(false);
      setSuccess("Address added successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateAddress = async (index, updatedAddress) => {
    try {
      setLoading(true);
      
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/users/${userData.username}/addresses/${index}`, {
        method: 'PUT',
        body: JSON.stringify(updatedAddress)
      });

      if (!response) return;

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update address');
      }

      const updatedAddresses = await response.json();
      setAddresses(updatedAddresses);
      setEditingAddress(null);
      setSuccess("Address updated successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (index) => {
    try {
      setLoading(true);
      
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/users/${userData.username}/addresses/${index}`, {
        method: 'DELETE'
      });

      if (!response) return;

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete address');
      }

      const updatedAddresses = await response.json();
      setAddresses(updatedAddresses);
      setSuccess("Address deleted successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addCard = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/users/${userData.username}/payment-methods`, {
        method: 'POST',
        body: JSON.stringify(newCard)
      });

      if (!response) return;

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add card');
      }

      const updatedCards = await response.json();
      setSavedCards(updatedCards);
      setNewCard({
        card_number: "",
        expiry: "",
        cvv: "",
        cardholder_name: ""
      });
      setShowAddCard(false);
      setSuccess("Card added successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteCard = async (cardCode) => {
    try {
      setLoading(true);
      
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/users/${userData.username}/payment-methods/${cardCode}`, {
        method: 'DELETE'
      });

      if (!response) return;

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete card');
      }

      const updatedCards = await response.json();
      setSavedCards(updatedCards);
      setSuccess("Card deleted successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/users/${userData.username}`, {
        method: 'PUT',
        body: JSON.stringify(preferences)
      });

      if (!response) return; // Already handled redirect

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update preferences');
      }

      setSuccess("Preferences updated successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleNotificationPreference = (pref) => {
    const currentPrefs = [...preferences.notification_preferences];
    const index = currentPrefs.indexOf(pref);
    
    if (index > -1) {
      currentPrefs.splice(index, 1);
    } else {
      currentPrefs.push(pref);
    }
    
    setPreferences({
      ...preferences,
      notification_preferences: currentPrefs
    });
  };

  const generateInvoice = async (orderCode) => {
    try {
      setLoading(true);
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/orders/${orderCode}/generate_invoice`);
      
      if (!response) return; // Already handled redirect

      if (!response.ok) {
        throw new Error('Failed to generate invoice');
      }

      // Create a blob from the PDF response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `invoice-${orderCode}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      setSuccess("Invoice downloaded successfully!");
    } catch (err) {
      setError("Failed to download invoice");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (cardNumber) => {
    // Convert to string and add safety checks
    const cardNumberStr = String(cardNumber || '');
    
    // Ensure we have at least 4 digits to show
    if (cardNumberStr.length < 4) {
      return '**** **** **** ****'; // Return a default masked format if invalid
    }
    
    return `**** **** **** ${cardNumberStr.slice(-4)}`;
  };

  // Show loading state
  if (authLoading || (!userData && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!authUser || !userData) {
    const token = Cookies.get('token');
    if (!token) {
      router.push("/auth");
    }
    return null;
  }

  const tabItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "orders", label: "Order History", icon: ShoppingBag },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "cards", label: "Saved Cards", icon: CreditCard },
    { id: "bookings", label: "Appointments", icon: CalendarDays },
    { id: "preferences", label: "Preferences", icon: Settings },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered": return "bg-green-100 text-green-800";
      case "shipped": return "bg-blue-100 text-blue-800";
      case "processing": return "bg-yellow-100 text-yellow-800";
      case "paid": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "SCHEDULED": return "bg-blue-100 text-blue-800";
      case "CANCELLED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
      case "paid":
      case "SCHEDULED": return <CheckCircle className="w-4 h-4" />;
      case "shipped": return <Truck className="w-4 h-4" />;
      case "processing": return <Package className="w-4 h-4" />;
      case "cancelled":
      case "CANCELLED": return <XCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  // Check if order has Lalamove tracking
  const hasLalamoveTracking = (order) => {
    return order.lalamove_order_id && order.lalamove_share_url;
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                <p className="text-gray-600 mt-1">Manage your account and preferences</p>
              </div>
              <Button 
                onClick={logout} 
                variant="outline" 
                className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              >
                Logout
              </Button>
            </div>
          </div>

          {/* Alert Messages */}
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                      {userData.full_name ? userData.full_name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{userData.full_name || "User"}</h3>
                      <p className="text-sm text-gray-500">{userData.email}</p>
                      <p className="text-sm text-green-600 font-semibold">
                        Wallet: ${Number(userData.wallet_balance || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <nav className="space-y-2">
                    {tabItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id)}
                          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                            activeTab === item.id
                              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                {/* Profile Tab */}
                {activeTab === "profile" && (
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-6">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <User className="w-5 h-5 text-blue-600" />
                          <span>Personal Information</span>
                        </div>
                        <Button
                          onClick={() => setEditingProfile(!editingProfile)}
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          {editingProfile ? "Cancel" : "Edit"}
                        </Button>
                        
                      </CardTitle>
                      <CardDescription>
                        Update your personal details and contact information
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="full_name">Full Name</Label>
                          <Input 
                            id="full_name" 
                            value={profileForm.full_name}
                            onChange={(e) => setProfileForm({...profileForm, full_name: e.target.value})}
                            disabled={!editingProfile}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                            disabled={!editingProfile}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input 
                            id="username" 
                            value={profileForm.username}
                            disabled={true} // Username should not be editable
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="wallet">Wallet Balance</Label>
                          <Input 
                            id="wallet" 
                            value={`$${userData.wallet_balance || 0}`}
                            disabled={true}
                          />
                        </div>
                      </div>
                      {editingProfile && (
                        <>
                          <Separator />
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              onClick={() => setEditingProfile(false)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              onClick={updateUserProfile}
                              disabled={loading}
                              className="bg-gradient-to-r from-blue-500 to-purple-600"
                            >
                              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                              Save Changes
                            </Button>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Order History Tab */}
                {activeTab === "orders" && (
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <ShoppingBag className="w-5 h-5 text-blue-600" />
                        <span>Order History</span>
                      </CardTitle>
                      <CardDescription>
                        View your past orders and track current ones
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {orders.length > 0 ? orders.map((order) => (
                          <div key={order._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className="text-sm font-mono text-gray-500">#{order.order_code}</div>
                                <Badge className={`${getStatusColor(order.status)} flex items-center space-x-1`}>
                                  {getStatusIcon(order.status)}
                                  <span className="capitalize">{order.status}</span>
                                </Badge>
                              </div>
                              <div className="text-right flex items-center space-x-4">
                                <div>
                                  <div className="font-semibold">${order.total}</div>
                                  <div className="text-sm text-gray-500">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => generateInvoice(order.order_code)}
                                  disabled={loading}
                                >
                                  {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Download className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm text-gray-600">
                                <strong>Payment:</strong> {order.payment_method}
                              </div>
                              <div className="text-sm text-gray-600">
                                <strong>Items:</strong>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {order.items.map((item, index) => (
                                  <Badge key={index} variant="secondary">
                                    {item.product_id.product_name} x{item.quantity}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex justify-end space-x-2 mt-4">
                              {/* View Order Details Button */}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => viewOrderDetails(order)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View Details
                              </Button>
                              
                              {/* Live Tracking Button (only show if Lalamove tracking is available) */}
                              {hasLalamoveTracking(order) && (
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => window.open(order.lalamove_share_url, '_blank')}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <Navigation className="w-4 h-4 mr-1" />
                                  Live Tracking
                                </Button>
                              )}
                            </div>
                          </div>
                        )) : (
                          <div className="text-center py-8 text-gray-500">
                            No orders found
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Updated Addresses Tab */}
                {activeTab === "addresses" && (
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-5 h-5 text-blue-600" />
                          <span>Delivery Addresses</span>
                        </div>
                        <Button
                          onClick={() => setShowAddAddress(!showAddAddress)}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Address
                        </Button>
                      </CardTitle>
                      <CardDescription>
                        Manage your delivery addresses
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Add New Address Form */}
                      {showAddAddress && (
                        <div className="mb-6 p-4 border-2 border-dashed border-gray-200 rounded-lg">
                          <h3 className="font-medium mb-4">Add New Address</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="field">Address Label</Label>
                              <Input 
                                id="field" 
                                value={addressForm.field}
                                onChange={(e) => setAddressForm({...addressForm, field: e.target.value})}
                                placeholder="e.g., Home, Office"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="address1">Address Line 1</Label>
                              <Input 
                                id="address1" 
                                value={addressForm.address1}
                                onChange={(e) => setAddressForm({...addressForm, address1: e.target.value})}
                                placeholder="Street address"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="address2">Address Line 2 (Optional)</Label>
                              <Input 
                                id="address2" 
                                value={addressForm.address2}
                                onChange={(e) => setAddressForm({...addressForm, address2: e.target.value})}
                                placeholder="Apartment, suite, etc."
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="city">City</Label>
                              <Input 
                                id="city" 
                                value={addressForm.city}
                                onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                                placeholder="City"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="state">State/Province</Label>
                              <Input 
                                id="state" 
                                value={addressForm.state}
                                onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                                placeholder="State or Province"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="country">Country</Label>
                              <Input 
                                id="country" 
                                value={addressForm.country}
                                onChange={(e) => setAddressForm({...addressForm, country: e.target.value})}
                                placeholder="Country"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="postal_code">Postal Code</Label>
                              <Input 
                                id="postal_code" 
                                value={addressForm.postal_code}
                                onChange={(e) => setAddressForm({...addressForm, postal_code: e.target.value})}
                                placeholder="Postal code"
                              />
                            </div>
                          </div>
                          <div className="flex space-x-2 mt-4">
                            <Button 
                              onClick={addAddress}
                              disabled={loading || !addressForm.field || !addressForm.address1 || !addressForm.city || !addressForm.state || !addressForm.country || !addressForm.postal_code}
                              className="bg-gradient-to-r from-blue-500 to-purple-600"
                            >
                              {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                "Save Address"
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setShowAddAddress(false)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        {addresses.length > 0 ? addresses.map((address, index) => (
                          <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                {editingAddress === index ? (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label>Address Label</Label>
                                        <Input
                                          value={address.field || ""}
                                          onChange={(e) => {
                                            const newAddresses = [...addresses];
                                            newAddresses[index] = {...newAddresses[index], field: e.target.value};
                                            setAddresses(newAddresses);
                                          }}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Address Line 1</Label>
                                        <Input
                                          value={address.address1 || ""}
                                          onChange={(e) => {
                                            const newAddresses = [...addresses];
                                            newAddresses[index] = {...newAddresses[index], address1: e.target.value};
                                            setAddresses(newAddresses);
                                          }}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Address Line 2</Label>
                                        <Input
                                          value={address.address2 || ""}
                                          onChange={(e) => {
                                            const newAddresses = [...addresses];
                                            newAddresses[index] = {...newAddresses[index], address2: e.target.value};
                                            setAddresses(newAddresses);
                                          }}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>City</Label>
                                        <Input
                                          value={address.city || ""}
                                          onChange={(e) => {
                                            const newAddresses = [...addresses];
                                            newAddresses[index] = {...newAddresses[index], city: e.target.value};
                                            setAddresses(newAddresses);
                                          }}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>State</Label>
                                        <Input
                                          value={address.state || ""}
                                          onChange={(e) => {
                                            const newAddresses = [...addresses];
                                            newAddresses[index] = {...newAddresses[index], state: e.target.value};
                                            setAddresses(newAddresses);
                                          }}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Country</Label>
                                        <Input
                                          value={address.country || ""}
                                          onChange={(e) => {
                                            const newAddresses = [...addresses];
                                            newAddresses[index] = {...newAddresses[index], country: e.target.value};
                                            setAddresses(newAddresses);
                                          }}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Postal Code</Label>
                                        <Input
                                          value={address.postal_code || ""}
                                          onChange={(e) => {
                                            const newAddresses = [...addresses];
                                            newAddresses[index] = {...newAddresses[index], postal_code: e.target.value};
                                            setAddresses(newAddresses);
                                          }}
                                        />
                                      </div>
                                    </div>
                                    <div className="flex space-x-2">
                                      <Button
                                        size="sm"
                                        onClick={() => updateAddress(index, addresses[index])}
                                        disabled={loading}
                                      >
                                        {loading ? (
                                          <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                          "Save"
                                        )}
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setEditingAddress(null)}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <div className="font-medium text-blue-600 mb-1">{address.field}</div>
                                    <div className="text-sm text-gray-600">
                                      {address.full_address || `${address.address1}, ${address.address2 ? address.address2 + ', ' : ''}${address.city}, ${address.state}, ${address.country} - ${address.postal_code}`}
                                    </div>
                                  </div>
                                )}
                              </div>
                              {editingAddress !== index && (
                                <div className="flex space-x-2 ml-4">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => setEditingAddress(index)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-red-600 hover:bg-red-50"
                                    onClick={() => deleteAddress(index)}
                                    disabled={loading}
                                  >
                                    {loading ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-4 h-4" />
                                    )}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        )) : (
                          <div className="text-center py-8 text-gray-500">
                            No addresses added yet
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Saved Cards Tab */}
                {activeTab === "cards" && (
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CreditCard className="w-5 h-5 text-blue-600" />
                          <span>Saved Payment Methods</span>
                        </div>
                        <Button
                          onClick={() => setShowAddCard(!showAddCard)}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Card
                        </Button>
                      </CardTitle>
                      <CardDescription>
                        Manage your saved payment methods for faster checkout
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Add New Card Form */}
                      {showAddCard && (
                        <div className="mb-6 p-4 border-2 border-dashed border-gray-200 rounded-lg">
                          <h3 className="font-medium mb-4">Add New Card</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="cardholder_name">Cardholder Name</Label>
                              <Input 
                                id="cardholder_name" 
                                value={newCard.cardholder_name}
                                onChange={(e) => setNewCard({...newCard, cardholder_name: e.target.value})}
                                placeholder="John Doe"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="card_number">Card Number</Label>
                              <Input 
                                id="card_number" 
                                value={newCard.card_number}
                                onChange={(e) => setNewCard({...newCard, card_number: e.target.value})}
                                placeholder="1234 5678 9012 3456"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="expiry">Expiry Date</Label>
                              <Input 
                                id="expiry" 
                                value={newCard.expiry}
                                onChange={(e) => setNewCard({...newCard, expiry: e.target.value})}
                                placeholder="MM/YY"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="cvv">CVV</Label>
                              <Input 
                                id="cvv" 
                                value={newCard.cvv}
                                onChange={(e) => setNewCard({...newCard, cvv: e.target.value})}
                                placeholder="123"
                                type="password"
                              />
                            </div>
                          </div>
                          <div className="flex space-x-2 mt-4">
                            <Button 
                              onClick={addCard}
                              disabled={loading || !newCard.card_number || !newCard.expiry || !newCard.cvv}
                              className="bg-gradient-to-r from-blue-500 to-purple-600"
                            >
                              {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                "Save Card"
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setShowAddCard(false)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        {savedCards.length > 0 ? savedCards.map((card, index) => (
                          <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <CreditCardIcon className="w-6 h-6 text-blue-600" />
                                  <div>
                                    <div className="font-medium">{formatCardNumber(card.card_number)}</div>
                                    <div className="text-sm text-gray-500">
                                      Expires: {card.expiry} {card.cardholder_name && `• ${card.cardholder_name}`}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-red-600 hover:bg-red-50"
                                onClick={() => deleteCard(card.card_code)}
                                disabled={loading}
                              >
                                {loading ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        )) : (
                          <div className="text-center py-8 text-gray-500">
                            No saved cards yet
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Bookings/Appointments Tab */}
                {activeTab === "bookings" && (
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CalendarDays className="w-5 h-5 text-blue-600" />
                          <span>My Appointments</span>
                        </div>
                        <Button
                          onClick={() => setShowBookingForm(!showBookingForm)}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Book Appointment
                        </Button>
                      </CardTitle>
                      <CardDescription>
                        Manage your appointments and bookings
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Book New Appointment Form */}
                      {showBookingForm && (
                        <div className="mb-6 p-4 border-2 border-dashed border-gray-200 rounded-lg">
                          <h3 className="font-medium mb-4">Book New Appointment</h3>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="appointment_date">Select Date</Label>
                              <Input 
                                id="appointment_date" 
                                type="date"
                                value={selectedDate}
                                onChange={(e) => {
                                  setSelectedDate(e.target.value);
                                  if (e.target.value) {
                                    fetchAvailableSlots(e.target.value);
                                  }
                                }}
                                min={new Date().toISOString().split('T')[0]}
                              />
                            </div>
                            {availableSlots.length > 0 && (
                              <div className="space-y-2">
                                <Label>Available Time Slots</Label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                  {availableSlots.map((slot) => (
                                    <Button
                                      key={slot.slot_code}
                                      variant={selectedSlot === slot.slot_code ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => setSelectedSlot(slot.slot_code)}
                                      className="flex flex-col items-center p-3 h-auto"
                                    >
                                      <span className="font-medium">{slot.slot_name}</span>
                                      <span className="text-xs">{slot.start_time} - {slot.end_time}</span>
                                      <span className="text-xs text-gray-500">
                                        {slot.max_bookings - slot.current_bookings} slots left
                                      </span>
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            )}
                            {selectedDate && availableSlots.length === 0 && (
                              <div className="text-center py-4 text-gray-500">
                                No available slots for selected date
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2 mt-4">
                            <Button 
                              onClick={() => createBooking(selectedSlot)}
                              disabled={loading || !selectedSlot}
                              className="bg-gradient-to-r from-blue-500 to-purple-600"
                            >
                              {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                "Book Appointment"
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setShowBookingForm(false);
                                setSelectedDate("");
                                setSelectedSlot("");
                                setAvailableSlots([]);
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        {bookings.length > 0 ? bookings.map((booking) => (
                          <div key={booking.appointment_code} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className="text-sm font-mono text-gray-500">#{booking.appointment_code}</div>
                                <Badge className={`${getStatusColor(booking.status)} flex items-center space-x-1`}>
                                  {getStatusIcon(booking.status)}
                                  <span>{booking.status}</span>
                                </Badge>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium">
                                  {booking.date && new Date(booking.date).toLocaleDateString()}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {booking.start_time} - {booking.end_time}
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm text-gray-600">
                                <strong>Slot:</strong> {booking.slot_code}
                              </div>
                              {booking.runtime && (
                                <div className="text-sm text-gray-600">
                                  <strong>Duration:</strong> {booking.runtime} minutes
                                </div>
                              )}
                              {booking.cancellation_reason && (
                                <div className="text-sm text-red-600">
                                  <strong>Cancellation Reason:</strong> {booking.cancellation_reason}
                                </div>
                              )}
                              {booking.reschedule_slot_code && (
                                <div className="text-sm text-blue-600">
                                  <strong>Rescheduled to:</strong> {booking.reschedule_slot_code}
                                </div>
                              )}
                            </div>
                          </div>
                        )) : (
                          <div className="text-center py-8 text-gray-500">
                            No appointments found
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Preferences Tab */}
                {activeTab === "preferences" && (
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Settings className="w-5 h-5 text-blue-600" />
                        <span>Account Preferences</span>
                      </CardTitle>
                      <CardDescription>
                        Customize your account settings and preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="font-medium flex items-center space-x-2">
                          <Bell className="w-5 h-5 text-blue-600" />
                          <span>Notification Preferences</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {["EMAIL", "PUSH_NOTIFICATIONS", "IN_APP_NOTIFICATIONS"].map((pref) => (
                            <div key={pref} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={pref}
                                checked={preferences.notification_preferences.includes(pref)}
                                onChange={() => toggleNotificationPreference(pref)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <Label htmlFor={pref} className="cursor-pointer">
                                {pref === "EMAIL" && "Email Notifications"}
                                {pref === "PUSH_NOTIFICATIONS" && "Push Notifications"}
                                {pref === "IN_APP_NOTIFICATIONS" && "In-App Notifications"}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="font-medium flex items-center space-x-2">
                          <Globe className="w-5 h-5 text-blue-600" />
                          <span>Language & Region</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="language">Language</Label>
                            <select
                              id="language"
                              value={preferences.language}
                              onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="en">English</option>
                              <option value="es">Spanish</option>
                              <option value="fr">French</option>
                              <option value="de">German</option>
                              <option value="zh">Chinese</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="currency">Currency</Label>
                            <select
                              id="currency"
                              value={preferences.currency}
                              onChange={(e) => setPreferences({...preferences, currency: e.target.value})}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="USD">USD ($)</option>
                              <option value="EUR">EUR (€)</option>
                              <option value="GBP">GBP (£)</option>
                              <option value="JPY">JPY (¥)</option>
                              <option value="CAD">CAD (C$)</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="timezone">Timezone</Label>
                            <select
                              id="timezone"
                              value={preferences.timezone}
                              onChange={(e) => setPreferences({...preferences, timezone: e.target.value})}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="America/New_York">Eastern Time (ET)</option>
                              <option value="America/Chicago">Central Time (CT)</option>
                              <option value="America/Denver">Mountain Time (MT)</option>
                              <option value="America/Los_Angeles">Pacific Time (PT)</option>
                              <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                              <option value="Europe/Paris">Central European Time (CET)</option>
                              <option value="Asia/Tokyo">Japan Standard Time (JST)</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <Separator />
                      
                      <div className="flex justify-end">
                        <Button 
                          onClick={updatePreferences}
                          disabled={loading}
                          className="bg-gradient-to-r from-blue-500 to-purple-600"
                        >
                          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          Save Preferences
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Order Details</h2>
                <Button variant="ghost" onClick={closeOrderDetails}>
                  <XCircle className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-700">Order Code</h3>
                    <p className="text-gray-600">#{selectedOrder.order_code}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Status</h3>
                    <Badge className={`${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Total Amount</h3>
                    <p className="text-gray-600">${selectedOrder.total}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Payment Method</h3>
                    <p className="text-gray-600">{selectedOrder.payment_method}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Order Date</h3>
                    <p className="text-gray-600">
                      {new Date(selectedOrder.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Delivery Type</h3>
                    <p className="text-gray-600">{selectedOrder.delivery_type}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Shipping Address</h3>
                  <p className="text-gray-600">{selectedOrder.shipping_address}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Billing Address</h3>
                  <p className="text-gray-600">{selectedOrder.billing_address}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Items</h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 p-2 border rounded">
                        <img 
                          src={item.product_image} 
                          alt={item.product_id.product_name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{item.product_id.product_name}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          <p className="text-sm text-gray-600">Price: ${item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedOrder.special_instructions && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Special Instructions</h3>
                    <p className="text-gray-600">{selectedOrder.special_instructions}</p>
                  </div>
                )}

                {/* Lalamove Tracking Info */}
                {hasLalamoveTracking(selectedOrder) && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">Delivery Tracking</h3>
                    <p className="text-blue-700 mb-2">
                      Your order is being delivered via Lalamove. Track your delivery in real-time.
                    </p>
                    <Button
                      onClick={() => window.open(selectedOrder.lalamove_share_url, '_blank')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Track Delivery
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}