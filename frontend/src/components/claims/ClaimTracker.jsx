import { useState, useEffect } from 'react';
import { claimsApi } from '../../services/api';
import { Activity, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function ClaimTracker() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClaims() {
      try {
        const data = await claimsApi.getClaims();
        setClaims(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchClaims();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 animate-spin rounded-full border-4 border-dark-border border-t-brand-500" />
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUCCESS': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'PENDING': return <Clock className="w-5 h-5 text-gold-500" />;
      default: return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'SUCCESS': return 'Paid out via UPI';
      case 'PENDING': return 'Processing';
      default: return 'Failed / Rejected';
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-display mb-1">Your Claims</h1>
        <p className="mt-1 text-sm text-gray-400">
          History of automated payouts triggered by disruptions.
        </p>
      </div>

      {claims.length > 0 ? (
        <div className="space-y-4">
          {claims.map((claim) => (
            <div key={claim.id} className="bg-dark-card border border-dark-border rounded-3xl p-6 shadow-lg">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                    {claim.id}
                  </span>
                  <h3 className="mt-1.5 text-lg font-bold text-white leading-tight">
                    {claim.reason}
                  </h3>
                  <p className="text-xs font-medium border border-dark-highlight bg-dark-bg text-gray-400 px-2.5 py-1 rounded inline-block mt-3">
                    {new Date(claim.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right flex items-center justify-center p-3 py-1.5 bg-green-500/10 rounded-xl border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                  <span className="text-xl font-black text-green-400 tracking-tighter">
                    +₹{claim.amount}
                  </span>
                </div>
              </div>
              
              <div className="pt-4 mt-2 border-t border-dark-border flex items-center justify-between">
                <div className="flex items-center">
                  {getStatusIcon(claim.status)}
                  <span className="ml-2.5 text-sm font-bold text-gray-300">
                    {getStatusText(claim.status)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-dark-highlight/30 rounded-3xl border border-dashed border-dark-border">
          <div className="bg-dark-highlight p-4 rounded-full mb-4 border border-dark-border">
             <Activity className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No Claims Yet</h3>
          <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
            A disruption hasn't affected your zone yet while your policy was active.
          </p>
        </div>
      )}
    </div>
  );
}
