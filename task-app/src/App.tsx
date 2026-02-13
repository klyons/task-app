import { useMemo, useState, type FormEvent } from 'react'
import './App.css'

type Task = {
  id: string
  text: string
  completed: boolean
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [draft, setDraft] = useState('')

  const remainingCount = useMemo(
    () => tasks.filter((task) => !task.completed).length,
    [tasks]
  )

  const totalCount = tasks.length

  const handleAddTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = draft.trim()
    if (!trimmed) return

    const newTask: Task = {
      id: crypto.randomUUID(),
      text: trimmed,
      completed: false
    }

    setTasks((prev) => [newTask, ...prev])
    setDraft('')
  }

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    )
  }

  return (
    <div className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">Task Radar</p>
          <h1>Focus on what matters tonight.</h1>
          <p className="subtitle">
            Track quick wins with a calm, dark interface built for clarity.
          </p>
        </div>
        <div className="stats">
          <div>
            <span className="stat-label">Remaining</span>
            <span className="stat-value">{remainingCount}</span>
          </div>
          <div>
            <span className="stat-label">Total</span>
            <span className="stat-value">{totalCount}</span>
          </div>
        </div>
      </header>

      <section className="panel">
        <form className="task-form" onSubmit={handleAddTask}>
          <label className="sr-only" htmlFor="task-input">
            New task
          </label>
          <input
            id="task-input"
            type="text"
            value={draft}
            placeholder="Add a task"
            onChange={(event) => setDraft(event.target.value)}
            autoComplete="off"
          />
          <button type="submit">Add task</button>
        </form>

        <div className="task-list" role="list">
          {tasks.length === 0 ? (
            <div className="empty">
              <p>No tasks yet.</p>
              <span>Write your first task to get started.</span>
            </div>
          ) : (
            tasks.map((task) => (
              <label className="task" key={task.id}>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                />
                <span className="task-text">{task.text}</span>
                <span className="task-chip">
                  {task.completed ? 'Done' : 'Active'}
                </span>
              </label>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

export default App
