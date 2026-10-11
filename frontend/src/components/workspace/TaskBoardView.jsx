import React, { useState, useEffect } from 'react'
import { Plus, Trash2, ArrowRight, ArrowLeft, Tag, Calendar, CheckCircle2, ListTodo, Sparkles } from 'lucide-react'

const DEFAULT_TASKS = [
  {
    id: 't-1',
    title: 'Update resume with ATS keywords & quantified metrics',
    tag: 'Resume',
    priority: 'High',
    column: 'todo',
    createdAt: 'Today',
  },
  {
    id: 't-2',
    title: 'Solve 3 Sliding Window & Two Pointer problems on DSA Sheets',
    tag: 'DSA',
    priority: 'High',
    column: 'todo',
    createdAt: 'Today',
  },
  {
    id: 't-3',
    title: 'Review System Design notes for URL Shortener & Caching',
    tag: 'System Design',
    priority: 'Medium',
    column: 'in_progress',
    createdAt: 'Yesterday',
  },
  {
    id: 't-4',
    title: 'Conduct 1 AI Mock Interview session on React & Concurrency',
    tag: 'Interview',
    priority: 'Medium',
    column: 'in_progress',
    createdAt: 'Yesterday',
  },
  {
    id: 't-5',
    title: 'Build & download developer portfolio using Portfolio Builder',
    tag: 'Portfolio',
    priority: 'High',
    column: 'done',
    createdAt: '2 days ago',
  },
  {
    id: 't-6',
    title: 'Review Operating Systems virtual memory, paging & deadlocks',
    tag: 'Core Subjects',
    priority: 'Low',
    column: 'done',
    createdAt: '3 days ago',
  },
]

export default function TaskBoardView() {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('devsunite_tasks')
      return saved ? JSON.parse(saved) : DEFAULT_TASKS
    } catch {
      return DEFAULT_TASKS
    }
  })

  const [activeModalCol, setActiveModalCol] = useState(null) // 'todo' | 'in_progress' | 'done' | null
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskTag, setNewTaskTag] = useState('DSA')
  const [newTaskPriority, setNewTaskPriority] = useState('High')

  // Save to localStorage whenever tasks change
  useEffect(() => {
    try {
      localStorage.setItem('devsunite_tasks', JSON.stringify(tasks))
    } catch (e) {
      console.error(e)
    }
  }, [tasks])

  const todoTasks = tasks.filter((t) => t.column === 'todo')
  const inProgressTasks = tasks.filter((t) => t.column === 'in_progress')
  const doneTasks = tasks.filter((t) => t.column === 'done')

  const handleAddTask = (column) => {
    if (!newTaskTitle.trim()) return
    const newTask = {
      id: 't-' + Date.now(),
      title: newTaskTitle.trim(),
      tag: newTaskTag,
      priority: newTaskPriority,
      column: column,
      createdAt: 'Just now',
    }
    setTasks([newTask, ...tasks])
    setNewTaskTitle('')
    setActiveModalCol(null)
  }

  const moveTask = (taskId, newCol) => {
    setTasks(
      tasks.map((t) => {
        if (t.id === taskId) {
          return { ...t, column: newCol }
        }
        return t
      })
    )
  }

  const deleteTask = (taskId) => {
    setTasks(tasks.filter((t) => t.id !== taskId))
  }

  const getPriorityStyle = (p) => {
    if (p === 'High') return 'bg-red-50 text-red-700 border-red-200'
    if (p === 'Medium') return 'bg-amber-50 text-amber-700 border-amber-200'
    return 'bg-blue-50 text-blue-700 border-blue-200'
  }

  const getTagStyle = (tag) => {
    switch (tag) {
      case 'DSA':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200'
      case 'Resume':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'System Design':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200'
      case 'Interview':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto py-4 px-2 sm:px-4 space-y-6">
      {/* Header matching screenshot exactly */}
      <div className="space-y-2">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 uppercase">
          TASK BOARD
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-4xl leading-relaxed">
          Plan your job search day by day. Track resume edits, cover letter drafts, mock interview practice, DSA
          problems, portfolio updates, and recruiter follow ups, all on one board synced to your account.
        </p>
      </div>

      {/* 3 Columns Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        {/* COLUMN 1: TO DO (Light pastel blue) */}
        <div className="rounded-2xl border border-[#cbe1f3] bg-[#dbeaf7]/70 p-4 sm:p-5 flex flex-col min-h-[380px] shadow-xs">
          {/* Column Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600"></span>
              <h3 className="text-xs font-bold text-slate-800">To Do</h3>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-200/80 text-[11px] font-bold text-blue-800">
                {todoTasks.length}
              </span>
            </div>
            <button
              onClick={() => setActiveModalCol(activeModalCol === 'todo' ? null : 'todo')}
              title="Add task"
              className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-600 hover:bg-white/60 transition"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Quick Add Form Inline */}
          {activeModalCol === 'todo' && (
            <div className="mb-4 rounded-xl bg-white p-3 border border-blue-200 shadow-sm space-y-2.5">
              <input
                type="text"
                placeholder="What do you need to do?"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask('todo')}
                className="w-full text-xs font-medium text-slate-800 placeholder-slate-400 bg-transparent border-b border-slate-200 pb-1.5 focus:outline-none focus:border-blue-500"
              />
              <div className="flex items-center justify-between gap-2">
                <select
                  value={newTaskTag}
                  onChange={(e) => setNewTaskTag(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="DSA">DSA</option>
                  <option value="Resume">Resume</option>
                  <option value="System Design">System Design</option>
                  <option value="Interview">Interview</option>
                  <option value="Portfolio">Portfolio</option>
                  <option value="Core Subjects">Core Subjects</option>
                </select>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                <button
                  onClick={() => handleAddTask('todo')}
                  className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs font-bold transition shadow-xs"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Task List */}
          <div className="space-y-3 flex-1">
            {todoTasks.map((task) => (
              <div
                key={task.id}
                className="group rounded-xl bg-white p-3.5 border border-[#cbe1f3] shadow-xs hover:shadow-md transition space-y-2.5"
              >
                <p className="text-xs font-bold text-slate-800 leading-snug">{task.title}</p>
                <div className="flex items-center justify-between pt-1 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className={`rounded-md px-1.5 py-0.5 font-bold border ${getTagStyle(task.tag)}`}>
                      {task.tag}
                    </span>
                    <span className={`rounded-md px-1.5 py-0.5 font-bold border ${getPriorityStyle(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                    <button
                      onClick={() => deleteTask(task.id)}
                      title="Delete"
                      className="p-1 text-slate-400 hover:text-red-500 rounded transition"
                    >
                      <Trash2 size={13} />
                    </button>
                    <button
                      onClick={() => moveTask(task.id, 'in_progress')}
                      title="Move to In Progress"
                      className="flex items-center gap-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 px-1.5 py-0.5 font-bold transition"
                    >
                      <span>In Progress</span>
                      <ArrowRight size={11} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add task button in center bottom matching screenshot */}
          <button
            onClick={() => setActiveModalCol(activeModalCol === 'todo' ? null : 'todo')}
            className="mt-4 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition hover:bg-white/40 rounded-xl"
          >
            <Plus size={14} />
            <span>Add task</span>
          </button>
        </div>

        {/* COLUMN 2: IN PROGRESS (Light beige/peach) */}
        <div className="rounded-2xl border border-[#eedbb9] bg-[#fbf0de]/70 p-4 sm:p-5 flex flex-col min-h-[380px] shadow-xs">
          {/* Column Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-600"></span>
              <h3 className="text-xs font-bold text-slate-800">In Progress</h3>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-200/80 text-[11px] font-bold text-amber-900">
                {inProgressTasks.length}
              </span>
            </div>
            <button
              onClick={() => setActiveModalCol(activeModalCol === 'in_progress' ? null : 'in_progress')}
              title="Add task"
              className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-600 hover:bg-white/60 transition"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Quick Add Form Inline */}
          {activeModalCol === 'in_progress' && (
            <div className="mb-4 rounded-xl bg-white p-3 border border-amber-200 shadow-sm space-y-2.5">
              <input
                type="text"
                placeholder="What are you currently working on?"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask('in_progress')}
                className="w-full text-xs font-medium text-slate-800 placeholder-slate-400 bg-transparent border-b border-slate-200 pb-1.5 focus:outline-none focus:border-amber-500"
              />
              <div className="flex items-center justify-between gap-2">
                <select
                  value={newTaskTag}
                  onChange={(e) => setNewTaskTag(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="DSA">DSA</option>
                  <option value="Resume">Resume</option>
                  <option value="System Design">System Design</option>
                  <option value="Interview">Interview</option>
                  <option value="Portfolio">Portfolio</option>
                  <option value="Core Subjects">Core Subjects</option>
                </select>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                <button
                  onClick={() => handleAddTask('in_progress')}
                  className="rounded-lg bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 text-xs font-bold transition shadow-xs"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Task List */}
          <div className="space-y-3 flex-1">
            {inProgressTasks.map((task) => (
              <div
                key={task.id}
                className="group rounded-xl bg-white p-3.5 border border-[#eedbb9] shadow-xs hover:shadow-md transition space-y-2.5"
              >
                <p className="text-xs font-bold text-slate-800 leading-snug">{task.title}</p>
                <div className="flex items-center justify-between pt-1 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className={`rounded-md px-1.5 py-0.5 font-bold border ${getTagStyle(task.tag)}`}>
                      {task.tag}
                    </span>
                    <span className={`rounded-md px-1.5 py-0.5 font-bold border ${getPriorityStyle(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                    <button
                      onClick={() => moveTask(task.id, 'todo')}
                      title="Move back to To Do"
                      className="p-1 text-slate-400 hover:text-slate-700 rounded transition"
                    >
                      <ArrowLeft size={12} />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      title="Delete"
                      className="p-1 text-slate-400 hover:text-red-500 rounded transition"
                    >
                      <Trash2 size={13} />
                    </button>
                    <button
                      onClick={() => moveTask(task.id, 'done')}
                      title="Move to Done"
                      className="flex items-center gap-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-1.5 py-0.5 font-bold transition"
                    >
                      <span>Done</span>
                      <ArrowRight size={11} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add task button in center bottom matching screenshot */}
          <button
            onClick={() => setActiveModalCol(activeModalCol === 'in_progress' ? null : 'in_progress')}
            className="mt-4 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition hover:bg-white/40 rounded-xl"
          >
            <Plus size={14} />
            <span>Add task</span>
          </button>
        </div>

        {/* COLUMN 3: DONE (Light pastel green) */}
        <div className="rounded-2xl border border-[#c4e6c7] bg-[#dbf2de]/70 p-4 sm:p-5 flex flex-col min-h-[380px] shadow-xs">
          {/* Column Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600"></span>
              <h3 className="text-xs font-bold text-slate-800">Done</h3>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-200/80 text-[11px] font-bold text-emerald-900">
                {doneTasks.length}
              </span>
            </div>
            <button
              onClick={() => setActiveModalCol(activeModalCol === 'done' ? null : 'done')}
              title="Add task"
              className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-600 hover:bg-white/60 transition"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Quick Add Form Inline */}
          {activeModalCol === 'done' && (
            <div className="mb-4 rounded-xl bg-white p-3 border border-emerald-200 shadow-sm space-y-2.5">
              <input
                type="text"
                placeholder="What did you complete?"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask('done')}
                className="w-full text-xs font-medium text-slate-800 placeholder-slate-400 bg-transparent border-b border-slate-200 pb-1.5 focus:outline-none focus:border-emerald-500"
              />
              <div className="flex items-center justify-between gap-2">
                <select
                  value={newTaskTag}
                  onChange={(e) => setNewTaskTag(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="DSA">DSA</option>
                  <option value="Resume">Resume</option>
                  <option value="System Design">System Design</option>
                  <option value="Interview">Interview</option>
                  <option value="Portfolio">Portfolio</option>
                  <option value="Core Subjects">Core Subjects</option>
                </select>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                <button
                  onClick={() => handleAddTask('done')}
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 text-xs font-bold transition shadow-xs"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Task List */}
          <div className="space-y-3 flex-1">
            {doneTasks.map((task) => (
              <div
                key={task.id}
                className="group rounded-xl bg-white p-3.5 border border-[#c4e6c7] shadow-xs hover:shadow-md transition space-y-2.5 opacity-90 hover:opacity-100"
              >
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 mt-0.5 shrink-0" />
                  <p className="text-xs font-bold text-slate-700 line-through leading-snug">{task.title}</p>
                </div>
                <div className="flex items-center justify-between pt-1 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className={`rounded-md px-1.5 py-0.5 font-bold border ${getTagStyle(task.tag)}`}>
                      {task.tag}
                    </span>
                    <span className={`rounded-md px-1.5 py-0.5 font-bold border ${getPriorityStyle(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                    <button
                      onClick={() => moveTask(task.id, 'in_progress')}
                      title="Move back to In Progress"
                      className="p-1 text-slate-400 hover:text-slate-700 rounded transition"
                    >
                      <ArrowLeft size={12} />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      title="Delete"
                      className="p-1 text-slate-400 hover:text-red-500 rounded transition"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add task button in center bottom matching screenshot */}
          <button
            onClick={() => setActiveModalCol(activeModalCol === 'done' ? null : 'done')}
            className="mt-4 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition hover:bg-white/40 rounded-xl"
          >
            <Plus size={14} />
            <span>Add task</span>
          </button>
        </div>
      </div>
    </div>
  )
}
