import { useState, useEffect } from "react";
import { apiRequest } from "../services/api";

export default function Planner() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: "", category: "DSA" });

  // Load tasks on mount
  useEffect(() => {
    // apiRequest('/tasks').then(setTasks).catch(console.error);
    // Mocking for now:
    setTasks([
      {
        _id: "1",
        title: "Solve 5 LeetCode Mediums",
        category: "DSA",
        isCompleted: false,
      },
    ]);
  }, []);

  const addTask = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const savedTask = await apiRequest("/tasks", "POST", newTask, token);
      setTasks([savedTask, ...tasks]);
      setNewTask({ title: "", category: "DSA" });
    } catch (err) {
      console.error("Failed to save task", err);
    }
  };

  const toggleTask = (id) => {
    setTasks(
      tasks.map((t) =>
        t._id === id ? { ...t, isCompleted: !t.isCompleted } : t,
      ),
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Preparation Planner
      </h1>

      {/* Quick Add Form */}
      <form
        onSubmit={addTask}
        className="flex gap-2 mb-8 bg-white p-4 rounded-lg shadow-sm"
      >
        <input
          type="text"
          placeholder="New task (e.g. Update resume)..."
          className="flex-1 border-gray-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
        />
        <select
          className="border-gray-200 rounded-md text-sm"
          value={newTask.category}
          onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
        >
          <option>DSA</option>
          <option>Resume</option>
          <option>Application</option>
        </select>
        <button className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700">
          Add
        </button>
      </form>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task._id}
            className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={task.isCompleted}
                onChange={() => toggleTask(task._id)}
                className="h-5 w-5 text-indigo-600 rounded"
              />
              <span
                className={`${task.isCompleted ? "line-through text-gray-400" : "text-gray-700"} font-medium`}
              >
                {task.title}
              </span>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-500 uppercase">
              {task.category}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
