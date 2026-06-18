import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { workerApi } from "../../services/api";
import { useAuthStore } from "../../store/useAuthStore";
import {
  ArrowRight,
  Loader2,
  Clock,
  CreditCard,
  User,
  Zap,
} from "lucide-react";

export default function WorkerSetup() {
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);

  const login = useAuthStore((state) => state.login);

  const updateUser = useAuthStore((state) => state.updateUser);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

 
  const onSubmit = async (data) => {
    try {
      setIsLoading(true);

      const payload = {
        mobileNumber: user?.mobileNumber,

        fullName: data.fullName,

        city: data.city,

        zoneId: Number(data.zoneId),

        platform: data.platform,

        upiId: data.upiId,

        avgDailyHours: Number(data.hours),

        avgHourlyIncome: Number(data.avgHourlyIncome),
      };

      const res = await workerApi.register(payload);

      console.log("User Created:", res);


      login("temp-token", res);
      toast.success("Profile created successfully!");

      navigate("/plans");
    } catch (error) {
      console.error(error);

      toast.error("Failed to create profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-dark-bg text-gray-100">
      <div className="flex flex-col items-center justify-center flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">
              Complete Your Profile
            </h2>
            <p className="text-sm text-gray-400">
              We adjust your premium dynamically based on these details.
            </p>
          </div>

          <div className="p-8 bg-dark-card border border-dark-border shadow-[0_0_40px_rgba(0,0,0,0.5)] rounded-3xl relative overflow-hidden">
            <form
              className="space-y-6 relative z-10"
              onSubmit={handleSubmit(onSubmit)}
            >
              {/* Full Name */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    {...register("fullName", { required: "Name is required" })}
                    className="block w-full py-3.5 pl-12 pr-4 bg-dark-highlight border border-dark-border rounded-xl focus:ring-brand-500 focus:border-brand-500 focus:bg-dark-bg text-white transition-all sm:text-sm"
                    placeholder="e.g. Rahul Kumar"
                  />
                </div>
              </div>

              {/* City and Zone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    City
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <select
                      {...register("city", { required: "City required" })}
                      className="block w-full py-3.5 pl-4 pr-10 bg-dark-highlight border border-dark-border rounded-xl focus:ring-brand-500 focus:border-brand-500 focus:bg-dark-bg text-white appearance-none transition-all sm:text-sm"
                    >
                      <option value="">Select City...</option>
                      <option value="Bangalore">Bangalore</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Delhi">Delhi</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    Primary Zone
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <select
                      {...register("zoneId", { required: "Zone required" })}
                      className="block w-full py-3.5 pl-4 pr-10 bg-dark-highlight border border-dark-border rounded-xl focus:ring-brand-500 focus:border-brand-500 focus:bg-dark-bg text-white appearance-none transition-all sm:text-sm"
                    >
                      <option value="">Select Zone...</option>
                      <option value="1">Zone 1</option>
                      <option value="2">Zone 2</option>
                      <option value="3">Zone 3</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Platform */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Delivery Platform
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="relative flex cursor-pointer rounded-xl border border-dark-border bg-dark-highlight p-4 shadow-sm focus:outline-none transition-colors hover:bg-dark-bg has-[:checked]:border-brand-500 has-[:checked]:bg-brand-500/10">
                    <input
                      type="radio"
                      value="SWIGGY"
                      {...register("platform", { required: true })}
                      className="sr-only"
                    />
                    <span className="flex items-center space-x-3 w-full">
                      <span className="w-5 h-5 rounded-full border border-gray-500 flex items-center justify-center p-0.5 shrink-0">
                        <span className="w-full h-full rounded-full bg-orange-500 peer-checked:block hidden transition-all"></span>
                      </span>
                      <span className="text-sm font-bold text-white">
                        Swiggy
                      </span>
                    </span>
                  </label>
                  <label className="relative flex cursor-pointer rounded-xl border border-dark-border bg-dark-highlight p-4 shadow-sm focus:outline-none transition-colors hover:bg-dark-bg has-[:checked]:border-brand-500 has-[:checked]:bg-brand-500/10">
                    <input
                      type="radio"
                      value="ZOMATO"
                      {...register("platform", { required: true })}
                      className="sr-only"
                    />
                    <span className="flex items-center space-x-3 w-full">
                      <span className="w-5 h-5 rounded-full border border-gray-500 flex items-center justify-center p-0.5 shrink-0">
                        <span className="w-full h-full rounded-full bg-red-600 peer-checked:block hidden transition-all"></span>
                      </span>
                      <span className="text-sm font-bold text-white">
                        Zomato
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Hours */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Average Daily Hours
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <Clock className="w-5 h-5 text-gray-500" />
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    {...register("hours", { required: true, min: 1, max: 24 })}
                    className="block w-full py-3.5 pl-12 pr-4 bg-dark-highlight border border-dark-border rounded-xl focus:ring-brand-500 focus:border-brand-500 focus:bg-dark-bg text-white transition-all sm:text-sm"
                    placeholder="e.g. 8"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <span className="text-gray-500 font-medium sm:text-sm">
                      hours
                    </span>
                  </div>
                </div>
              </div>
              {/*Average Hourly Income */}

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Average Hourly Income (₹)
                </label>

                <input
                  type="number"
                  {...register("avgHourlyIncome", {
                    required: true,
                    min: 1,
                  })}
                  className="block w-full py-3.5 px-4 bg-dark-highlight border border-dark-border rounded-xl focus:ring-brand-500 focus:border-brand-500 text-white"
                  placeholder="e.g. 150"
                />
              </div>

              {/* UPI ID */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  UPI ID for Payouts
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <CreditCard className="w-5 h-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    {...register("upiId", { required: "UPI ID is required" })}
                    className="block w-full py-3.5 pl-12 pr-4 bg-dark-highlight border border-dark-border rounded-xl focus:ring-brand-500 focus:border-brand-500 focus:bg-dark-bg text-white transition-all sm:text-sm"
                    placeholder="e.g. 9876543210@ybl"
                  />
                </div>
                <p className="mt-2.5 flex items-center text-xs font-semibold text-brand-400">
                  <Zap className="w-3.5 h-3.5 mr-1" />
                  Payouts are credited instantly to this UPI
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="relative flex items-center justify-center w-full py-4 px-4 mt-8 text-sm font-bold text-white transition-all bg-gradient-to-r from-brand-600 to-brand-500 border border-transparent rounded-xl hover:from-brand-500 hover:to-brand-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 focus:ring-offset-dark-bg disabled:opacity-70 shadow-lg shadow-brand-500/20 group"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Complete Profile</span>
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
