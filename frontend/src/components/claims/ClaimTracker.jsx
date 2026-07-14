import { useEffect, useState } from "react";
import { claimsApi } from "../../services/api";
import { useAuthStore } from "../../store/useAuthStore";
import {
  Activity,
  CheckCircle,
  Clock,
  AlertCircle,
  Shield,
  Calendar,
  IndianRupee,
} from "lucide-react";

export default function ClaimTracker() {
  const user = useAuthStore((state) => state.user);

  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchClaims() {
      try {
        const data = await claimsApi.getWorkerClaims(user.id);

        console.log("Claims:", data);

        setClaims(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchClaims();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 rounded-full border-4 border-dark-border border-t-brand-500 animate-spin" />
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "AUTO_APPROVED":
        return "bg-green-500/20 text-green-400 border-green-500/20";

      case "PENDING":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/20";

      default:
        return "bg-red-500/20 text-red-400 border-red-500/20";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "AUTO_APPROVED":
        return <CheckCircle className="w-5 h-5 text-green-400" />;

      case "PENDING":
        return <Clock className="w-5 h-5 text-yellow-400" />;

      default:
        return <AlertCircle className="w-5 h-5 text-red-400" />;
    }
  };

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-extrabold text-white">
          Your Claims
        </h1>

        <p className="text-gray-400 mt-2">
          History of all claims submitted under your policy.
        </p>
      </div>

      {claims.length === 0 ? (
        <div className="bg-dark-card border border-dark-border rounded-3xl p-10 text-center">

          <Activity className="mx-auto w-10 h-10 text-gray-500" />

          <h2 className="mt-4 text-xl font-bold text-white">
            No Claims Yet
          </h2>

          <p className="text-gray-400 mt-2">
            File a claim whenever a disruption affects your work.
          </p>

        </div>
      ) : (
        <div className="space-y-5">

          {claims.map((claim) => (
            <div
              key={claim.claimId}
              className="bg-dark-card border border-dark-border rounded-3xl p-6 shadow-lg"
            >
              <div className="flex justify-between items-start">

                <div>

                  <p className="text-xs uppercase tracking-widest text-gray-500">
                    Claim #{claim.claimId}
                  </p>

                  <h2 className="text-xl font-bold text-white mt-2">
                    {claim.event.replaceAll("_", " ")}
                  </h2>

                </div>

                <div
                  className={`px-4 py-2 rounded-full border text-sm font-bold ${getStatusColor(
                    claim.claimStatus
                  )}`}
                >
                  {claim.claimStatus.replaceAll("_", " ")}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5 mt-6">

                <div className="bg-dark-highlight rounded-xl p-4">

                  <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                    <Calendar size={14} />
                    Claim Date
                  </p>

                  <p className="text-white font-semibold">
                    {new Date(claim.claimDate).toLocaleString()}
                  </p>

                </div>

                <div className="bg-dark-highlight rounded-xl p-4">

                  <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                    <IndianRupee size={14} />
                    Payout
                  </p>

                  <p className="text-green-400 font-bold text-xl">
                    ₹{claim.payoutAmount}
                  </p>

                </div>

                <div className="bg-dark-highlight rounded-xl p-4">

                  <p className="text-xs text-gray-400 mb-1">
                    Fraud Score
                  </p>

                  <p className="text-yellow-400 font-bold">
                    {claim.fraudScore}
                  </p>

                </div>

                <div className="bg-dark-highlight rounded-xl p-4">

                  <p className="text-xs text-gray-400 mb-1">
                    Verification
                  </p>

                  <div className="flex items-center gap-2">

                    {getStatusIcon(claim.claimStatus)}

                    <span className="font-semibold text-white">
                      {claim.claimStatus === "AUTO_APPROVED"
                        ? "Approved"
                        : claim.claimStatus}
                    </span>

                  </div>

                </div>

              </div>

              <div className="mt-6 border-t border-dark-border pt-4 flex items-center gap-2">

                <Shield className="text-brand-500" size={18} />

                <span className="text-sm text-gray-400">
                  Processed automatically by GigShield AI
                </span>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}