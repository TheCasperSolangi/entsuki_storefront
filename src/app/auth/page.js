"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShoppingBag, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useAuth } from "../../context/authContext";
import { GoogleLogin } from "@react-oauth/google";
import ReactFacebookLogin from "react-facebook-login";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AuthPage() {
   const router = useRouter();
  const { loginSuccess } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [signupStep, setSignupStep] = useState(1);

  // Login fields
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");

  // SignUp fields
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [userType, setUserType] = useState("user");

  // Extra login info
  const [deviceInfo, setDeviceInfo] = useState({
    device_type: "DESKTOP",
    device_name: "",
    device_id: "",
    brand: "",
    model: "",
    cart_code: "",
    session_id: "",
    onesignal_id: "",
  
  });

  // Collect device + browser info on mount
  useEffect(() => {
    const userAgent = navigator.userAgent;
    const brand = /Chrome/.test(userAgent)
      ? "Chrome"
      : /Firefox/.test(userAgent)
      ? "Firefox"
      : /Safari/.test(userAgent)
      ? "Safari"
      : "Unknown";
    const model = navigator.platform || "Unknown";

    setDeviceInfo((prev) => ({
      ...prev,
      device_name: navigator.userAgent,
      device_id: crypto.randomUUID(),
      brand,
      model,
      cart_code: Cookies.get("cart_code") || "",
      session_id: Cookies.get("session_id") || crypto.randomUUID(),
      onesignal_id: localStorage.getItem("onesignal_id") || "",
    }));

   // Fetch IP address using multiple fallback methods
    const fetchIP = async () => {
      try {
        // Try first method
        const response = await fetch("https://api.ipify.org?format=json");
        if (response.ok) {
          const data = await response.json();
          setDeviceInfo((prev) => ({ ...prev, ip_address: data.ip }));
          console.log(`${ip_address}`);
          return;
        }
        
        // Try second method if first fails
        const response2 = await fetch("https://ipapi.co/json/");
        if (response2.ok) {
          const data = await response2.json();
          setDeviceInfo((prev) => ({ ...prev, ip_address: data.ip }));
             console.log(`${ip_address}`);
          return;
        }
        
        // Try third method if others fail
        const response3 = await fetch("https://api64.ipify.org?format=json");
        if (response3.ok) {
          const data = await response3.json();
          setDeviceInfo((prev) => ({ ...prev, ip_address: data.ip }));
             console.log(`${ip_address}`);
          return;
        }
        
        // If all methods fail, set a fallback value
        setDeviceInfo((prev) => ({ ...prev, ip_address: "192.168.1.13" }));
      } catch (error) {
        console.error("Failed to fetch IP address:", error);
        setDeviceInfo((prev) => ({ ...prev, ip_address: "192.168.1.13" }));
      }
    };

    fetchIP();
  }, []);
 const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ type: "", message: "" });

    try {
      const bodyData = {
        emailOrUsername,
        password,
        ...deviceInfo,
       
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyData),
        }
      );

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        Cookies.set("token", data.token, { expires: 1 });
        Cookies.set("cart_code", data.cart?.cart_code || "", { expires: 1 });
        router.push("/");
        loginSuccess(data.token);
      } else {
        setAlert({ type: "error", message: data.message || "Invalid credentials" });
      }
    } catch (err) {
      setLoading(false);
      setAlert({ type: "error", message: "Something went wrong!" });
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ type: "", message: "" });

    const fullAddress = [
      addressLine1,
      addressLine2,
      city,
      state,
      zipCode,
      country,
    ]
      .filter(Boolean)
      .join(", ");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            full_name: fullName,
            addresses: [fullAddress],
            user_type: userType,
          }),
        }
      );

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        Cookies.set("token", data.token, { expires: 1 });
        router.push("/");
      } else {
        setAlert({ type: "error", message: data.message || "Sign up failed" });
      }
    } catch (err) {
      setLoading(false);
      setAlert({ type: "error", message: "Something went wrong!" });
    }
  };

  const nextStep = () => {
    if (signupStep < 4) {
      setSignupStep(signupStep + 1);
      setAlert({ type: "", message: "" });
    }
  };

  const prevStep = () => {
    if (signupStep > 1) {
      setSignupStep(signupStep - 1);
      setAlert({ type: "", message: "" });
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return email && email.includes("@") && fullName.trim().length >= 2;
      case 2:
        return password.length >= 6 && confirmPassword === password;
      case 3:
        return addressLine1.trim().length > 0 && city.trim().length > 0 && 
               state.trim().length > 0 && country.trim().length > 0 && 
               zipCode.trim().length > 0;
      default:
        return false;
    }
  };

  const resetToLogin = () => {
    setIsLogin(true);
    setSignupStep(1);
    setAlert({ type: "", message: "" });
    // Reset form fields
    setEmailOrUsername("");
    setPassword("");
    setEmail("");
    setFullName("");
    setConfirmPassword("");
    setAddressLine1("");
    setAddressLine2("");
    setCity("");
    setState("");
    setCountry("");
    setZipCode("");
  };

  const switchToSignup = () => {
    setIsLogin(false);
    setSignupStep(1);
    setAlert({ type: "", message: "" });
    // Reset form fields
    setEmailOrUsername("");
    setPassword("");
    setEmail("");
    setFullName("");
    setConfirmPassword("");
    setAddressLine1("");
    setAddressLine2("");
    setCity("");
    setState("");
    setCountry("");
    setZipCode("");
  };

  const renderProgressBar = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all ${
              signupStep > step
                ? "bg-green-500 border-green-500 text-white"
                : signupStep === step
                ? "bg-red-600 border-red-600 text-white"
                : "border-gray-300 text-gray-400"
            }`}
          >
            {signupStep > step ? <Check className="w-5 h-5" /> : step}
          </div>
          {step < 4 && (
            <div
              className={`w-12 h-0.5 transition-all ${
                signupStep > step ? "bg-green-500" : "bg-gray-300"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStepContent = () => {
    switch (signupStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Personal Information</h3>
              <p className="text-gray-600">Tell us about yourself to get started</p>
            </div>
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Enter your full name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email address"
                className="mt-1"
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Secure Your Account</h3>
              <p className="text-gray-600">Create a strong password to protect your account</p>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Create a strong password"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm your password"
                className="mt-1"
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Delivery Address</h3>
              <p className="text-gray-600">Where should we deliver your orders?</p>
            </div>
            <div>
              <Label htmlFor="addressLine1">Address Line 1</Label>
              <Input
                id="addressLine1"
                type="text"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                required
                placeholder="Street address, building, apartment"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
              <Input
                id="addressLine2"
                type="text"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                placeholder="Suite, unit, floor, etc."
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  placeholder="City"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="zipCode">Zip Code</Label>
                <Input
                  id="zipCode"
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  required
                  placeholder="Zip code"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                  placeholder="State or Province"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                  placeholder="Country"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Review & Complete</h3>
              <p className="text-gray-600">Review your information before creating your account</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Name:</p>
                <p className="text-sm text-gray-600">{fullName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Email:</p>
                <p className="text-sm text-gray-600">{email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Delivery Address:</p>
                <p className="text-sm text-gray-600">
                  {[addressLine1, addressLine2, city, state, zipCode, country]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
    <Header />
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
   
        {/* Main Card */}
        <div className="bg-white shadow-2xl rounded-3xl p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {isLogin ? "Welcome Back!" : "Create Account"}
            </h2>
            <p className="text-gray-600 mt-1">
              {isLogin 
                ? "Sign in to continue your shopping" 
                : "Join thousands of happy shoppers"}
            </p>
          </div>

          {/* Progress Bar for Signup */}
          {!isLogin && renderProgressBar()}

          {/* Alert */}
          {alert.message && (
            <Alert
              variant={alert.type === "error" ? "destructive" : "default"}
              className="mb-6"
            >
              <AlertTitle>
                {alert.type === "error" ? "Error" : "Success"}
              </AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          )}

          {/* Social Login Buttons (only for login and step 1 of signup) */}
          {(isLogin || signupStep === 1) && (
            <div className="space-y-3 mb-6">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  const token = credentialResponse.credential;
                  try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/social-login`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ provider: "google", token }),
                    });
                    const data = await res.json();
                    if (res.ok) {
                      Cookies.set("token", data.token, { expires: 1 });
                      router.push("/");
                      loginSuccess(data.token);
                    } else {
                      setAlert({ type: "error", message: data.message });
                    }
                  } catch (err) {
                    setAlert({ type: "error", message: "Social login failed" });
                  }
                }}
                onError={() => {
                  setAlert({ type: "error", message: "Google login failed" });
                }}
                width="100%"
                theme="outline"
                size="large"
                text={isLogin ? "signin_with" : "signup_with"}
              />
              
              <ReactFacebookLogin
                appId={process.env.NEXT_PUBLIC_FACEBOOK_APP_ID}
                autoLoad={false}
                fields="name,email,picture"
                callback={async (response) => {
                  try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/social-login`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ provider: "facebook", token: response.accessToken }),
                    });
                    const data = await res.json();
                    if (res.ok) {
                      Cookies.set("token", data.token, { expires: 1 });
                      router.push("/");
                      loginSuccess(data.token);
                    } else {
                      setAlert({ type: "error", message: data.message });
                    }
                  } catch (err) {
                    setAlert({ type: "error", message: "Facebook login failed" });
                  }
                }}
                cssClass="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-center"
                textButton={`Continue with Facebook`}
              />

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={isLogin ? handleLogin : handleSignUp}>
            {isLogin ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="emailOrUsername">Email or Username</Label>
                  <Input
                    id="emailOrUsername"
                    type="text"
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    required
                    placeholder="Enter your email or username"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="mt-1"
                  />
                </div>
                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
              </div>
            ) : (
              <>
                {renderStepContent()}
                
                {/* Navigation Buttons for Signup */}
                <div className="flex gap-3 mt-8">
                  {signupStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </Button>
                  )}
                  
                  {signupStep < 4 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={!validateStep(signupStep)}
                      className="flex-1 bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={loading || !validateStep(signupStep)}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      {loading ? "Creating Account..." : "Create Account"}
                    </Button>
                  )}
                </div>
              </>
            )}
          </form>

          {/* Toggle link */}
          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              {isLogin ? (
                <>
                  New to ShopEase?{" "}
                  <button
                    type="button"
                    className="text-red-600 font-medium hover:text-red-700 transition-colors"
                    onClick={switchToSignup}
                  >
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="text-red-600 font-medium hover:text-red-700 transition-colors"
                    onClick={resetToLogin}
                  >
                    Sign in here
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}