"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { XMarkIcon } from "@heroicons/react/24/solid";

export default function CallSuitModal({ prospect, onClose, onLogSaved }) {
  const [activeTab, setActiveTab] = useState("gatekeeper");
  const [scripts, setScripts] = useState({ gatekeeper: "", owner: "" });
  const [log, setLog] = useState({
    script_used: "Hook B: Gatekeeper (10/10)",
    call_result: "Connected",
    hook_attention: "Engaged",
    hook_interest_peak: "N/A",
    prospect_sentiment: "Positive",
    objections: [],
    raw_objection: "",
    outcome: "Meeting Booked",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill scripts with our 10/10 hooks, replacing placeholders
  useEffect(() => {
    const painData =
      prospect.pain_data ||
      `your ${
        prospect.leaks.find((l) => l.includes("Trust")) || "low reviews"
      }`;
    const competitorPainData = "their high review count"; // Simplified

    setScripts({
      gatekeeper: `Yes, my name is Mankwe. I've just completed a competition report on Randburg plumbers and I see that Google is promoting ${prospect.competitor} over ${prospect.businessName}. I'm calling to share this data with the owner. Are they available?`,
      owner: `Ok great, I'll be quick. My name is Mankwe, and I've just done a competition report for Randburg plumbers. I noticed Google is showing your competitor, ${prospect.competitor}, to all new customers. I found it's because your website has ${painData}, while your competition has ${competitorPainData}. My job is to fix that. Are you the right person to discuss this with?`,
    });
  }, [prospect]);

  const handleLogChange = (e) => {
    const { name, value } = e.target;
    setLog((prev) => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (name, value) => {
    setLog((prev) => ({ ...prev, [name]: value }));
  };

  const handleObjectionChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setLog((prev) => ({ ...prev, objections: [...prev.objections, value] }));
    } else {
      setLog((prev) => ({
        ...prev,
        objections: prev.objections.filter((obj) => obj !== value),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    // 1. Save the outreach log
    const { error: logError } = await supabase.from("outreach_logs").insert({
      prospect_id: prospect.id,
      ...log,
    });

    if (logError) {
      setError(logError.message);
      setSubmitting(false);
      return;
    }

    // 2. Update the prospect's status
    const newStatus =
      log.outcome === "Meeting Booked" ? "Meeting Booked" : "Contacted";
    const { error: prospectError } = await supabase
      .from("prospects")
      .update({ status: newStatus })
      .eq("id", prospect.id);

    if (prospectError) {
      setError(prospectError.message);
      setSubmitting(false);
      return;
    }

    // 3. Success
    setSubmitting(false);
    onLogSaved(); // This refreshes the dashboard list and closes the modal
  };

  const objectionOptions = [
    "Too Busy",
    "No Budget",
    "Son/Nephew Does Website",
    "Happy with Directory",
    "Doesn't Trust Call",
    "Not Interested",
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-slate-900">
            Call Suit:{" "}
            <span className="text-primary-dark">{prospect.businessName}</span>
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-65px)]">
          {/* Left Side: Script */}
          <div className="w-1/2 p-6 overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-800">
              Section A: Universal Opener
            </h3>
            <p className="text-lg font-medium text-slate-700 mt-2 p-3 bg-slate-100 rounded-md">
              "Hi, I'm calling for the owner of {prospect.businessName}."
            </p>

            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700">
                Who Answered?
              </label>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => setActiveTab("gatekeeper")}
                  className={`py-2 px-4 rounded-lg font-semibold ${
                    activeTab === "gatekeeper"
                      ? "bg-cta-DEFAULT text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  Scenario 1: Gatekeeper
                </button>
                <button
                  onClick={() => setActiveTab("owner")}
                  className={`py-2 px-4 rounded-lg font-semibold ${
                    activeTab === "owner"
                      ? "bg-cta-DEFAULT text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  Scenario 2: Owner
                </button>
              </div>
            </div>

            {/* Gatekeeper Script */}
            <div
              className={`mt-4 space-y-4 ${
                activeTab !== "gatekeeper" ? "hidden" : ""
              }`}
            >
              <p className="text-sm font-medium text-slate-500">
                Gatekeeper says: "May I ask what this is regarding?"
              </p>
              <div className="p-3 bg-amber-50 border border-cta-dark rounded-md">
                <p className="text-lg font-medium text-cta-dark">
                  {scripts.gatekeeper}
                </p>
              </div>
            </div>

            {/* Owner Script */}
            <div
              className={`mt-4 space-y-6 ${
                activeTab !== "owner" ? "hidden" : ""
              }`}
            >
              <div className="p-3 bg-amber-50 border border-cta-dark rounded-md">
                <p className="text-lg font-medium text-cta-dark">
                  {scripts.owner}
                </p>
              </div>

              <h3 className="text-lg font-bold text-slate-800">
                Section B: Details (After "Yes")
              </h3>
              <p className="text-lg font-medium text-slate-700">
                "Great. As I mentioned, Google is showing {prospect.competitor}{" "}
                first. This is happening for two reasons:"
              </p>
              <ul className="list-disc list-inside space-y-2 text-lg">
                <li>
                  <span className="font-semibold">
                    "Your{" "}
                    {prospect.leaks.find((l) => l.includes("Trust")) ||
                      "low rating"}{" "}
                    is a 'Trust Leak'.
                  </span>{" "}
                  Customers will always go with a business with the highest
                  number of 5-star reviews."
                </li>
                <li>
                  "Your website *says* you're an expert, but it doesn't *prove*
                  it. This is why Google doesn't see you as an authority."
                </li>
              </ul>
              <p className="text-xl font-bold text-center text-slate-700 p-2 bg-slate-100 rounded-md">
                ...Are you still with me?
              </p>

              <h3 className="text-lg font-bold text-slate-800">
                Section C: Resolution (The USP)
              </h3>
              <p className="text-lg font-medium text-slate-700">
                "Great, thanks. So, here are some of the things that can
                **prove** to Google that you are a plumbing authority in
                Randburg. A person will search 'geyser installation cost
                randburg', instead of getting a 'Contact Us Now' form, they get
                a **'Geyser Cost Estimator'**. They search 'blocked drain
                Randburg', they get a **'Blocked Drain Diagnostic'** tool. These
                tools do two things: they tell Google that you are the
                authority, and they build trust. This is what will rank you
                higher."
              </p>

              <h3 className="text-lg font-bold text-slate-800">
                Section D: The Close
              </h3>
              <p className="text-lg font-medium text-slate-700 p-3 bg-green-50 border-green-300 border rounded-md">
                "I've prepared a 15-minute 'No-BS' strategy call to show you a
                demo of the exact 'Diagnostic Tool' that is capturing the
                clients you're missing. Do you have 15 minutes free tomorrow at
                10 AM?"
              </p>
            </div>
          </div>

          {/* Right Side: Log Form */}
          <form
            onSubmit={handleSubmit}
            className="w-1/2 p-6 bg-slate-50 border-l overflow-y-auto space-y-4"
          >
            <h3 className="text-xl font-bold text-slate-900">Post-Call Log</h3>

            <input
              type="hidden"
              name="script_used"
              value={
                activeTab === "gatekeeper" ? scripts.gatekeeper : scripts.owner
              }
            />

            <FormDropdown
              name="call_result"
              label="1. Call Result"
              value={log.call_result}
              onChange={handleLogChange}
              options={["Connected", "No Answer", "Gatekeeper"]}
            />

            <FormRadio
              name="hook_attention"
              label="2. Hook Attention"
              value={log.hook_attention}
              onChange={handleRadioChange}
              options={[
                { value: "Engaged", color: "primary" },
                { value: "Not-engaged", color: "cta" },
                { value: "Hung-up", color: "danger" },
              ]}
            />

            <FormDropdown
              name="hook_interest_peak"
              label="3. Hook Interest Peak"
              value={log.hook_interest_peak}
              onChange={handleLogChange}
              options={[
                "N/A",
                'At "Competition Report"',
                'At "Competitor Name"',
                'At "Pain Data (reviews)"',
                "At 'The ''Tool-First'' Idea'",
              ]}
            />

            <FormRadio
              name="prospect_sentiment"
              label="4. Prospect Sentiment"
              value={log.prospect_sentiment}
              onChange={handleRadioChange}
              options={[
                { value: "Positive", color: "primary" },
                { value: "Neutral", color: "cta" },
                { value: "Negative", color: "danger" },
              ]}
            />

            <FormCheckboxes
              name="objections"
              label="5. Objection(s)"
              options={objectionOptions}
              onChange={handleObjectionChange}
            />

            <div>
              <label
                htmlFor="raw_objection"
                className="block text-sm font-medium text-slate-700"
              >
                6. Raw Objection (Their exact words)
              </label>
              <textarea
                id="raw_objection"
                name="raw_objection"
                value={log.raw_objection}
                onChange={handleLogChange}
                rows="2"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>

            <FormDropdown
              name="outcome"
              label="7. Final Outcome"
              value={log.outcome}
              onChange={handleLogChange}
              options={["Meeting Booked", "Listened (No Meeting)", "Hung Up"]}
            />

            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-slate-700"
              >
                8. General Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={log.notes}
                onChange={handleLogChange}
                rows="3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>

            {error && <p className="text-danger-dark text-sm">{error}</p>}

            <div className="flex justify-end pt-4 border-t">
              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex justify-center rounded-md bg-primary-DEFAULT px-4 py-3 text-base font-semibold text-white shadow-sm hover:bg-primary-dark disabled:opacity-50"
              >
                {submitting ? "Saving Log..." : "Save Log & Close"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// --- Reusable Form Components ---
const FormDropdown = ({ name, label, value, onChange, options }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-slate-700">
      {label}
    </label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-dark focus:border-primary-dark"
    >
      {options.map((opt) => (
        <option key={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

const FormRadio = ({ name, label, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700">{label}</label>
    <div className="flex gap-2 mt-1">
      {options.map((opt) => (
        <button
          type="button"
          key={opt.value}
          onClick={() => onChange(name, opt.value)}
          className={`py-2 px-4 rounded-lg font-semibold text-sm ${
            value === opt.value
              ? `bg-${opt.color}-DEFAULT text-white`
              : "bg-slate-200 text-slate-700 hover:bg-slate-300"
          }`}
        >
          {opt.value}
        </button>
      ))}
    </div>
  </div>
);

const FormCheckboxes = ({ name, label, onChange, options }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700">{label}</label>
    <div className="mt-2 grid grid-cols-2 gap-2">
      {options.map((obj) => (
        <label key={obj} className="flex items-center space-x-2">
          <input
            type="checkbox"
            value={obj}
            onChange={onChange}
            className="rounded text-primary-dark focus:ring-primary-dark"
          />
          <span className="text-sm">{obj}</span>
        </label>
      ))}
    </div>
  </div>
);


