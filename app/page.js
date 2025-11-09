"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  PhoneIcon,
  PencilSquareIcon,
  UserCircleIcon,
  MapPinIcon,
} from "@heroicons/react/24/solid";
import CallSuitModal from "@/components/CallSuitModal"; // Assuming this path is correct based on jsconfig.json
// Note: The original file list had CallSuitModal.js and QuickLogModal.js with identical code.
// I am using CallSuitModal as it seems to be the one intended for use.

export default function ProspectList() {
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProspect, setSelectedProspect] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // BUG FIX: The data fetching function is moved *inside* the useEffect
    // to prevent synchronous state updates at the start of the effect.
    const fetchProspects = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("prospects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching prospects:", error.message || error);
        setError(error.message);
      } else {
        setProspects(data);
      }
      setLoading(false);
    };

    fetchProspects();
  }, []); // Empty dependency array is correct

  const handleCallClick = (prospect) => {
    setSelectedProspect(prospect);
  };

  const handleEditClick = (id) => {
    // Navigate to the edit page
    router.push(`/prospects/${id}/edit`);
  };

  const handleModalClose = () => {
    setSelectedProspect(null);
  };

  const handleLogSaved = () => {
    setSelectedProspect(null);
    // Re-fetch prospects to update status (e.g., "Pending" -> "Contacted")
    const fetchProspects = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("prospects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) setError(error.message);
      else setProspects(data);
      setLoading(false);
    };
    fetchProspects();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Meeting Booked":
        return "bg-status-meeting text-green-800";
      case "Contacted":
        return "bg-status-contacted text-blue-800";
      case "Pending":
      default:
        return "bg-status-pending text-amber-800";
    }
  };

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">
          Prospects (Call List)
        </h1>

        {loading && (
          <p className="text-slate-600 animate-pulse">Loading prospects...</p>
        )}
        {error && (
          <div className="bg-danger-light border border-danger-dark text-danger-dark px-4 py-3 rounded mb-4">
            <p>Error: {error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white shadow-xl rounded-lg overflow-hidden">
            <ul role="list" className="divide-y divide-slate-200">
              {prospects.map((prospect) => (
                <li
                  key={prospect.id}
                  className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 px-4 py-5 sm:px-6"
                >
                  <div className="flex min-w-0 gap-x-4">
                    <UserCircleIcon
                      className="h-12 w-12 flex-none text-slate-300"
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-auto">
                      <p className="text-sm font-semibold leading-6 text-slate-900">
                        {prospect.businessName}
                      </p>
                      <p className="mt-1 flex text-xs leading-5 text-slate-500">
                        <MapPinIcon className="h-4 w-4 text-slate-400 mr-1" />
                        {prospect.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-x-4">
                    <div className="hidden sm:flex sm:flex-col sm:items-end">
                      <p className="text-sm leading-6 text-slate-900">
                        {prospect.phone}
                      </p>
                      <p
                        className={`mt-1 text-xs leading-5 ${getStatusColor(
                          prospect.status
                        )} font-medium rounded-full px-2 py-0.5 inline-block`}
                      >
                        {prospect.status}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCallClick(prospect)}
                      className="rounded-md bg-cta-DEFAULT px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cta-dark"
                    >
                      <PhoneIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleEditClick(prospect.id)}
                      className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-200"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* The Call Suit Modal */}
      {selectedProspect && (
        <CallSuitModal
          prospect={selectedProspect}
          onClose={handleModalClose}
          onLogSaved={handleLogSaved}
        />
      )}
    </>
  );
}
