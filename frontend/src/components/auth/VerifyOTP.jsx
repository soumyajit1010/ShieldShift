import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from "../../services/api";
import { useAuthStore } from "../../store/useAuthStore";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function VerifyOTP() {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const inputs = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();
  const phone = location.state?.phone;
  const login = useAuthStore((state) => state.login);

  if (!phone) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    if (inputs.current[0]) inputs.current[0].focus();
  }, []);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    if (element.nextSibling && element.value !== "") {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  const verifyOtp = async () => {
    const otpValue = otp.join("");

    if (otpValue.length !== 4) {
      toast.error("Please enter a valid 4-digit OTP");
      return;
    }

    try {
      setIsLoading(true);

      await authApi.verifyOtp(phone, otpValue);

      toast.success("OTP Verified");

      navigate("/onboarding", {
        state: {
          phone,
        },
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");

      setOtp(["", "", "", ""]);

      if (inputs.current[0]) {
        inputs.current[0].focus();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-dark-bg text-gray-100">
      <div className="flex flex-col items-center justify-center flex-1 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-sm">
          <button
            onClick={() => navigate("/login")}
            className="flex items-center mb-8 text-sm font-semibold text-gray-400 transition-colors hover:text-white group"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5 transition-transform group-hover:-translate-x-1" />
            Back to login
          </button>

          <div className="space-y-6 bg-dark-card border border-dark-border shadow-[0_0_40px_rgba(0,0,0,0.5)] p-8 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl -ml-16 -mt-16 pointer-events-none"></div>

            <div className="text-center relative z-10">
              <h2 className="text-3xl font-bold text-white mb-2">Verify OTP</h2>
              <p className="text-sm text-gray-400">
                Enter the 4-digit code sent to
                <br />
                <strong className="font-bold text-gray-200 mt-1 inline-block">
                  +91 {phone}
                </strong>
              </p>
            </div>

            <div className="flex justify-center gap-3 my-8 relative z-10">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  ref={(el) => (inputs.current[index] = el)}
                  value={data}
                  onChange={(e) => handleChange(e.target, index)}
                  onFocus={(e) => e.target.select()}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-14 h-16 text-3xl font-black text-center text-white transition-all bg-dark-highlight border border-dark-border rounded-xl focus:bg-dark-bg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 shadow-inner"
                />
              ))}
            </div>

            <button
              onClick={verifyOtp}
              disabled={isLoading || otp.join("").length !== 4}
              className="relative z-10 flex items-center justify-center w-full py-4 px-4 text-sm font-bold text-white transition-all bg-gradient-to-r from-brand-600 to-brand-500 border border-transparent rounded-xl hover:from-brand-500 hover:to-brand-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 focus:ring-offset-dark-bg disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-brand-500/20"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Verify & Proceed"
              )}
            </button>

            <div className="mt-6 text-center relative z-10">
              <button
                className="text-sm font-bold text-gray-400 hover:text-white transition-colors"
                onClick={() => toast.success("New OTP sent!")}
              >
                Resend Code
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
