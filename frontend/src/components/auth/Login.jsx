import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authApi } from '../../services/api';
import { Shield, Smartphone, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      await authApi.sendOtp(data.phone);
      toast.success('OTP sent successfully!');
      navigate('/verify-otp', { state: { phone: data.phone } });
    } catch (error) {
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-dark-bg text-gray-100">
      <div className="flex flex-col items-center justify-center flex-1 px-4 sm:px-6 lg:px-8">
        
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-brand-500 rounded-2xl shadow-lg shadow-brand-500/20">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              GigShield
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Because every shift deserves a safety net.
            </p>
          </div>

          <div className="p-8 bg-dark-card border border-dark-border shadow-[0_0_40px_rgba(0,0,0,0.5)] rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            
            <form className="space-y-6 relative z-10" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                  Mobile Number
                </label>
                <div className="relative rounded-2xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <Smartphone className="w-5 h-5 text-gray-500" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    className={`block w-full py-4 pl-12 pr-4 bg-dark-highlight border-dark-border rounded-xl focus:ring-brand-500 focus:border-brand-500 text-white placeholder-gray-500 sm:text-sm transition-all focus:bg-dark-bg ${
                      errors.phone ? 'border-brand-400 ring-1 ring-brand-500' : ''
                    }`}
                    placeholder="Enter 10-digit number"
                    {...register('phone', { 
                      required: 'Phone number is required',
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: 'Enter a valid 10-digit number'
                      }
                    })}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-2 text-xs font-semibold text-brand-400">{errors.phone.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="relative flex items-center justify-center w-full py-4 px-4 text-sm font-bold text-white transition-all bg-gradient-to-r from-brand-600 to-brand-500 rounded-xl hover:from-brand-500 hover:to-brand-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 focus:ring-offset-dark-bg disabled:opacity-70 shadow-lg shadow-brand-500/20 group"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Get OTP</span>
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-8 text-center relative z-10">
              <p className="text-sm text-gray-400 mb-4">
                Don't have an account?{' '}
                <button 
                  type="button" 
                  onClick={() => navigate('/signup')} 
                  className="font-bold text-brand-400 hover:text-brand-300"
                >
                  Sign up
                </button>
              </p>
              <p className="text-xs text-gray-500">
                By continuing, you agree to our <a href="#" className="underline hover:text-gray-300">Terms & Conditions</a>
              </p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
