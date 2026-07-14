import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import {
  workerApi,
  eventApi,
  claimsApi,
} from "../../services/api";

import {
  Shield,
  CloudRain,
  AlertTriangle,
  ArrowRight,
  Zap,
  CheckCircle2,
  Sun,
  Wind,
  Construction,
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);

  const [data, setData] = useState(null);
  const [events, setEvents] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        if (!user?.id) return;

        const [dashboard, activeEvents, recentClaims] =
          await Promise.all([
            workerApi.getDashboard(user.id),
            eventApi.getEvents(),
            claimsApi.getWorkerClaims(user.id),
          ]);

        setData(dashboard);
        setEvents(activeEvents);
        setClaims(recentClaims.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-4 border-dark-border border-t-brand-500 animate-spin" />
      </div>
    );
  }

  const isCovered = data?.coverageStatus === "ACTIVE";

  const getSeverity = (value) => {
    if (value >= 0.8)
      return {
        text: "HIGH",
        color: "bg-red-500",
      };

    if (value >= 0.5)
      return {
        text: "MEDIUM",
        color: "bg-yellow-500",
      };

    return {
      text: "LOW",
      color: "bg-green-500",
    };
  };

  const getEventIcon = (type) => {
    switch (type) {
      case "HEAVY_RAIN":
        return <CloudRain className="w-6 h-6 text-blue-400" />;

      case "EXTREME_HEAT":
        return <Sun className="w-6 h-6 text-orange-400" />;

      case "SEVERE_AQI":
        return <Wind className="w-6 h-6 text-purple-400" />;

      case "ROAD_BLOCK":
        return <Construction className="w-6 h-6 text-yellow-400" />;

      case "BANDH":
        return <AlertTriangle className="w-6 h-6 text-red-400" />;

      default:
        return <AlertTriangle className="w-6 h-6 text-red-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-display">
          Dashboard
        </h1>
      </div>

      {/* Coverage Status */}
      <div
        className={`relative overflow-hidden rounded-3xl p-6 shadow-2xl border ${
          isCovered
            ? "bg-gradient-to-br from-[#1C1C28] to-[#252634] border-brand-500/30"
            : "bg-dark-card border-dark-border"
        }`}
      >
        {isCovered && (
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none -mr-8 -mt-8"></div>
        )}

        <div className="flex items-start justify-between relative z-10">
          <div>
            <div
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold mb-4 tracking-wide ${
                isCovered
                  ? "bg-brand-500/20 text-brand-400 border border-brand-500/30"
                  : "bg-gold-500/20 text-gold-400 border border-gold-500/30"
              }`}
            >
              {isCovered ? "✅ ACTIVE COVERAGE" : "⚠️ ACTION NEEDED"}
            </div>

            <h2 className="text-3xl font-black text-white">
              {isCovered ? "You are covered" : "No active policy"}
            </h2>

            <p className="text-sm text-gray-400 mt-2">
              {isCovered
                ? "Your income is protected against disruptions."
                : "Buy a weekly policy to protect your earnings."}
            </p>

            {/* Full policy details now live here, once, not inside the events loop */}
            {isCovered && (
              <div className="mt-5 space-y-1">
                <p className="text-sm text-gray-300">
                  <strong>Plan:</strong> {data?.policyTier}
                </p>

                <p className="text-sm text-gray-300">
                  <strong>Weekly Cover:</strong> ₹{data?.weeklyCoverage}
                </p>

                <p className="text-sm text-gray-300">
                  <strong>Daily Cover:</strong> ₹{data?.dailyCoverage}
                </p>

                <p className="text-sm text-gray-300">
                  <strong>Coverage:</strong> {data?.coverageStart}
                  {" → "}
                  {data?.coverageEnd}
                </p>

                <p className="text-sm text-gray-300">
                  <strong>Total Claims:</strong> {data?.claimCount}
                </p>

                <p className="text-sm text-gray-300">
                  <strong>Total Payout:</strong> ₹{data?.totalPayout}
                </p>
              </div>
            )}
          </div>

          {isCovered ? (
            <div className="p-3 rounded-2xl bg-brand-500/20 border border-brand-500/30">
              <Shield className="w-8 h-8 text-brand-500" />
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-dark-highlight border border-dark-border">
              <Shield className="w-8 h-8 text-gray-500" />
            </div>
          )}
        </div>

        {!isCovered ? (
          <button
            onClick={() => navigate("/plans")}
            className="flex items-center justify-center w-full px-5 py-4 mt-6 text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-brand-500 rounded-xl"
          >
            View Plans
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        ) : (
          <button
            onClick={() => navigate("/file-claim")}
            className="flex items-center justify-center w-full px-5 py-4 mt-6 text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-brand-500 rounded-xl"
          >
            File Claim
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        )}
      </div>

      {/* Active Events */}
      <div>
        <h3 className="mb-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
          Live Threat Level
        </h3>

        {events.length > 0 ? (
          <div className="space-y-4">
            {events.map((event) => {
              const severity = getSeverity(event.severityValue);
              const formattedDate = new Date(
                event.triggeredAt
              ).toLocaleString();

              return (
                <div
                  key={event.id}
                  className="flex p-5 bg-[#2E1A1A] border border-[#ff4d4d]/20 rounded-3xl shadow-lg relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#ff4d4d]/10 rounded-full blur-xl pointer-events-none -mr-4 -mt-4"></div>

                  <div className="flex-shrink-0 p-3 bg-[#ff4d4d]/20 rounded-2xl border border-[#ff4d4d]/20 self-start z-10">
                    {getEventIcon(event.eventType)}
                  </div>

                  <div className="ml-4 flex-1 z-10">
                    <h4 className="text-base font-bold text-white mb-1">
                      {event.eventType.replaceAll("_", " ")}
                    </h4>

                    <p className="text-sm text-[#ff9999]">
                      Zone: <strong>{event.zoneName}</strong>
                    </p>

                    <div
                      className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold text-white ${severity.color}`}
                    >
                      {severity.text}
                    </div>

                    <p className="text-xs text-gray-400 mt-1">
                      Triggered: {formattedDate}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center p-5 bg-dark-card border border-dark-border rounded-3xl shadow-sm">
            <div className="p-3 bg-green-500/10 rounded-2xl border border-green-500/20">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>

            <div className="ml-4">
              <h4 className="text-base font-bold text-white">All Clear</h4>

              <p className="text-sm text-gray-400">
                No active disruptions in your zone.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Recent Claims */}
      <div>
        <h3 className="mb-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
          Recent Claims
        </h3>

        {claims.length > 0 ? (
          <div className="space-y-3">
            {claims.map((claim) => {
              const formattedClaimDate = claim.createdAt
                ? new Date(claim.createdAt).toLocaleDateString()
                : null;

              return (
                <div
                  key={claim.claimId}
                  className="bg-dark-card border border-dark-border rounded-2xl p-4"
                >
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-bold text-white">
                        Claim #{claim.claimId}
                      </h4>

                      <p className="text-sm text-gray-400">
                        {claim.disruptionType}
                      </p>

                      {formattedClaimDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          {formattedClaimDate}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-brand-400">
                        ₹{claim.payoutAmount}
                      </p>

                      <p className="text-xs text-gray-400">
                        {claim.claimStatus}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-dark-card rounded-2xl p-6 text-center text-gray-400">
            No claims yet.
          </div>
        )}
      </div>

      {/* Dashboard Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-5 bg-dark-card border border-dark-border rounded-3xl">
          <p className="text-xs uppercase text-gray-500 mb-2">
            Total Claims
          </p>

          <p className="text-3xl font-black text-white">
            {data?.claimCount}
          </p>
        </div>

        <div className="p-5 bg-dark-card border border-dark-border rounded-3xl">
          <p className="text-xs uppercase text-gray-500 mb-2">
            Total Payout
          </p>

          <p className="text-3xl font-black text-green-500">
            ₹{data?.totalPayout}
          </p>
        </div>
      </div>
    </div>
  );
}