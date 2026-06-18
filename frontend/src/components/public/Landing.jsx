import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Lock, Loader2 } from 'lucide-react';
import { policyApi } from '../../services/api';

export default function Landing() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlans() {
      try {
        const data = await policyApi.getPlans();
        setPlans(data);
      } catch (err) {
        console.error("Failed to load plans", err);
      } finally {
        setLoading(false);
      }
    }
    loadPlans();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-dark-bg text-gray-100">
      {/* Navbar */}
      <nav className="flex items-center justify-between p-4 px-6 md:px-12 z-10 w-full relative border-b border-dark-border/50 bg-dark-bg/80 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-brand-500 rounded-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-wide text-white">GigShield</span>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-sm font-semibold text-white bg-dark-highlight hover:bg-dark-border border border-dark-border transition-colors rounded-full"
          >
            Log in
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 transition-colors rounded-full shadow-lg shadow-brand-500/20"
          >
            Sign up
          </button>
        </div>
      </nav>

      {/* Hero Content */}
      <main className="flex flex-col items-center justify-center flex-1 px-4 text-center mt-12 mb-20 max-w-4xl mx-auto w-full">
        <div className="inline-flex items-center px-3 py-1 mb-8 text-xs font-semibold tracking-wide text-gold-400 uppercase border border-dark-border rounded-full bg-dark-card shadow-sm">
          <span className="mr-2 text-lg leading-none">🛵</span> 
          For Zomato & Swiggy Partners
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight max-w-2xl mx-auto">
          Your income <br />
          <span className="text-brand-500">protected</span> <br />
          automatically
        </h1>

        <p className="max-w-xl mx-auto text-base md:text-xl text-gray-400 mb-10 leading-relaxed">
          When heavy rain or extreme heat stops your deliveries, GigShield pays you automatically — no claim filing, ever.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 w-full max-w-3xl border-t border-b border-dark-border/50 py-8">
          <div className="flex flex-col items-center justify-center bg-dark-card p-6 rounded-3xl border border-dark-border shadow-2xl">
            <span className="text-2xl font-bold text-white mb-1">₹29/week</span>
            <span className="text-sm text-gray-400">Starting from</span>
          </div>
          <div className="flex flex-col items-center justify-center bg-dark-card p-6 rounded-3xl border border-dark-border shadow-2xl">
            <span className="text-2xl font-bold text-white mb-1">&lt; 10 min</span>
            <span className="text-sm text-gray-400">Auto payout</span>
          </div>
          <div className="flex flex-col items-center justify-center bg-dark-card p-6 rounded-3xl border border-dark-border shadow-2xl">
            <span className="text-2xl font-bold text-white mb-1">Zero</span>
            <span className="text-sm text-gray-400">Claim filing</span>
          </div>
        </div>

        {/* Plans Section */}
        <div className="w-full max-w-4xl mx-auto mb-16">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-extrabold text-white mb-2">Flexible Protection Plans</h2>
            <p className="text-gray-400">Choose the cover that fits your delivery routine.</p>
          </div>
          
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map(plan => (
                <div key={plan.id} className={`flex flex-col p-6 rounded-3xl border ${plan.id === 'standard' ? 'bg-dark-card border-brand-500/50 shadow-[0_0_30px_rgba(239,68,68,0.15)] relative scale-105 z-10' : 'bg-dark-bg border-dark-border'}`}>
                  {plan.id === 'standard' && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-brand-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-xl text-white font-bold mb-1">{plan.name}</h3>
                  <p className="text-xs text-gray-400 mb-6">{plan.label}</p>
                  
                  <div className="flex items-end mb-6">
                    <span className="text-3xl font-black text-white">₹{plan.aiPrice}</span>
                    <span className="text-gray-500 text-sm ml-1 mb-1">/ week</span>
                  </div>
                  
                  <ul className="space-y-3 mb-8 flex-1">
                    <li className="flex items-center text-sm text-gray-300">
                      <Shield className="w-4 h-4 text-brand-400 mr-2 shrink-0" />
                      Automatic Payouts
                    </li>
                    <li className="flex items-center text-sm text-gray-300">
                      <Shield className="w-4 h-4 text-brand-400 mr-2 shrink-0" />
                      Max payout: <span className="text-green-500 font-bold ml-1">₹{plan.maxDaily}</span>
                    </li>
                  </ul>
                  
                  <button 
                    onClick={() => navigate('/login')}
                    className={`w-full py-3 rounded-xl text-sm font-bold transition-colors ${plan.id === 'standard' ? 'bg-brand-500 text-white hover:bg-brand-400 shadow-lg shadow-brand-500/25' : 'bg-dark-highlight text-white hover:bg-dark-border border border-dark-border'}`}
                  >
                    Select Plan
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button 
          onClick={() => navigate('/login')}
          className="flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-brand-600 to-brand-500 rounded-full hover:from-brand-500 hover:to-brand-400 shadow-xl shadow-brand-500/25 transition-all group"
        >
          Get Covered This Week
          <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
        </button>

        <p className="flex items-center mt-6 text-sm text-gray-500">
          <Lock className="w-4 h-4 mr-1.5 text-gray-400" />
          No health, accident or vehicle coverage — Income protection only
        </p>
      </main>
    </div>
  );
}
