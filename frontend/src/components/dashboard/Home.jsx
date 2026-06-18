import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workerApi } from '../../services/api';
import { Shield, CloudRain, AlertTriangle, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const res = await workerApi.getDashboard();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-4 border-dark-border border-t-brand-500 animate-spin" />
      </div>
    );
  }

  const isCovered = data?.status === 'ACTIVE';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-display">Dashboard</h1>
      </div>

      {/* Coverage Status Card */}
      <div className={`relative overflow-hidden rounded-3xl p-6 shadow-2xl border ${
        isCovered 
            ? 'bg-gradient-to-br from-[#1C1C28] to-[#252634] border-brand-500/30' 
            : 'bg-dark-card border-dark-border'
      }`}>
        {isCovered && (
           <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none -mr-8 -mt-8"></div>
        )}

        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold mb-4 tracking-wide shadow-inner ${
              isCovered ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
            }`}>
              {isCovered ? '✅ ACTIVE COVERAGE' : '⚠️ ACTION NEEDED'}
            </div>
            <h2 className={`text-3xl font-black mb-1 ${isCovered ? 'text-white' : 'text-gray-200'}`}>
              {isCovered ? 'You are covered' : 'No active policy'}
            </h2>
            <p className={`text-sm ${isCovered ? 'text-gray-400' : 'text-gray-500'}`}>
              {isCovered 
                ? 'Your income is protected against disruptions.' 
                : 'Get a weekly plan to protect your earnings.'}
            </p>
          </div>
          
          {isCovered ? (
            <div className="p-3 rounded-2xl bg-brand-500/20 backdrop-blur-sm border border-brand-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <Shield className="w-8 h-8 text-brand-500" />
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-dark-highlight border border-dark-border">
              <Shield className="w-8 h-8 text-gray-500" />
            </div>
          )}
        </div>

        {!isCovered && (
          <button 
            onClick={() => navigate('/plans')}
            className="flex items-center justify-center w-full px-5 py-4 mt-6 text-sm font-bold text-white transition-all bg-gradient-to-r from-brand-600 to-brand-500 rounded-xl hover:from-brand-500 hover:to-brand-400 shadow-xl shadow-brand-500/20 group relative z-10"
          >
            View Plans
            <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
          </button>
          
        )}

        {isCovered && (
          <button 
            onClick={() => navigate('/file-claim')}
            className="flex items-center justify-center w-full px-5 py-4 mt-6 text-sm font-bold text-white transition-all bg-gradient-to-r from-brand-600 to-brand-500 rounded-xl hover:from-brand-500 hover:to-brand-400 shadow-xl shadow-brand-500/20 group relative z-10"
          >
            File Claim
            <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
          </button>
          
        )}

        
      </div>

      {/* Active Events / Disruptions */}
      <div>
        <h3 className="mb-4 text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
          Live Threat Level
        </h3>
        
        {data?.activeEvents?.length > 0 ? (
          <div className="space-y-4">
            {data.activeEvents.map((event, idx) => (
              <div key={idx} className="flex p-5 bg-[#2E1A1A] border border-[#ff4d4d]/20 rounded-3xl shadow-lg relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-[#ff4d4d]/10 rounded-full blur-xl pointer-events-none -mr-4 -mt-4"></div>
                <div className="flex-shrink-0 p-3 bg-[#ff4d4d]/20 rounded-2xl border border-[#ff4d4d]/20 self-start z-10">
                  {event.type === 'HEAVY_RAIN' ? (
                    <CloudRain className="w-6 h-6 text-[#ff4d4d]" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-[#ff4d4d]" />
                  )}
                </div>
                <div className="ml-4 flex-1 z-10">
                  <h4 className="text-base font-bold text-white mb-0.5">
                    {event.type.replace('_', ' ')} in {event.zone}
                  </h4>
                  <p className="text-sm text-[#ff9999]">
                    Severity: <strong className="font-bold">{event.severity}</strong>
                  </p>
                  {isCovered && (
                     <div className="mt-3 bg-black/30 w-full rounded-xl p-3 border border-black/50">
                        <p className="text-xs font-bold text-brand-400 flex items-center uppercase tracking-wide">
                          <Zap className="w-3.5 h-3.5 mr-1.5" fill="currentColor"/>
                          Monitoring for payout
                        </p>
                     </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center p-5 bg-dark-card border border-dark-border rounded-3xl shadow-sm">
            <div className="p-3 bg-green-500/10 rounded-2xl border border-green-500/20">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
            <div className="ml-4">
              <h4 className="text-base font-bold text-white">All Clear</h4>
              <p className="text-sm text-gray-400 mt-0.5">No active disruptions in your zone.</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats or Informational Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-5 bg-dark-card border border-dark-border rounded-3xl shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Auto Payouts</p>
          <p className="text-3xl font-black text-white">0</p>
          <p className="mt-1 text-xs font-medium text-gray-500">This Month</p>
        </div>
        <div className="p-5 bg-dark-card border border-dark-border rounded-3xl shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Risk Level</p>
          <p className="text-2xl font-black text-gold-400 leading-tight">Moderate</p>
          <p className="mt-2 text-xs font-medium text-gray-500">Based on forecast</p>
        </div>
      </div>
    </div>
  );
}
