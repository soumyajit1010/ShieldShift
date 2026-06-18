import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { policyApi } from "../../services/api";
import { useAuthStore } from "../../store/useAuthStore";
import {
  Bot,
  MapPin,
  Zap,
  ArrowRight,
  Loader2,
  CloudRain,
  Sun,
  Wind,
} from "lucide-react";

export default function PlanSelection() {

   const user = useAuthStore(
    (state) => state.user
  );

  console.log(user);

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const navigate = useNavigate();

  

  useEffect(() => {
    async function loadPlans() {
      try {
        const data = await policyApi.getPlans();

        setPlans(data);

        if (data.length > 0) {
          setSelectedPlan(data[1] || data[0]);
        }
      } catch (err) {
        toast.error("Failed to load plans");
      } finally {
        setLoading(false);
      }
    }

    loadPlans();
  }, []);

  const handlePurchase = async (planId) => {
    setPurchasingId(planId);

    try {
      const tierMap = {
        basic: "BASIC",
        standard: "STANDARD",
        pro: "PRO",
      };

      await policyApi.purchasePlan(user.id, tierMap[planId]);

      toast.success("Policy Activated!");

      navigate("/dashboard");
    } catch (err) {
      console.error(err);

      toast.error("Failed to activate policy");
    } finally {
      setPurchasingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 animate-spin rounded-full border-4 border-dark-border border-t-brand-500" />
      </div>
    );
  }

  // We highlight the 'Standard' plan as the primary focus to match the screenshot style
  const highlightedPlan = plans.find((p) => p.id === "standard") || plans[0];

  return (
    <div className="flex flex-col min-h-screen space-y-6">
      <div className="flex items-center justify-between pb-2">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 font-display">
            Choose your <br /> cover
          </h1>
          <p className="text-sm text-gray-400">
            Personalised for your zone & this week's forecast
          </p>
        </div>
        {highlightedPlan.badge && (
          <div className="px-3 py-1.5 border border-gold-500/30 bg-gold-500/10 rounded-full flex items-center shadow-[0_0_15px_rgba(250,204,21,0.15)]">
            <div className="w-2 h-2 rounded-full bg-gold-400 mr-2 animate-pulse"></div>
            <span className="text-[10px] font-bold tracking-wider text-gold-400 uppercase">
              {highlightedPlan.badge}
            </span>
          </div>
        )}
      </div>

      {/* AI Risk Assessment Card */}
      <div className="p-5 border bg-dark-card border-dark-border rounded-3xl shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

        <div className="flex items-start justify-between mb-4 relative z-10">
          <div className="flex items-center">
            <div className="p-1.5 bg-brand-500/10 rounded-lg mr-3 shadow-sm border border-brand-500/20">
              <Bot className="w-5 h-5 text-brand-500" />
            </div>
            <h3 className="font-bold text-gold-500 text-md">
              AI Risk Assessment
            </h3>
          </div>
          <span className="text-xs text-brand-400 mt-1 flex items-center bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/20">
            <MapPin className="w-3 h-3 mr-1" /> Bengaluru
          </span>
        </div>

        <div className="mb-4 flex items-end justify-between relative z-10">
          <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
            Current Risk Score
          </span>
          <span className="text-3xl font-black text-gold-500 italic tracking-tighter leading-none">
            74
          </span>
        </div>

        <div className="flex h-1.5 rounded-full overflow-hidden bg-dark-border mb-6 relative z-10">
          <div className="w-[74%] bg-gradient-to-r from-brand-600 to-brand-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
        </div>

        {/* 7-Day Forecast Text Box */}
        <div className="mb-6 p-4 bg-dark-highlight border border-dark-border rounded-2xl relative z-10">
          <h4 className="flex items-center text-xs font-bold text-gray-300 uppercase tracking-wide mb-2">
            <CloudRain className="w-4 h-4 mr-1.5 text-blue-400" />
            7-Day Prediction
          </h4>
          <p className="text-sm text-gray-400 leading-relaxed">
            <strong className="text-white">85% chance</strong> of severe
            waterlogging in your primary zones due to continuous monsoons. High
            expected impact on delivery times and earnings.
          </p>
        </div>

        <div className="flex gap-2 w-full overflow-x-auto no-scrollbar relative z-10">
          <div className="flex items-center px-3 py-1.5 bg-dark-bg/50 border border-dark-border/80 rounded-full shrink-0">
            <CloudRain className="w-3.5 h-3.5 text-blue-400 mr-1.5" />
            <span className="text-xs text-gray-300">Rain: High</span>
          </div>
          <div className="flex items-center px-3 py-1.5 bg-dark-bg/50 border border-dark-border/80 rounded-full shrink-0">
            <Sun className="w-3.5 h-3.5 text-brand-400 mr-1.5" />
            <span className="text-xs text-gray-300">Heat: Medium</span>
          </div>
          <div className="flex items-center px-3 py-1.5 bg-dark-bg/50 border border-dark-border/80 rounded-full shrink-0">
            <Wind className="w-3.5 h-3.5 text-purple-400 mr-1.5" />
            <span className="text-xs text-gray-300">AQI: Low</span>
          </div>
        </div>
      </div>

      {/* Plans List */}
      <div className="space-y-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => setSelectedPlan(plan)}
            className={`cursor-pointer p-6 rounded-3xl border transition-all duration-300

      ${
        selectedPlan?.id === plan.id
          ? "border-brand-500 shadow-[0_0_20px_rgba(239,68,68,0.25)]"
          : "border-dark-border"
      }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>

                <p className="text-sm text-gray-400 mt-1">{plan.label}</p>
              </div>

              <div className="text-right">
                <div className="text-3xl font-black text-white">
                  ₹{plan.aiPrice}
                </div>

                <div className="text-xs text-gray-500">per week</div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-dark-highlight rounded-xl p-3">
                <p className="text-xs text-gray-400">Daily Cover</p>

                <p className="font-bold text-green-500">₹{plan.maxDaily}</p>
              </div>

              <div className="bg-dark-highlight rounded-xl p-3">
                <p className="text-xs text-gray-400">Weekly Cover</p>

                <p className="font-bold text-brand-400">₹{plan.maxWeekly}</p>
              </div>
            </div>

            {plan.badge && (
              <div className="mt-4 inline-flex px-3 py-1 rounded-full text-xs font-bold bg-brand-500/10 text-brand-400">
                {plan.badge}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Sticky Bottom Action Bar matching the screenshot */}
      {selectedPlan && (
        <div className="border-t border-dark-border pt-5 pb-8 mt-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-white">Selected Plan</h3>

              <p className="text-gray-400">{selectedPlan.name}</p>
            </div>

            <div className="flex justify-between mb-4">
              <div>
                <p className="text-gray-400 text-sm">Premium</p>

                <p className="text-3xl font-black text-brand-500">
                  ₹{selectedPlan.aiPrice}
                </p>
              </div>

              <div className="text-right">
                <p className="text-gray-400 text-sm">Weekly Coverage</p>

                <p className="text-xl font-bold text-green-500">
                  ₹{selectedPlan.maxWeekly}
                </p>
              </div>
            </div>

            <button
              onClick={() => handlePurchase(selectedPlan.id)}
              disabled={purchasingId !== null}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-bold"
            >
              {purchasingId === selectedPlan.id ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                `Activate ${selectedPlan.name} Cover`
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
