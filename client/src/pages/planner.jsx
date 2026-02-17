import { useState, useEffect } from "react";
import { apiRequest } from "../services/api";

export default function Planner() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: "", category: "DSA" });
  const [loading, setLoading] = useState(true);

  // Load tasks on mount
  useEffect(() => {
    const fetchTasks = async () => {
      const token = localStorage.getItem("token");
      try {
        const data = await apiRequest("/tasks", "GET", null, token);
        setTasks(data || []);
      } catch (err) {
        console.error("Failed to load tasks", err);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    
    const token = localStorage.getItem("token");
    try {
      const savedTask = await apiRequest("/tasks", "POST", newTask, token);
      setTasks([savedTask, ...tasks]);
      setNewTask({ title: "", category: "DSA" });
    } catch (err) {
      console.error("Failed to save task", err);
      alert("Failed to add task: " + err.message);
    }
  };

  const toggleTask = async (id) => {
    const token = localStorage.getItem("token");
    const taskToUpdate = tasks.find((t) => t._id === id);
    if (!taskToUpdate) return;

    // Optimistic update
    setTasks(
      tasks.map((t) =>
        t._id === id ? { ...t, isCompleted: !t.isCompleted } : t
      )
    );

    try {
      await apiRequest(
        `/tasks/${id}`,
        "PATCH",
        { isCompleted: !taskToUpdate.isCompleted },
        token
      );
    } catch (err) {
      console.error("Failed to update task", err);
      // Revert on error
      setTasks(
        tasks.map((t) =>
          t._id === id ? { ...t, isCompleted: taskToUpdate.isCompleted } : t
        )
      );
    }
  };

  const deleteTask = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await apiRequest(`/tasks/${id}`, "DELETE", null, token);
      setTasks(tasks.filter((t) => t._id !== id));
    } catch (err) {
      console.error("Failed to delete task", err);
      alert("Failed to delete task");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-1">
          Preparation Planner
        </h1>
        <p className="text-muted">Stay on top of your interview prep</p>
      </div>

      {/* Quick Add Form */}
      <form
        onSubmit={addTask}
        className="card p-5 mb-8 flex flex-col md:flex-row gap-3"
      >
        <input
          type="text"
          placeholder="New task (e.g. Update resume)..."
          className="field flex-1"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          required
        />
        <select
          className="field md:w-40"
          value={newTask.category}
          onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
        >
          <option>DSA</option>
          <option>Resume</option>
          <option>Application</option>
        </select>
        <button type="submit" className="btn-primary">
          Add Task
        </button>
      </form>

      {/* Task List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <div className="loading-spinner mx-auto mb-3"></div>
            <p className="text-muted">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-muted">No tasks yet. Add your first task above!</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task._id}
              className="card p-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={task.isCompleted}
                  onChange={() => toggleTask(task._id)}
                  className="h-5 w-5 accent-amber-500 rounded cursor-pointer flex-shrink-0"
                />
                <span
                  className={`${task.isCompleted ? "line-through text-muted" : ""} font-medium truncate`}
                >
                  {task.title}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="chip chip-neutral text-xs uppercase">
                  {task.category}
                </span>
                <button
                  onClick={() => deleteTask(task._id)}
                  className="text-red-400 hover:text-red-300 text-sm transition"
                  title="Delete task"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
