import React, { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(path, options) {
  const response = await fetch(`${API}${path}`, options);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed.");
  return data;
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadTasks(selectedFilter = filter) {
    try {
      const query =
        selectedFilter === "all" ? "" : `?isCompleted=${selectedFilter}`;
      setTasks(await request(`/api/tasks${query}`));
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadTasks(filter);
  }, [filter]);

  async function handleCreate(event) {
    event.preventDefault();
    setBusy(true);
    try {
      await request("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      setTitle("");
      setDescription("");
      await loadTasks();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleComplete(id) {
    setBusy(true);
    try {
      await request(`/api/tasks/${id}/complete`, { method: "PUT" });
      await loadTasks();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container">
      <header>
        <span className="eyebrow">MERN • CQRS EXERCISE</span>
        <h1>Task Management</h1>
        <p>Commands create and complete tasks. Queries read and filter them.</p>
      </header>

      <section className="panel" aria-labelledby="new-task-title">
        <h2 id="new-task-title">
          Create a task <span className="hint">Command</span>
        </h2>
        <form onSubmit={handleCreate}>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Learn CQRS"
            required
          />
          <label htmlFor="description">Description (optional)</label>
          <textarea
            id="description"
            rows="2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A short note"
          />
          <button type="submit" disabled={busy}>
            Add task
          </button>
        </form>
      </section>

      <section className="panel" aria-labelledby="tasks-title">
        <div className="toolbar">
          <h2 id="tasks-title">
            Tasks <span className="hint">Query</span>
          </h2>
          <label htmlFor="filter">Show:</label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="false">Not completed</option>
            <option value="true">Completed</option>
          </select>
        </div>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {tasks.length === 0 ? (
          <p className="empty">No tasks in this view.</p>
        ) : (
          <ul>
            {tasks.map((task) => (
              <li key={task.id}>
                <div>
                  <strong>{task.title}</strong>
                  {task.description && <p>{task.description}</p>}
                  <small>
                    {task.isCompleted ? "Completed" : "Not completed"}
                  </small>
                </div>
                {!task.isCompleted && (
                  <button
                    type="button"
                    className="secondary"
                    disabled={busy}
                    onClick={() => handleComplete(task.id)}
                  >
                    Complete
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
