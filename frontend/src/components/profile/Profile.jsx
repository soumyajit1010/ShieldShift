import { useAuthStore } from '../../store/useAuthStore';
import { User, Phone, Calendar, Shield, MapPin, Activity } from 'lucide-react';

export default function Profile() {
  const user = useAuthStore(state => state.user);

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-400">Loading profile data...</p>
      </div>
    );
  }

  // Format date if available
  const joinedDate = user.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : 'Recently';

  return (
    <div className="space-y-6 pb-[90px] md:pb-0 animate-fade-in">
      <h1 className="text-3xl font-extrabold text-white">My Profile</h1>
      
      <div className="p-8 bg-dark-card border border-dark-border shadow-[0_0_40px_rgba(0,0,0,0.5)] rounded-3xl relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -ml-16 -mb-16 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          
          <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-brand-600 to-brand-400 p-1 shadow-lg shadow-brand-500/30 shrink-0">
            <div className="flex items-center justify-center w-full h-full bg-dark-card rounded-full border-2 border-brand-500/50">
              <User className="w-10 h-10 text-brand-400" />
            </div>
          </div>
          
          <div className="flex-1 text-center sm:text-left space-y-2">
            <h2 className="text-2xl font-bold text-white capitalize">{user.name || user.fullName || 'User'}</h2>
            <div className="flex items-center justify-center sm:justify-start space-x-2 text-gray-400">
              <Phone className="w-4 h-4 text-brand-400" />
              <span className="text-sm">+91 {user.phone}</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start space-x-2 text-gray-400 mt-1">
              <Calendar className="w-4 h-4 text-brand-400" />
              <span className="text-sm">Joined {joinedDate}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 px-3 py-1.5 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-full shrink-0">
            <Shield className="w-4 h-4" />
            <span className="text-xs font-bold tracking-wide">VERIFIED</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-dark-highlight border border-dark-border rounded-2xl">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-blue-500/10 rounded-xl mr-3">
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Activity Stats</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-dark-border/50">
              <span className="text-gray-400 text-sm">Active Polices</span>
              <span className="font-semibold text-white">1</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-dark-border/50">
              <span className="text-gray-400 text-sm">Total Claims</span>
              <span className="font-semibold text-white">0</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400 text-sm">Work Base</span>
              <div className="flex items-center text-white font-semibold">
                <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                Bangalore
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-dark-highlight border border-dark-border rounded-2xl flex flex-col">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-brand-500/10 rounded-xl mr-3">
              <Shield className="w-5 h-5 text-brand-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Account Security</h3>
          </div>
          <p className="text-sm text-gray-400 mb-6 flex-1">
            Your account is secured with mobile OTP. Update your registered number or re-authenticate from settings.
          </p>
          <button className="w-full py-3 px-4 rounded-xl border border-dark-border text-sm font-medium hover:bg-dark-card hover:text-white transition-colors">
            Manage Settings
          </button>
        </div>
      </div>
      
    </div>
  );
}
