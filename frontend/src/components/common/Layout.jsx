import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Home, Shield, Activity, LogOut, User, Bell, CloudRain, AlertTriangle } from 'lucide-react';

export default function Layout() {
  const logout = useAuthStore(state => state.logout);
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Plans', path: '/plans', icon: Shield },
    { name: 'Claims', path: '/claims', icon: Activity },
  ];

  // Dummy notification data demonstrating "weather or other required notification"
  const notifications = [
    { id: 1, type: 'weather', icon: CloudRain, title: 'Heavy Rain Alert', message: 'Koramangala zone experiencing >35mm/hr rain.', time: '10m ago', unread: true },
    { id: 2, type: 'system', icon: AlertTriangle, title: 'Policy Update', message: 'Your claims auto-trigger is active.', time: '2h ago', unread: true },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="flex flex-col h-screen bg-dark-bg text-gray-100 md:flex-row">
      {/* Mobile Header */}
      <header className="flex items-center justify-between p-4 bg-dark-bg border-b border-dark-border shadow-sm md:hidden shrink-0 z-50 relative">
        <div className="flex items-center space-x-2">
           <div className="p-1.5 bg-brand-500 rounded-lg">
             <Shield className="w-5 h-5 text-white" />
           </div>
          <span className="text-xl font-bold tracking-wide text-white">
            GigShield
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Notification Bell */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-400 hover:text-white hover:bg-dark-highlight rounded-full transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500 border-2 border-dark-bg"></span>
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-dark-card border border-dark-border shadow-2xl rounded-2xl overflow-hidden z-50 animate-fade-in origin-top-right">
                <div className="p-4 border-b border-dark-border flex justify-between items-center bg-dark-bg/50">
                  <h3 className="font-bold text-white flex items-center">Notifications</h3>
                  {unreadCount > 0 && <span className="bg-brand-500/20 text-brand-400 text-xs px-2 py-0.5 rounded-full font-bold">{unreadCount} New</span>}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map(notif => (
                    <div key={notif.id} className={`p-4 border-b border-dark-border/50 hover:bg-dark-highlight transition-colors flex items-start gap-3 curson-pointer ${notif.unread ? 'bg-brand-500/5' : ''}`}>
                      <div className={`p-2 rounded-xl shrink-0 ${notif.type === 'weather' ? 'bg-blue-500/10 text-blue-400' : 'bg-brand-500/10 text-brand-400'}`}>
                        <notif.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-white">{notif.title}</h4>
                        <p className="text-xs text-gray-400 mt-0.5 leading-snug">{notif.message}</p>
                        <span className="text-[10px] text-gray-500 mt-2 block">{notif.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 text-center border-t border-dark-border">
                  <button className="text-xs text-brand-400 font-bold hover:text-brand-300">Mark all as read</button>
                </div>
              </div>
            )}
          </div>
          
          <button onClick={() => navigate('/profile')} className="p-1 border-2 border-dark-border rounded-full outline-none focus:border-brand-500 transition-colors">
            <div className="w-7 h-7 bg-brand-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          </button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-dark-bg border-r border-dark-border shadow-lg shrink-0 z-20">
        <div className="flex items-center justify-center p-6 border-b border-dark-border">
          <div className="p-1.5 bg-brand-500 rounded-lg shadow-lg shadow-brand-500/20">
             <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="ml-3 text-2xl font-bold tracking-wide text-white">
            GigShield
          </span>
        </div>
        <div className="flex flex-col flex-1 py-6 overflow-y-auto">
          <nav className="flex-1 px-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3.5 text-sm font-medium rounded-2xl transition-all duration-200 ${
                      isActive
                        ? 'bg-brand-500/10 text-brand-500 shadow-sm border border-brand-500/20'
                        : 'text-gray-400 hover:bg-dark-highlight hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>
        <div className="p-6 border-t border-dark-border bg-dark-bg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-sm font-medium text-gray-300 bg-dark-card p-3 flex-1 rounded-2xl border border-dark-border mr-2 overflow-hidden">
              <div className="flex items-center justify-center w-8 h-8 mr-3 shrink-0 text-white rounded-full bg-brand-600">
                <User className="w-4 h-4" />
              </div>
              <span className="truncate">{user?.fullName || user?.name || 'Delivery Partner'}</span>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-3 text-gray-400 hover:text-white bg-dark-card border border-dark-border rounded-2xl transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500 border-2 border-dark-bg"></span>
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute bottom-full left-0 mb-2 w-80 bg-dark-card border border-dark-border shadow-[0_-10px_40px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden z-50 animate-fade-in origin-bottom-left">
                  <div className="p-4 border-b border-dark-border flex justify-between items-center bg-dark-bg/50">
                    <h3 className="font-bold text-white flex items-center">Notifications</h3>
                    {unreadCount > 0 && <span className="bg-brand-500/20 text-brand-400 text-xs px-2 py-0.5 rounded-full font-bold">{unreadCount} New</span>}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map(notif => (
                      <div key={notif.id} className={`p-4 border-b border-dark-border/50 hover:bg-dark-highlight transition-colors flex items-start gap-3 cursor-pointer ${notif.unread ? 'bg-brand-500/5' : ''}`}>
                        <div className={`p-2 rounded-xl shrink-0 ${notif.type === 'weather' ? 'bg-blue-500/10 text-blue-400' : 'bg-brand-500/10 text-brand-400'}`}>
                          <notif.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-white">{notif.title}</h4>
                          <p className="text-xs text-gray-400 mt-0.5 leading-snug">{notif.message}</p>
                          <span className="text-[10px] text-gray-500 mt-2 block">{notif.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 text-center border-t border-dark-border">
                    <button className="text-xs text-brand-400 font-bold hover:text-brand-300">Mark all as read</button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-bold text-white transition-colors rounded-xl bg-dark-highlight hover:bg-dark-border hover:text-red-400 border border-dark-border"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="relative flex-1 overflow-x-hidden overflow-y-auto bg-dark-bg pb-[90px] md:pb-0">
        <div className="container px-4 py-6 mx-auto max-w-xl md:py-10">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-dark-bg/95 backdrop-blur-xl border-t border-dark-border shadow-[0_-10px_20px_rgba(0,0,0,0.5)] md:hidden pb-safe">
        <div className="flex justify-around items-center h-[72px] px-2">
            {navItems.map((item) => {
               const Icon = item.icon;
               return (
                  <NavLink
                     key={item.name}
                     to={item.path}
                     className={({ isActive }) =>
                        `flex flex-col items-center justify-center flex-1 h-full px-2 transition-colors duration-200 ${
                           isActive ? 'text-brand-500' : 'text-gray-500 hover:text-gray-300'
                        }`
                     }
                  >
                     {({ isActive }) => (
                        <div className="flex flex-col items-center justify-center">
                           <div className={`p-1.5 rounded-full transition-all duration-300 ${isActive ? 'bg-brand-500/15' : 'bg-transparent'}`}>
                              <Icon className={`w-6 h-6 ${isActive ? 'fill-brand-500/10' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                           </div>
                           <span className={`text-[10px] font-bold mt-1 tracking-wide ${isActive ? 'text-brand-500' : ''}`}>
                              {item.name}
                           </span>
                        </div>
                     )}
                  </NavLink>
               );
            })}
        </div>
      </nav>
    </div>
  );
}
