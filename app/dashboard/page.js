"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  ChartBarIcon,
  CursorArrowRaysIcon,
  ChatBubbleBottomCenterIcon,
  FireIcon,
} from "@heroicons/react/24/solid";

const INITIAL_TALLY = {
  totalCalls: 0,
  totalConnected: 0,
  meetingBooked: 0,
  attention: { Engaged: 0, "Not-engaged": 0, "Hung-up": 0 },
  objections: {},
  interestPeaks: {},
  sentiments: { Positive: 0, Neutral: 0, Negative: 0 },
};

export default function SentimentReport() {
  const [tally, setTally] = useState(INITIAL_TALLY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

useEffect(() => {
  // 1. Move the function *inside* the useEffect
  const fetchTallyData = async () => {
    setLoading(true);
    setError(null);

    const { data: logs, error } = await supabase
      .from("outreach_logs")
      .select("*");

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Reset tally to avoid double counting on re-fetch
    const newTally = {
      totalCalls: logs.length,
      totalConnected: 0,
      meetingBooked: 0,
      attention: { Engaged: 0, "Not-engaged": 0, "Hung-up": 0 },
      objections: {},
      interestPeaks: {},
      sentiments: { Positive: 0, Neutral: 0, Negative: 0 },
    };

    logs.forEach((log) => {
      // 1. Hook Attention
      if (log.hook_attention) {
        newTally.attention[log.hook_attention] =
          (newTally.attention[log.hook_attention] || 0) + 1;
      }

      // 2. Objections
      if (log.objections && Array.isArray(log.objections)) {
        log.objections.forEach((obj) => {
          newTally.objections[obj] = (newTally.objections[obj] || 0) + 1;
        });
      }

      // 3. Outcomes & Total Connections
      if (log.outcome === "Meeting Booked") {
        newTally.meetingBooked += 1;
      }
      if (log.call_result === "Connected") {
        newTally.totalConnected += 1;
      }

      // 4. Hook Interest Peak
      if (log.hook_interest_peak) {
        newTally.interestPeaks[log.hook_interest_peak] =
          (newTally.interestPeaks[log.hook_interest_peak] || 0) + 1;
      }

      // 5. Prospect Sentiment
      if (log.prospect_sentiment) {
        newTally.sentiments[log.prospect_sentiment] =
          (newTally.sentiments[log.prospect_sentiment] || 0) + 1;
      }
    });

    setTally(newTally);
    setLoading(false);
  };

  // 2. Call the inner function
  fetchTallyData();
}, []);

  const callToMeetingRate =
    tally.totalConnected > 0
      ? ((tally.meetingBooked / tally.totalConnected) * 100).toFixed(1)
      : 0;

  const sortedObjections = Object.entries(tally.objections).sort(
    ([, a], [, b]) => b - a
  );
  const sortedInterestPeaks = Object.entries(tally.interestPeaks).sort(
    ([, a], [, b]) => b - a
  );

  if (loading) {
    return (
      <p className="text-slate-600 animate-pulse">Loading sentiment data...</p>
    );
  }

  if (error) {
    return (
      <div className="bg-danger-light border border-danger-dark text-danger-dark px-4 py-3 rounded mb-4">
        <p className="font-bold">Error loading data:</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        Sentiment Tally Dashboard
      </h1>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <StatCard
          title="Total Calls Logged"
          value={tally.totalCalls}
          color="primary-dark"
        />
        <StatCard
          title="Total Connected"
          value={tally.totalConnected}
          color="slate-900"
        />
        <StatCard
          title="Meetings Booked"
          value={tally.meetingBooked}
          color="status-meeting"
        />
        <StatCard
          title="Conn. to Meeting Rate"
          value={`${callToMeetingRate}%`}
          color="status-meeting"
        />
      </div>

      {/* Sentiment Analysis Grids */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TallyCard title="Hook Attention (What)" icon={CursorArrowRaysIcon}>
          <Bar
            barColor="bg-primary-DEFAULT"
            label="Engaged"
            value={tally.attention["Engaged"]}
            total={tally.totalConnected}
          />
          <Bar
            barColor="bg-cta-DEFAULT"
            label="Not-engaged"
            value={tally.attention["Not-engaged"]}
            total={tally.totalConnected}
          />
          <Bar
            barColor="bg-danger-DEFAULT"
            label="Hung-up"
            value={tally.attention["Hung-up"]}
            total={tally.totalConnected}
          />
        </TallyCard>

        <TallyCard
          title="Top Objections (Why Not)"
          icon={ChatBubbleBottomCenterIcon}
        >
          {sortedObjections.length > 0 ? (
            sortedObjections.map(([objection, count]) => (
              <TallyRow key={objection} label={objection} value={count} />
            ))
          ) : (
            <p className="text-slate-500">No objections logged yet.</p>
          )}
        </TallyCard>

        <TallyCard title="Hook Interest Peak (The 'Aha!')" icon={FireIcon}>
          {sortedInterestPeaks.length > 0 ? (
            sortedInterestPeaks.map(([peak, count]) => (
              <TallyRow key={peak} label={peak} value={count} />
            ))
          ) : (
            <p className="text-slate-500">No interest peaks logged yet.</p>
          )}
        </TallyCard>
      </div>
    </div>
  );
}

// --- Reusable Dashboard Components ---
const StatCard = ({ title, value, color }) => (
  <div
    className={`bg-white p-5 rounded-lg shadow-md border-t-4 border-${color}`}
  >
    <p className="text-sm font-medium text-slate-500">{title}</p>
    <p className={`text-4xl font-bold text-slate-900 mt-1`}>{value}</p>
  </div>
);

const TallyCard = ({ title, icon: Icon, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="flex items-center gap-3">
      <Icon className="w-7 h-7 text-primary-dark" />
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
    </div>
    <div className="mt-6 space-y-4">{children}</div>
  </div>
);

const TallyRow = ({ label, value }) => (
  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
    <p className="font-medium text-slate-700">{label}</p>
    <p className="text-xl font-mono font-semibold text-slate-900">{value}</p>
  </div>
);

const Bar = ({ label, value, total, barColor }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-base font-medium text-slate-700">{label}</span>
        <span className="text-sm font-medium text-slate-900">
          {value} / {total}
        </span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-3">
        <div
          className={`${barColor} h-3 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};
