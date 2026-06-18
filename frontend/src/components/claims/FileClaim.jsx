import { useState, useEffect } from "react";
import toast from "react-hot-toast";

import { eventApi, claimsApi } from "../../services/api";
import { useAuthStore } from "../../store/useAuthStore";

export default function FileClaim() {
  const user = useAuthStore((state) => state.user);

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [loading, setLoading] = useState(false);
  const [claimResult, setClaimResult] = useState(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await eventApi.getEvents();

      console.log("Events:", data);

      setEvents(data);
    } catch (error) {
      console.error(error);

      toast.error("Failed to load events");
    }
  };

  const handleClaim = async () => {
    try {
      if (!selectedEvent) {
        toast.error("Please select an event");
        return;
      }

      setLoading(true);

      // Replace with actual active policy ID later
      const policyId = 1;

      const response = await claimsApi.createClaim(
        user.id,
        policyId,
        Number(selectedEvent)
      );

      console.log(response);

      setClaimResult(response);

      toast.success("Claim Submitted Successfully");
    } catch (error) {
      console.error(error);

      toast.error("Claim Submission Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 text-white">

      <h1 className="text-3xl font-bold mb-6">
        File Claim
      </h1>

      {/* Event Selection */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-6">

        <h2 className="text-xl font-semibold mb-4">
          Select Disruption Event
        </h2>

        <div className="space-y-3">

          {events.map((event) => (
            <label
              key={event.id}
              className="flex items-center gap-3 p-4 rounded-xl bg-dark-highlight cursor-pointer"
            >
              <input
                type="radio"
                name="event"
                value={event.id}
                onChange={(e) =>
                  setSelectedEvent(e.target.value)
                }
              />

              <div>
                <p className="font-semibold">
                  {event.eventType}
                </p>

                <p className="text-sm text-gray-400">
                  Zone: {event.zoneName}
                </p>
              </div>
            </label>
          ))}
        </div>

        <button
          onClick={handleClaim}
          disabled={loading}
          className="mt-6 w-full py-3 rounded-xl bg-brand-500 font-bold"
        >
          {loading
            ? "Processing..."
            : "Submit Claim"}
        </button>
      </div>

      {/* Claim Result */}
      {claimResult && (
        <div className="mt-8 bg-dark-card border border-dark-border rounded-2xl p-6">

          <h2 className="text-xl font-bold mb-4">
            Claim Result
          </h2>

          <div className="space-y-2">

            <p>
              <strong>Claim ID:</strong>{" "}
              {claimResult.claimId}
            </p>

            <p>
              <strong>Severity:</strong>{" "}
              {claimResult.severityClass}
            </p>

            <p>
              <strong>Estimated Loss:</strong> ₹
              {claimResult.estimatedLoss}
            </p>

            <p>
              <strong>Fraud Score:</strong>{" "}
              {claimResult.fraudScore}
            </p>

            <p>
              <strong>Fraud Decision:</strong>{" "}
              {claimResult.fraudDecision}
            </p>

            <p>
              <strong>Payout Amount:</strong> ₹
              {claimResult.payoutAmount}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {claimResult.claimStatus}
            </p>

          </div>
        </div>
      )}
    </div>
  );
}