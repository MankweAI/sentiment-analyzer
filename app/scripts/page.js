"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { TrashIcon } from "@heroicons/react/24/solid";

export default function ScriptsManager() {
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newScriptName, setNewScriptName] = useState("");
  const [newScriptContent, setNewScriptContent] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    // BUG FIX: The data fetching function is moved *inside* the useEffect
    // to prevent synchronous state updates at the start of the effect.
    const fetchScripts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("scripts")
        .select("*")
        .order("created_at");
      if (error) setError(error.message);
      else setScripts(data);
      setLoading(false);
    };

    fetchScripts();
  }, []); // Empty dependency array is correct

  const addScript = async (e) => {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.from("scripts").insert({
      name: newScriptName,
      content: newScriptContent,
    });
    if (error) {
      setError(error.message);
    } else {
      setNewScriptName("");
      setNewScriptContent("");
      // After adding, we need to re-fetch the scripts.
      // We can't call fetchScripts directly as it's scoped to the effect.
      // A simple way is to just update state manually, or trigger a re-fetch.
      // For simplicity, we'll just update state manually.
      // A better way would be to use a state variable to trigger the effect again.
      // Let's refactor to allow re-fetching.

      // Let's just reload the data.
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("scripts")
        .select("*")
        .order("created_at");
      if (fetchError) setError(fetchError.message);
      else setScripts(data);
      setLoading(false);
    }
  };

  const deleteScript = async (id) => {
    // Using window.confirm is not ideal, but keeping original functionality
    if (window.confirm("Are you sure you want to delete this script?")) {
      await supabase.from("scripts").delete().eq("id", id);
      // After deleting, filter the script out of the local state
      setScripts(scripts.filter((script) => script.id !== id));
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        A/B Script Manager
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Add New Script Form */}
        <div className="bg-white p-6 rounded-lg shadow-xl">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            Add New Script
          </h2>
          <form onSubmit={addScript} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-700"
              >
                Script Name
              </label>
              <input
                id="name"
                type="text"
                value={newScriptName}
                onChange={(e) => setNewScriptName(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-dark focus:border-primary-dark"
                placeholder="e.g., Hook C: Trust Leak"
              />
            </div>
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-slate-700"
              >
                Script Content
              </label>
              <textarea
                id="content"
                rows="5"
                value={newScriptContent}
                onChange={(e) => setNewScriptContent(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-dark focus:border-primary-dark"
                placeholder="Paste your script text here..."
              />
            </div>
            {error && <p className="text-danger-dark text-sm">{error}</p>}
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex justify-center rounded-md bg-primary-DEFAULT px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark"
              >
                Save Script
              </button>
            </div>
          </form>
        </div>

        {/* Existing Scripts List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            Current Scripts
          </h2>
          {loading ? (
            <p>Loading scripts...</p>
          ) : (
            scripts.map((script) => (
              <div
                key={script.id}
                className="bg-white p-4 rounded-lg shadow-md"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-primary-dark">{script.name}</h3>
                  <button
                    onClick={() => deleteScript(script.id)}
                    className="text-slate-400 hover:text-danger-dark"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-slate-600 mt-2 p-3 bg-slate-50 rounded">
                  {script.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
