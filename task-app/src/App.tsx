import { useMemo, useState, type FormEvent } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { DateClickArg } from '@fullcalendar/interaction'
import type { EventClickArg } from '@fullcalendar/core'
import './App.css'
import type { Task } from './types'

const TODAY = new Date().toISOString().slice(0, 10)

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [draft, setDraft] = useState('')
  const [startDate, setStartDate] = useState(TODAY)
  const [endDate, setEndDate] = useState(TODAY)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const remainingCount = useMemo(
    () => tasks.filter((t) => !t.completed).length,
    [tasks]
  )

  const handleAddTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = draft.trim()
    if (!trimmed) return

    const newTask: Task = {
      id: crypto.randomUUID(),
      text: trimmed,
      completed: false,
      startDate,
      endDate: endDate < startDate ? startDate : endDate,
    }

    setTasks((prev) => [newTask, ...prev])
    setDraft('')
  }

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
  }

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  // Tasks that span the selected date (or all tasks if none selected)
  const visibleTasks = useMemo(() => {
    if (!selectedDate) return tasks
    return tasks.filter(
      (t) => t.startDate <= selectedDate && t.endDate >= selectedDate
    )
  }, [tasks, selectedDate])

  // FullCalendar event objects
  const calendarEvents = useMemo(
    () =>
      tasks.map((t) => ({
        id: t.id,
        title: t.text,
        start: t.startDate,
        // FullCalendar end date for all-day events is exclusive, so add 1 day
        end: addDay(t.endDate),
        classNames: t.completed ? ['fc-event--done'] : [],
      })),
    [tasks]
  )

  const handleDateClick = (arg: DateClickArg) => {
    const clicked = arg.dateStr
    setSelectedDate((prev) => (prev === clicked ? null : clicked))
  }

  const handleEventClick = (arg: EventClickArg) => {
    const dateStr = arg.event.startStr.slice(0, 10)
    setSelectedDate((prev) => (prev === dateStr ? null : dateStr))
  }

  return (
    <div className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">Task Radar</p>
          <h1>Focus on what matters.</h1>
          <p className="subtitle">
            Schedule tasks on a calendar and track your progress.
          </p>
        </div>
        <div className="stats">
          <div>
            <span className="stat-label">Remaining</span>
            <span className="stat-value">{remainingCount}</span>
          </div>
          <div>
            <span className="stat-label">Total</span>
            <span className="stat-value">{tasks.length}</span>
          </div>
        </div>
      </header>

      <div className="main-grid">
        {/* ---- Calendar ---- */}
        <section className="panel calendar-panel">
          <h2 className="panel-title">Calendar</h2>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={calendarEvents}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: '',
            }}
            height="auto"
          />
          {selectedDate && (
            <button
              className="clear-filter-btn"
              onClick={() => setSelectedDate(null)}
            >
              Showing {formatDate(selectedDate)} &mdash; clear filter
            </button>
          )}
        </section>

        {/* ---- Task List ---- */}
        <section className="panel task-panel">
          <h2 className="panel-title">
            {selectedDate
              ? `Tasks on ${formatDate(selectedDate)}`
              : 'All Tasks'}
          </h2>

          <form className="task-form" onSubmit={handleAddTask}>
            <label className="sr-only" htmlFor="task-input">New task</label>
            <input
              id="task-input"
              type="text"
              value={draft}
              placeholder="Task name"
              onChange={(e) => setDraft(e.target.value)}
              autoComplete="off"
              className="task-form__text"
            />
            <div className="task-form__dates">
              <label className="date-label">
                <span>Start</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </label>
              <label className="date-label">
                <span>End</span>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </label>
              <button type="submit" className="btn-add">Add</button>
            </div>
          </form>

          <div className="task-list" role="list">
            {visibleTasks.length === 0 ? (
              <div className="empty">
                <p>{selectedDate ? 'No tasks on this day.' : 'No tasks yet.'}</p>
                <span>
                  {selectedDate
                    ? 'Add a task with this date range to see it here.'
                    : 'Write your first task to get started.'}
                </span>
              </div>
            ) : (
              visibleTasks.map((task) => (
                <div className="task" key={task.id} role="listitem">
                  <div className="task-info">
                    <span
                      className={`task-text${task.completed ? ' task-text--done' : ''}`}
                    >
                      {task.text}
                    </span>
                    <span className="task-dates">
                      {formatDate(task.startDate)}
                      {task.endDate !== task.startDate &&
                        ` – ${formatDate(task.endDate)}`}
                    </span>
                  </div>
                  <span className="task-chip">
                    {task.completed ? 'Done' : 'Active'}
                  </span>
                  <button
                    className={task.completed ? 'btn-undo' : 'btn-done'}
                    onClick={() => toggleTask(task.id)}
                  >
                    {task.completed ? 'Undo' : 'Mark done'}
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => deleteTask(task.id)}
                    aria-label="Delete task"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

// Add one day to a YYYY-MM-DD string (for FullCalendar's exclusive end)
function addDay(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default App
