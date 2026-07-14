import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Loader2,
  CloudRain,
  CheckCircle2,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

import { eventApi, claimsApi } from "../../services/api";
import { useAuthStore } from "../../store/useAuthStore";

export default function FileClaim() {
  const user = useAuthStore((state) => state.user);

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [claimResult, setClaimResult] = useState(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoadingEvents(true);

      const data = await eventApi.getEvents();

      console.log("Events:", data);

      setEvents(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load disruption events");
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleClaim = async () => {
    if (!selectedEvent) {
      toast.error("Please select a disruption event.");
      return;
    }

    try {
      setSubmitting(true);

      // TODO: Replace with active policy from backend/dashboard
      const policyId = 1;

      const response = await claimsApi.createClaim(
        user.id,
        policyId,
        Number(selectedEvent)
      );

      console.log(response);

      setClaimResult(response);

      toast.success("Claim submitted successfully!");
    } catch (error) {
      console.error(error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to submit claim."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 text-white">

      <div className="mb-8">
        <h1 className="text-4xl font-black">
          File Claim
        </h1>

        <p className="text-gray-400 mt-2">
          Select an active disruption event and
          submit your insurance claim.
        </p>
      </div>

      {/* Loading */}

      {loadingEvents && (
        <div className="bg-dark-card border border-dark-border rounded-3xl p-10 flex flex-col items-center">

          <Loader2 className="w-10 h-10 animate-spin text-brand-500 mb-4" />

          <h2 className="text-xl font-bold">
            Loading Events...
          </h2>

        </div>
      )}

      {/* Empty */}

      {!loadingEvents && events.length === 0 && (
        <div className="bg-dark-card border border-dark-border rounded-3xl p-10 text-center">

          <TriangleAlert className="mx-auto w-12 h-12 text-yellow-500 mb-4" />

          <h2 className="text-2xl font-bold">
            No Active Disruptions
          </h2>

          <p className="text-gray-400 mt-3">
            There are currently no disruption events
            available for claim filing.
          </p>

        </div>
      )}

      {/* Events */}

      {!loadingEvents && events.length > 0 && (
        <div className="bg-dark-card border border-dark-border rounded-3xl p-6">

          <h2 className="text-2xl font-bold mb-6">
            Select Disruption Event
          </h2>

          <div className="space-y-4">

            {events.map((event) => (

              <label
                key={event.id}
                className={`block cursor-pointer rounded-2xl border p-5 transition-all

                ${
                  Number(selectedEvent) === event.id
                    ? "border-brand-500 bg-brand-500/10"
                    : "border-dark-border bg-dark-highlight hover:border-brand-500/50"
                }`}
              >

                <div className="flex items-start">

                  <input
                    type="radio"
                    name="event"
                    value={event.id}
                    checked={Number(selectedEvent) === event.id}
                    onChange={(e) =>
                      setSelectedEvent(e.target.value)
                    }
                    className="mt-1 mr-4"
                  />

                  <CloudRain className="w-8 h-8 text-brand-500 mr-4" />

                  <div>

                    <h3 className="text-lg font-bold">
                      {event.eventType}
                    </h3>

                    <p className="text-gray-400 mt-1">
                      Zone : {event.zoneName}
                    </p>

                    <p className="text-gray-400">
                      Severity : {event.severityValue}
                    </p>

                    <p className="text-green-400 mt-1 text-sm">
                      Verified Event
                    </p>

                  </div>

                </div>

              </label>

            ))}

          </div>

          <button
            onClick={handleClaim}
            disabled={submitting || claimResult}
            className="mt-8 w-full py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 font-bold disabled:opacity-60 flex justify-center items-center"
          >

            {submitting ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : claimResult ? (
              "Claim Submitted"
            ) : (
              "Submit Claim"
            )}

          </button>

        </div>
      )}

      {/* Claim Result */}

      {claimResult && (

        <div className="mt-8 rounded-3xl bg-green-500/10 border border-green-500 p-8">

          <div className="flex items-center mb-6">

            <CheckCircle2 className="w-8 h-8 text-green-500 mr-3" />

            <h2 className="text-3xl font-black text-green-400">
              Claim Submitted
            </h2>

          </div>

          <div className="grid md:grid-cols-2 gap-5">

            <div className="bg-dark-card rounded-xl p-5">
              <p className="text-gray-400 text-sm">Claim ID</p>
              <p className="text-2xl font-bold">
                #{claimResult.claimId}
              </p>
            </div>

            <div className="bg-dark-card rounded-xl p-5">
              <p className="text-gray-400 text-sm">Status</p>
              <p className="text-green-400 font-bold">
                {claimResult.claimStatus}
              </p>
            </div>

            <div className="bg-dark-card rounded-xl p-5">
              <p className="text-gray-400 text-sm">
                Severity
              </p>

              <p className="font-bold">
                {claimResult.severityClass}
              </p>

            </div>

            <div className="bg-dark-card rounded-xl p-5">
              <p className="text-gray-400 text-sm">
                Estimated Loss
              </p>

              <p className="font-bold">
                ₹{claimResult.estimatedLoss}
              </p>

            </div>

            <div className="bg-dark-card rounded-xl p-5">
              <p className="text-gray-400 text-sm">
                Fraud Score
              </p>

              <p className="font-bold">
                {claimResult.fraudScore}
              </p>

            </div>

            <div className="bg-dark-card rounded-xl p-5">
              <p className="text-gray-400 text-sm">
                Fraud Decision
              </p>

              <p className="font-bold">
                {claimResult.fraudDecision}
              </p>

            </div>

            <div className="md:col-span-2 bg-brand-500/10 rounded-xl p-6 border border-brand-500">

              <div className="flex items-center">

                <ShieldCheck className="w-7 h-7 text-brand-500 mr-3" />

                <div>

                  <p className="text-gray-400">
                    Approved Payout
                  </p>

                  <h3 className="text-4xl font-black text-brand-500">
                    ₹{claimResult.payoutAmount}
                  </h3>

                </div>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}