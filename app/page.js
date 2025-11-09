"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import CallSuitModal from "@/components/CallSuitModal";
import { PhoneIcon, PencilIcon, FireIcon } from "@heroicons/react/24/solid";

// Status Colors
const statusConfig = {
  Pending: { color: "border-status-pending", title: "Pending (To Call)" },
  Contacted: { color: "border-sky-500", title: "Contacted (Follow-up)" },
  "Meeting Booked": { color: "border-status-meeting", title: "Meeting Booked" },
  "Closed - Won": { color: "border-status-won", title: "Closed - Won" },
  "Closed - Lost": { color: "border-status-lost", title: "Closed - Lost" },
};

const columns = [
  "Pending",
  "Contacted",
  "Meeting Booked",
  "Closed - Won",
  "Closed - Lost",
];

export default function ProspectManager() {
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProspect, setSelectedProspect] = useState(null);

  // FIX: Function is declared *before* useEffect
  async function fetchProspects() {
    const { data, error } = await supabase
      .from("prospects")
      .select("*")
      .order("businessName", { ascending: true });

    if (error) {
      console.error("Error fetching prospects:", error.message || error);
    } else {
      setProspects(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchProspects();
  }, []);

  const handleLogSaved = () => {
    fetchProspects();
    setSelectedProspect(null);
  };

  const handleCloseModal = () => {
    setSelectedProspect(null);
  };

  async function updateStatus(id, newStatus) {
    // Optimistic update for UI speed
    setProspects((prevProspects) =>
      prevProspects.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
    // Update Supabase in the background
    const { error } = await supabase
      .from("prospects")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      console.error("Error updating status:", error.message);
      fetchProspects(); // Revert on error
    }
  }

  const getProspectsByStatus = (status) => {
    return prospects.filter((p) => p.status === status);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        Prospect Call List ({prospects.length})
      </h1>

      {loading ? (
        <p className="text-slate-600 animate-pulse">Loading prospects...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {columns.map((status) => {
            const config = statusConfig[status];
            const prospectsInColumn = getProspectsByStatus(status);
            return (
              <div key={status} className="bg-slate-200/60 rounded-lg p-3">
                <h2
                  className={`text-lg font-semibold text-slate-800 border-b-4 ${config.color} pb-2 mb-4`}
                >
                  {config.title} ({prospectsInColumn.length})
                </h2>
                <div className="space-y-4">
                  {prospectsInColumn.map((prospect) => (
                    <ProspectCard
                      key={prospect.id}
                      prospect={prospect}
                      onLogCall={() => setSelectedProspect(prospect)}
                      onUpdateStatus={updateStatus}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedProspect && (
        <CallSuitModal
          prospect={selectedProspect}
          onClose={handleCloseModal}
          onLogSaved={handleLogSaved}
        />
      )}
    </div>
  );
}

function ProspectCard({ prospect, onLogCall, onUpdateStatus }) {
  const { id, businessName, location, phone, leaks, competitor, status } =
    prospect;
  const config = statusConfig[status];

  return (
    <div
      className={`bg-white p-4 rounded-lg shadow-md border-l-4 ${config.color}`}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold text-slate-900">{businessName}</h3>
        <Link
          href={`/prospects/${id}/edit`}
          className="text-slate-400 hover:text-cta-dark"
        >
          <PencilIcon className="w-5 h-5" />
        </Link>
      </div>

      <p className="text-sm text-slate-600 -mt-2 mb-2">{location}</p>
      <a
        href={`tel:${phone}`}
        className="text-sm text-slate-800 font-mono flex items-center gap-2 hover:text-primary-dark"
      >
        <PhoneIcon className="w-4 h-4" />
        {phone}
      </a>

      <div className="mt-3 border-t pt-3">
        <h4 className="text-xs font-semibold text-slate-500 uppercase">
          Leak Analysis
        </h4>
        <ul className="list-disc list-inside mt-1">
          {leaks?.map((leak, i) => (
            <li
              key={i}
              className={`text-sm font-medium ${
                leak.includes("High")
                  ? "text-danger-dark"
                  : leak.includes("Medium")
                  ? "text-cta-dark"
                  : "text-primary-dark"
              }`}
            >
              {leak}
            </li>
          ))}
        </ul>
        <h4 className="text-xs font-semibold text-slate-500 uppercase mt-2">
          Competitor
        </h4>
        <p className="text-sm text-slate-700">{competitor}</p>
      </div>

      <div className="mt-4 space-y-3">
        {/* Status Dropdown */}
        <div>
          <label
            htmlFor={`status-${id}`}
            className="text-xs font-semibold text-slate-500 uppercase"
          >
            Status
          </label>
          <select
            id={`status-${id}`}
            value={status}
            onChange={(e) => onUpdateStatus(id, e.target.value)}
            className={`block w-full rounded-md border-gray-300 shadow-sm text-sm font-medium border-l-4 ${config.color}`}
          >
            {columns.map((col) => (
              <option key={col}>{col}</option>
            ))}
          </select>
        </div>

        {/* Log Call Button */}
        <button
          onClick={onLogCall}
          className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-cta-DEFAULT px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cta-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta-dark"
        >
          <FireIcon className="h-5 w-5" />
          Start Call / Log
        </button>
      </div>
    </div>
  );
}
