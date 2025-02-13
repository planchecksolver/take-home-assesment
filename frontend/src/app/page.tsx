"use client";
import { useState, useEffect, useCallback } from "react";

// 🔧 Extracted API URL for cleaner config
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// 🟢 Progress Bar Component
const ProgressBar = ({ completed, failed, pending, total }: { completed: number; failed: number; pending: number; total: number }) => {
  return (
    <div className="relative w-full bg-gray-200 rounded-full h-6 overflow-hidden mt-4">
      {/* Failed (Red) */}
      <div className="absolute left-0 h-full bg-red-500 transition-all duration-300" style={{ width: `${(failed / total) * 100}%` }} />

      {/* Completed (Green) */}
      <div className="absolute h-full bg-green-500 transition-all duration-300" style={{ width: `${(completed / total) * 100}%`, left: `${(failed / total) * 100}%` }} />

      {/* Pending (Yellow) */}
      <div className="absolute h-full bg-yellow-500 transition-all duration-300" style={{ width: `${(pending / total) * 100}%`, left: `${((failed + completed) / total) * 100}%` }} />
    </div>
  );
};

export default function Home() {
  const [tasks, setTasks] = useState<{ [key: string]: string }>({});
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔍 Start processing tasks
  const startTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/start-tasks`, { method: "POST" });
      if (!response.ok) throw new Error("Failed to start tasks");
      const data = await response.json();
      console.log("Started tasks:", data.task_ids);
      setTasks(Object.fromEntries(data.task_ids.map((id: string) => [id, "pending"])));
    } catch (error) {
      setError("Could not start tasks. Please try again.");
      console.error(error);
    }
    setLoading(false);
  };

  // 🔄 Fetch task status
  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/status`);
      if (!response.ok) throw new Error("Failed to fetch task status");
      const data = await response.json();
      setTasks(data.tasks);
    } catch (error) {
      setError("Failed to retrieve task updates. Please check the backend.");
      console.error(error);
    }
  }, [setTasks]);

  // 📊 Get summary data
  const getTaskSummary = () => {
    const total = Object.keys(tasks).length;
    const completed = Object.values(tasks).filter((status) => status === "completed").length;
    const failed = Object.values(tasks).filter((status) => status === "failed").length;
    const pending = total - (completed + failed);
    return { total, completed, failed, pending };
  };

  const { total, completed, failed, pending } = getTaskSummary();

  // ⏳ Auto-update task status
  useEffect(() => {
    if (total > 0 && pending > 0) {
      const interval = setInterval(fetchStatus, 1000);
      return () => clearInterval(interval);
    }
  }, [pending]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <main className="text-center">
        {/* 🔘 Start Button */}
        <button
          onClick={startTasks}
          disabled={isLoading}
          className="inline-flex items-center bg-black justify-center gap-2 rounded-lg text-sm font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-white hover:bg-black/80 h-11 px-8 py-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
        >
          {isLoading ? "Starting tasks..." : "Start Process"}
        </button>

        {/* ⚠️ Error Message */}
        {error && <p className="text-red-600 mt-4">{error}</p>}

        {/* 🔄 Status Updates */}
        <div className="mt-6 w-full max-w-2xl">
          {total > 0 && (
            <div>
              <div className="mt-4 text-lg font-semibold">
                {isLoading && <p className="text-blue-600">Starting tasks...</p>}
                {!isLoading && pending > 0 && <p className="text-gray-600">🔄 Fetching task updates...</p>}
                {!isLoading && pending === 0 && <p className="text-black-600">Task processing completed!</p>}
                {!isLoading && pending === 0 && failed > 0 && <p className="text-red-600">⚠️ {Math.round((failed / total) * 100)}% of tasks failed.</p>}
              </div>

              {/* 📊 Task Summary */}
              <div className="mt-4 text-lg font-semibold">
                <p>Total Tasks: <span className="font-bold">{total}</span></p>
                <p className="text-green-600">✅ Completed: <span className="font-bold">{completed}</span></p>
                <p className="text-red-600">❌ Failed: <span className="font-bold">{failed}</span></p>
                <p className="text-yellow-600">⏳ Pending: <span className="font-bold">{pending}</span></p>
              </div>

              {/* 🔵 Progress Bar */}
              <ProgressBar completed={completed} failed={failed} pending={pending} total={total} />

              {/* 📋 Task Table */}
              <table className="w-full border-collapse border border-gray-300 mt-4 bg-white">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-300 px-4 py-2">Task ID</th>
                    <th className="border border-gray-300 px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(tasks).map(([taskId, status]) => (
                    <tr key={taskId} className="text-center">
                      <td className="border border-gray-300 px-4 py-2 text-xs">{taskId}</td>
                      <td className={`border border-gray-300 px-4 py-2 font-semibold ${status === "completed" ? "bg-green-100 text-green-600" :
                        status === "failed" ? "bg-red-100 text-red-600" :
                          "bg-yellow-100 text-yellow-600"}`}>
                        {status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
