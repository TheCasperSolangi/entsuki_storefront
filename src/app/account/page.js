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

const API_BASE_URL = `http://localhost:5000`;

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
    phone: "",
    gender: "",
    birthday: ""
  });

  // Address form state (updated for new API structure)
  const [addressForm, setAddressForm] = useState({
    field: "",
    address1: "",
    address2: "",
    country: "",
    city: "",
    state: "",
    postal_code: "",
    phone: "",
    gender: "",
    birthday: ""

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
        username: data.username || "",
        gender: data.gender || "",
        birthday: data.birthday || "",
        phone: data.phone || ""
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
  { id: "profile", label: "個人資料", icon: User },
  { id: "orders", label: "訂單紀錄", icon: ShoppingBag },
  { id: "addresses", label: "地址", icon: MapPin },
  { id: "cards", label: "已儲存的卡片", icon: CreditCard },
  { id: "bookings", label: "預約", icon: CalendarDays },
  { id: "preferences", label: "偏好設定", icon: Settings },
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
                <h1 className="text-3xl font-bold text-gray-900">我的個人資料</h1>
                <p className="text-gray-600 mt-1">管理您的帳戶與偏好設定</p>
              </div>
              <Button 
                onClick={logout} 
                variant="outline" 
                className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              >
                登出
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
                    <div className="w-12 h-12 rounded-full bg-[#b8935f] flex items-center justify-center text-white font-semibold text-lg">
                      {userData.full_name ? userData.full_name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{userData.full_name || "User"}</h3>
                      <p className="text-sm text-gray-500">{userData.email}</p>
                      <p className="text-sm text-green-600 font-semibold">
                        錢包: ${Number(userData.wallet_balance || 0).toFixed(2)}
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
                              ? "bg-[#b8935f] text-white shadow-lg"
                              : "text-gray-600 hover:bg-[#f0e6d9] hover:text-[#b8935f]"
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
{/* 個人資料頁籤 */}
{activeTab === "profile" && (
  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
    <CardHeader className="pb-6">
      <CardTitle className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <User className="w-5 h-5 text-blue-600" />
          <span>個人資訊</span>
        </div>
        <Button
          onClick={() => setEditingProfile(!editingProfile)}
          variant="outline"
          size="sm"
        >
          <Edit className="w-4 h-4 mr-2" />
          {editingProfile ? "取消" : "編輯"}
        </Button>
      </CardTitle>
      <CardDescription>
        更新您的個人詳細資料和聯絡資訊
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">全名</Label>
          <Input 
            id="full_name" 
            value={profileForm.full_name || ""}
            onChange={(e) => setProfileForm({...profileForm, full_name: e.target.value})}
            disabled={!editingProfile}
            className={!editingProfile ? "bg-gray-50" : ""}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">電子郵件</Label>
          <Input 
            id="email" 
            type="email" 
            value={profileForm.email || ""}
            onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
            disabled={true}
            className="bg-gray-50"
          />
        </div>
       
        <div className="space-y-2">
          <Label htmlFor="wallet">錢包餘額</Label>
          <Input 
            id="wallet" 
            value={`$${userData.wallet_balance || 0}`}
            disabled={true}
            className="bg-gray-50"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="birthday">生日</Label>
          <Input 
            id="birthday" 
            type="date"
            value={profileForm.birthday || ""}
            onChange={(e) => setProfileForm({...profileForm, birthday: e.target.value})}
            disabled={!editingProfile}
            className={!editingProfile ? "bg-gray-50" : ""}
            placeholder="年-月-日"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="gender">性別</Label>
          {editingProfile ? (
            <select
              id="gender"
              value={profileForm.gender || ""}
              onChange={(e) => setProfileForm({...profileForm, gender: e.target.value})}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">選擇性別</option>
              <option value="male">男性</option>
              <option value="female">女性</option>
              <option value="other">其他</option>
              <option value="prefer_not_to_say">不願透露</option>
            </select>
          ) : (
            <Input 
              id="gender" 
              value={profileForm.gender || ""}
              disabled={true}
              className="bg-gray-50"
            />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">電話</Label>
          <div className="flex">
            <span className={`flex items-center px-3 border border-r-0 border-gray-300 rounded-l-md text-gray-700 text-sm ${!editingProfile ? 'bg-gray-50' : 'bg-gray-100'}`}>
              +852
            </span>
            <Input
              id="phone"
              type="tel"
              className={`rounded-l-none ${!editingProfile ? "bg-gray-50" : ""}`}
              value={profileForm.phone || ""}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              placeholder="請輸入電話號碼"
              disabled={!editingProfile}
            />
          </div>
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
              取消
            </Button>
            <Button 
              onClick={updateUserProfile}
              disabled={loading}
              className="bg-[#b8935f]"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              儲存變更
            </Button>
          </div>
        </>
      )}
    </CardContent>
  </Card>
)}

{/* 訂單記錄頁籤 */}
                {activeTab === "orders" && (
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <ShoppingBag className="w-5 h-5 text-blue-600" />
                        <span>訂單記錄</span>
                      </CardTitle>
                      <CardDescription>
                        查看您的過往訂單並追蹤目前訂單
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
                                <strong>付款方式：</strong> {order.payment_method}
                              </div>
                              <div className="text-sm text-gray-600">
                                <strong>訂購項目：</strong>
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
                              {/* 查看訂單詳情按鈕 */}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => viewOrderDetails(order)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                查看詳情
                              </Button>
                              
                              {/* 即時追蹤按鈕（僅在有 Lalamove 追蹤時顯示）*/}
                              {hasLalamoveTracking(order) && (
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => window.open(order.lalamove_share_url, '_blank')}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <Navigation className="w-4 h-4 mr-1" />
                                  即時追蹤
                                </Button>
                              )}
                            </div>
                          </div>
                        )) : (
                          <div className="text-center py-8 text-gray-500">
                            找不到訂單
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
{/* Updated Addresses Tab - Hong Kong Only - Traditional Chinese */}
                {activeTab === "addresses" && (
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-5 h-5 text-blue-600" />
                          <span>送貨地址（香港）</span>
                        </div>
                        <Button
                          onClick={() => setShowAddAddress(!showAddAddress)}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          新增地址
                        </Button>
                      </CardTitle>
                      <CardDescription>
                        管理您的香港送貨地址
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Add New Address Form */}
                      {showAddAddress && (
                        <div className="mb-6 p-4 border-2 border-dashed border-gray-200 rounded-lg">
                          <h3 className="font-medium mb-4">新增地址</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="field">地址標籤</Label>
                              <select 
                                id="field" 
                                value={addressForm.field}
                                onChange={(e) => setAddressForm({...addressForm, field: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="">選擇地址類型</option>
                                <option value="住宅">住宅</option>
                                <option value="辦公室">辦公室</option>
                                <option value="工作地點">工作地點</option>
                                <option value="其他">其他</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="district">地區</Label>
                              <select 
                                id="district" 
                                value={addressForm.district}
                                onChange={(e) => setAddressForm({...addressForm, district: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="">選擇地區</option>
                                {/* Hong Kong Island */}
                                <optgroup label="香港島">
                                  <option value="中西區">中西區</option>
                                  <option value="東區">東區</option>
                                  <option value="南區">南區</option>
                                  <option value="灣仔區">灣仔區</option>
                                </optgroup>
                                {/* Kowloon */}
                                <optgroup label="九龍">
                                  <option value="九龍城區">九龍城區</option>
                                  <option value="觀塘區">觀塘區</option>
                                  <option value="深水埗區">深水埗區</option>
                                  <option value="黃大仙區">黃大仙區</option>
                                  <option value="油尖旺區">油尖旺區</option>
                                </optgroup>
                                {/* New Territories */}
                                <optgroup label="新界">
                                  <option value="離島區">離島區</option>
                                  <option value="葵青區">葵青區</option>
                                  <option value="北區">北區</option>
                                  <option value="西貢區">西貢區</option>
                                  <option value="沙田區">沙田區</option>
                                  <option value="大埔區">大埔區</option>
                                  <option value="荃灣區">荃灣區</option>
                                  <option value="屯門區">屯門區</option>
                                  <option value="元朗區">元朗區</option>
                                </optgroup>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="address1">街道地址</Label>
                              <Input 
                                id="address1" 
                                value={addressForm.address1}
                                onChange={(e) => setAddressForm({...addressForm, address1: e.target.value})}
                                placeholder="大廈名稱及街道地址"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="address2">單位/樓層（選填）</Label>
                              <Input 
                                id="address2" 
                                value={addressForm.address2}
                                onChange={(e) => setAddressForm({...addressForm, address2: e.target.value})}
                                placeholder="單位號碼、樓層等"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="area">地方/區域</Label>
                              <Input 
                                id="area" 
                                value={addressForm.area}
                                onChange={(e) => setAddressForm({...addressForm, area: e.target.value})}
                                placeholder="地方或區域名稱"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="region">區域</Label>
                              <select 
                                id="region" 
                                value={addressForm.region || "香港島"}
                                onChange={(e) => setAddressForm({...addressForm, region: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="香港島">香港島</option>
                                <option value="九龍">九龍</option>
                                <option value="新界">新界</option>
                              </select>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="country">國家/地區</Label>
                              <Input 
                                id="country" 
                                value="香港特別行政區"
                                disabled
                                className="bg-gray-50 text-gray-600"
                              />
                            </div>
                          </div>
                          <div className="flex space-x-2 mt-4">
                            <Button 
                              onClick={addAddress}
                              disabled={loading || !addressForm.field || !addressForm.district || !addressForm.address1 || !addressForm.area}
                              className="bg-[#b8935f]"
                            >
                              {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                "儲存地址"
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setShowAddAddress(false)}
                            >
                              取消
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
                                        <Label>地址標籤</Label>
                                        <select
                                          value={address.field || ""}
                                          onChange={(e) => {
                                            const newAddresses = [...addresses];
                                            newAddresses[index] = {...newAddresses[index], field: e.target.value};
                                            setAddresses(newAddresses);
                                          }}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                          <option value="">選擇地址類型</option>
                                          <option value="住宅">住宅</option>
                                          <option value="辦公室">辦公室</option>
                                          <option value="工作地點">工作地點</option>
                                          <option value="其他">其他</option>
                                        </select>
                                      </div>
                                      <div className="space-y-2">
                                        <Label>地區</Label>
                                        <select
                                          value={address.district || ""}
                                          onChange={(e) => {
                                            const newAddresses = [...addresses];
                                            newAddresses[index] = {...newAddresses[index], district: e.target.value};
                                            setAddresses(newAddresses);
                                          }}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                          <option value="">選擇地區</option>
                                          {/* Hong Kong Island */}
                                          <optgroup label="香港島">
                                            <option value="中西區">中西區</option>
                                            <option value="東區">東區</option>
                                            <option value="南區">南區</option>
                                            <option value="灣仔區">灣仔區</option>
                                          </optgroup>
                                          {/* Kowloon */}
                                          <optgroup label="九龍">
                                            <option value="九龍城區">九龍城區</option>
                                            <option value="觀塘區">觀塘區</option>
                                            <option value="深水埗區">深水埗區</option>
                                            <option value="黃大仙區">黃大仙區</option>
                                            <option value="油尖旺區">油尖旺區</option>
                                          </optgroup>
                                          {/* New Territories */}
                                          <optgroup label="新界">
                                            <option value="離島區">離島區</option>
                                            <option value="葵青區">葵青區</option>
                                            <option value="北區">北區</option>
                                            <option value="西貢區">西貢區</option>
                                            <option value="沙田區">沙田區</option>
                                            <option value="大埔區">大埔區</option>
                                            <option value="荃灣區">荃灣區</option>
                                            <option value="屯門區">屯門區</option>
                                            <option value="元朗區">元朗區</option>
                                          </optgroup>
                                        </select>
                                      </div>
                                      <div className="space-y-2">
                                        <Label>街道地址</Label>
                                        <Input
                                          value={address.address1 || ""}
                                          onChange={(e) => {
                                            const newAddresses = [...addresses];
                                            newAddresses[index] = {...newAddresses[index], address1: e.target.value};
                                            setAddresses(newAddresses);
                                          }}
                                          placeholder="大廈名稱及街道地址"
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>單位/樓層</Label>
                                        <Input
                                          value={address.address2 || ""}
                                          onChange={(e) => {
                                            const newAddresses = [...addresses];
                                            newAddresses[index] = {...newAddresses[index], address2: e.target.value};
                                            setAddresses(newAddresses);
                                          }}
                                          placeholder="單位號碼、樓層等"
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>地方/區域</Label>
                                        <Input
                                          value={address.area || ""}
                                          onChange={(e) => {
                                            const newAddresses = [...addresses];
                                            newAddresses[index] = {...newAddresses[index], area: e.target.value};
                                            setAddresses(newAddresses);
                                          }}
                                          placeholder="地方或區域名稱"
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>區域</Label>
                                        <select
                                          value={address.region || "香港島"}
                                          onChange={(e) => {
                                            const newAddresses = [...addresses];
                                            newAddresses[index] = {...newAddresses[index], region: e.target.value};
                                            setAddresses(newAddresses);
                                          }}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                          <option value="香港島">香港島</option>
                                          <option value="九龍">九龍</option>
                                          <option value="新界">新界</option>
                                        </select>
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
                                          "儲存"
                                        )}
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setEditingAddress(null)}
                                      >
                                        取消
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <div className="font-medium text-blue-600 mb-1 flex items-center">
                                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs mr-2">
                                        {address.field}
                                      </span>
                                      <span className="text-sm text-gray-500">{address.district}</span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      <div>{address.address1}</div>
                                      {address.address2 && <div>{address.address2}</div>}
                                      <div>{address.area}, {address.district}</div>
                                      <div>{address.region || '香港島'}, 香港特別行政區</div>
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
                                    title="編輯"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-red-600 hover:bg-red-50"
                                    onClick={() => deleteAddress(index)}
                                    disabled={loading}
                                    title="刪除"
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
                            <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>尚未新增香港地址</p>
                            <p className="text-xs mt-1">新增您的第一個送貨地址以開始使用</p>
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
                          <span>已儲存的付款方式</span>
                        </div>
                        <Button
                          onClick={() => setShowAddCard(!showAddCard)}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          新增卡片
                        </Button>
                      </CardTitle>
                      <CardDescription>
                        管理您已儲存的付款方式，以加快結帳流程
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Add New Card Form */}
                      {showAddCard && (
                        <div className="mb-6 p-4 border-2 border-dashed border-gray-200 rounded-lg">
                          <h3 className="font-medium mb-4">新增卡片</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="cardholder_name">持卡人姓名</Label>
                              <Input 
                                id="cardholder_name" 
                                value={newCard.cardholder_name}
                                onChange={(e) => setNewCard({...newCard, cardholder_name: e.target.value})}
                                placeholder="約翰‧杜"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="card_number">卡號</Label>
                              <Input 
                                id="card_number" 
                                value={newCard.card_number}
                                onChange={(e) => setNewCard({...newCard, card_number: e.target.value})}
                                placeholder="1234 5678 9012 3456"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="expiry">到期日</Label>
                              <Input 
                                id="expiry" 
                                value={newCard.expiry}
                                onChange={(e) => setNewCard({...newCard, expiry: e.target.value})}
                                placeholder="月/年 (MM/YY)"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="cvv">安全碼</Label>
                              <Input 
                                id="cvv" 
                                value={newCard.cvv}
                                onChange={(e) => setNewCard({...newCard, cvv: e.target.value})}
                                placeholder="安全碼 (CVV) 123"
                                type="password"
                              />
                            </div>
                          </div>
                          <div className="flex space-x-2 mt-4">
                            <Button 
                              onClick={addCard}
                              disabled={loading || !newCard.card_number || !newCard.expiry || !newCard.cvv}
                              className="bg-[#b8935f]"
                            >
                              {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                "儲存卡片"
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setShowAddCard(false)}
                            >
                              取消
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
                                      到期: {card.expiry} {card.cardholder_name && `• ${card.cardholder_name}`}
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
                            尚未儲存任何卡片
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
                          <span>我的預約</span>
                        </div>
                        <Button
                          onClick={() => setShowBookingForm(!showBookingForm)}
                          variant="outline"
                          size="sm"

                        >
                          <Plus className="w-4 h-4 mr-2" />
                          預約
                        </Button>
                      </CardTitle>
                      <CardDescription>
                        管理您的預約和訂單
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Book New Appointment Form */}
                      {showBookingForm && (
                        <div className="mb-6 p-4 border-2 border-dashed border-gray-200 rounded-lg">
                          <h3 className="font-medium mb-4">預約新行程</h3>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="appointment_date">選擇日期</Label>
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
                                <Label>可用時段</Label>
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
                                        {slot.max_bookings - slot.current_bookings} 剩餘名額
                                      </span>
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            )}
                            {selectedDate && availableSlots.length === 0 && (
                              <div className="text-center py-4 text-gray-500">
                                所選日期無可用時段
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2 mt-4">
                            <Button 
                              onClick={() => createBooking(selectedSlot)}
                              disabled={loading || !selectedSlot}
                              className="bg-[#b8935f]"
                            >
                              {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                "預約"
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
                              取消
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
                                <strong>時段:</strong> {booking.slot_code}
                              </div>
                              {booking.runtime && (
                                <div className="text-sm text-gray-600">
                                  <strong>時長:</strong> {booking.runtime} minutes
                                </div>
                              )}
                              {booking.cancellation_reason && (
                                <div className="text-sm text-red-600">
                                  <strong>取消原因:</strong> {booking.cancellation_reason}
                                </div>
                              )}
                              {booking.reschedule_slot_code && (
                                <div className="text-sm text-blue-600">
                                  <strong>改期至:</strong> {booking.reschedule_slot_code}
                                </div>
                              )}
                            </div>
                          </div>
                        )) : (
                          <div className="text-center py-8 text-gray-500">
                            未找到任何預約
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
                        <span>帳戶偏好設定</span>
                      </CardTitle>
                      <CardDescription>
                        自訂您的帳戶設定與偏好
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="font-medium flex items-center space-x-2">
                          <Bell className="w-5 h-5 text-blue-600" />
                          <span>通知偏好設定</span>
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
                          <span>語言與地區</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="language">語言</Label>
                            <select
                              id="language"
                              value={preferences.language}
                              onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="en">繁體中文</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="currency">貨幣</Label>
                            <select
                              id="currency"
                              value={preferences.currency}
                              onChange={(e) => setPreferences({...preferences, currency: e.target.value})}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="USD">港幣 (HKD)</option>

                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="timezone">時區</Label>
                            <select
                              id="timezone"
                              value={preferences.timezone}
                              onChange={(e) => setPreferences({...preferences, timezone: e.target.value})}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="America/New_York">香港時間 (HKT)</option>

                            </select>
                          </div>
                        </div>
                      </div>

                      <Separator />
                      
                      <div className="flex justify-end">
                        <Button 
                          onClick={updatePreferences}
                          disabled={loading}
                          className="bg-[#b8935f]"
                        >
                          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          儲存偏好設定
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