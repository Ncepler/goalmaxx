'use client'

import { useState, useTransition } from 'react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { createProject, updateProjectStatus, createProjectTask, toggleProjectTask } from '@/app/actions/projects'
import { useRouter } from 'next/navigation'
import { Plus, GitBranch, ExternalLink, ChevronDown, ChevronUp, GitCommit } from 'lucide-react'
import { useEffect } from 'react'

interface Project {
  id: string
  slug: string
  name: string
  tagline: string | null
  status: string | null
  github_repo: string | null
  live_url: string | null
  notes_md: string | null
  created_at: string | null
}

interface Commit {
  sha: string
  commit: { message: string; author: { date: string } }
}

export function ProjectsClient({
  projects,
  openTasksByProject,
}: {
  projects: Project[]
  openTasksByProject: Record<string, number>
}) {
  const [showAdd, setShowAdd] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [commits, setCommits] = useState<Record<string, Commit[]>>({})
  const [, startTransition] = useTransition()
  const router = useRouter()

  // Fetch commits for projects with GitHub repos
  useEffect(() => {
    for (const p of projects) {
      if (p.github_repo && p.status === 'active') {
        const repo = p.github_repo.split('/')[1]
        if (!repo) continue
        fetch(`/api/github/commits/${repo}`)
          .then(r => r.json())
          .then(d => {
            if (d.commits) {
              setCommits(prev => ({ ...prev, [p.id]: d.commits.slice(0, 5) }))
            }
          })
          .catch(() => {})
      }
    }
  }, [projects])

  function handleAdd(fd: FormData) {
    startTransition(async () => { await createProject(fd); router.refresh(); setShowAdd(false) })
  }

  function handleStatus(id: string, status: string) {
    startTransition(async () => { await updateProjectStatus(id, status); router.refresh() })
  }

  const active = projects.filter(p => p.status === 'active')
  const paused = projects.filter(p => p.status === 'paused')
  const shipped = projects.filter(p => p.status === 'shipped')

  return (
    <div className="px-5 pt-6 pb-10 max-w-xl space-y-8">
      <div className="flex items-center justify-between">
        <SectionHeader title="PROJECTS" className="mb-0" />
        <button onClick={() => setShowAdd(v => !v)} className={addBtn}>
          <Plus size={14} /> Add project
        </button>
      </div>

      {showAdd && (
        <form action={handleAdd} className="rounded-xl bg-bg-elevated border border-border-subtle p-4 space-y-3">
          <input name="name" placeholder="Project name" required className={inputCls} />
          <input name="tagline" placeholder="Tagline" className={inputCls} />
          <div className="grid grid-cols-2 gap-2">
            <select name="status" className={inputCls}>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="shipped">Shipped</option>
            </select>
            <input name="github_repo" placeholder="owner/repo" className={inputCls} />
          </div>
          <input name="live_url" type="url" placeholder="Live URL" className={inputCls} />
          <div className="flex gap-2">
            <button type="submit" className={btnGold}>Add</button>
            <button type="button" onClick={() => setShowAdd(false)} className={btnGhost}>Cancel</button>
          </div>
        </form>
      )}

      {active.length > 0 && (
        <>
          <SectionHeader title="ACTIVE" />
          <div className="space-y-3">
            {active.map(p => (
              <ProjectCard
                key={p.id}
                project={p}
                openTasks={openTasksByProject[p.id] ?? 0}
                commits={commits[p.id] ?? []}
                expanded={expandedId === p.id}
                onToggle={() => setExpandedId(expandedId === p.id ? null : p.id)}
                onStatus={handleStatus}
              />
            ))}
          </div>
        </>
      )}

      {paused.length > 0 && (
        <>
          <SectionHeader title="PAUSED" />
          <div className="space-y-3 opacity-70">
            {paused.map(p => (
              <ProjectCard
                key={p.id}
                project={p}
                openTasks={openTasksByProject[p.id] ?? 0}
                commits={commits[p.id] ?? []}
                expanded={expandedId === p.id}
                onToggle={() => setExpandedId(expandedId === p.id ? null : p.id)}
                onStatus={handleStatus}
              />
            ))}
          </div>
        </>
      )}

      {shipped.length > 0 && (
        <>
          <SectionHeader title="SHIPPED" />
          <div className="space-y-3 opacity-70">
            {shipped.map(p => (
              <ProjectCard
                key={p.id}
                project={p}
                openTasks={openTasksByProject[p.id] ?? 0}
                commits={commits[p.id] ?? []}
                expanded={expandedId === p.id}
                onToggle={() => setExpandedId(expandedId === p.id ? null : p.id)}
                onStatus={handleStatus}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function ProjectCard({
  project,
  openTasks,
  commits,
  expanded,
  onToggle,
  onStatus,
}: {
  project: Project
  openTasks: number
  commits: Commit[]
  expanded: boolean
  onToggle: () => void
  onStatus: (id: string, s: string) => void
}) {
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [, startTransition] = useTransition()
  const router = useRouter()

  const statusColors: Record<string, string> = {
    active: 'text-gold border-gold/30',
    paused: 'text-text-tertiary border-border-subtle',
    shipped: 'text-success border-success/30',
  }

  function handleAddTask(fd: FormData) {
    fd.set('project_id', project.id)
    startTransition(async () => { await createProjectTask(fd); router.refresh() })
  }

  return (
    <div className="rounded-xl bg-bg-elevated border border-border-subtle overflow-hidden">
      <button className="w-full p-4 text-left hover:bg-bg-hover transition-colors duration-150" onClick={onToggle}>
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-text-primary font-medium">{project.name}</p>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full border capitalize ${statusColors[project.status ?? ''] ?? ''}`}>
                {project.status}
              </span>
            </div>
            {project.tagline && <p className="text-text-tertiary text-xs mt-0.5 truncate">{project.tagline}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {openTasks > 0 && (
              <span className="text-xs text-gold">{openTasks} open</span>
            )}
            {commits.length > 0 && (
              <span className="text-xs text-text-tertiary">{commits.length} commits</span>
            )}
            {expanded ? <ChevronUp size={14} className="text-text-tertiary" /> : <ChevronDown size={14} className="text-text-tertiary" />}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border-subtle p-4 space-y-4">
          {/* Links */}
          <div className="flex items-center gap-3">
            {project.github_repo && (
              <a href={`https://github.com/${project.github_repo}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-gold transition-colors duration-150">
                <GitBranch size={12} /> {project.github_repo}
              </a>
            )}
            {project.live_url && (
              <a href={project.live_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-gold transition-colors duration-150">
                <ExternalLink size={12} /> Live
              </a>
            )}
            <div className="ml-auto flex gap-1">
              {(['active', 'paused', 'shipped'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => onStatus(project.id, s)}
                  className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize transition-colors duration-150 ${
                    project.status === s ? 'bg-gold/10 text-gold' : 'text-text-tertiary border border-border-subtle hover:border-border-strong'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Recent commits */}
          {commits.length > 0 && (
            <div>
              <p className="text-[11px] font-medium tracking-[0.12em] text-text-secondary uppercase mb-2">Recent commits</p>
              <div className="space-y-1.5">
                {commits.map(c => (
                  <div key={c.sha} className="flex items-start gap-2">
                    <GitCommit size={11} className="text-text-tertiary shrink-0 mt-0.5" />
                    <p className="text-text-secondary text-xs line-clamp-1">{c.commit.message.split('\n')[0]}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tasks */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-medium tracking-[0.12em] text-text-secondary uppercase">Tasks</p>
              <button onClick={() => setShowTaskForm(v => !v)} className="text-[10px] text-gold">+ Add</button>
            </div>
            {showTaskForm && (
              <form action={handleAddTask} className="flex gap-2 mb-2">
                <input name="title" placeholder="Task title" required className="flex-1 bg-bg-input border border-border-subtle rounded-lg px-2 py-1.5 text-text-primary text-xs placeholder:text-text-tertiary focus:outline-none focus:border-gold" />
                <button type="submit" className="text-xs text-gold border border-gold/30 rounded-lg px-2 py-1.5 hover:bg-gold/10 transition-colors duration-150">Add</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const inputCls = 'w-full bg-bg-input border border-border-subtle rounded-lg px-3 py-2 text-text-primary text-sm placeholder:text-text-tertiary focus:outline-none focus:border-gold transition-colors duration-150'
const btnGold = 'px-4 py-1.5 rounded-lg bg-bg-input border border-gold/40 text-gold text-sm hover:border-gold transition-colors duration-150'
const btnGhost = 'px-4 py-1.5 rounded-lg bg-bg-input border border-border-subtle text-text-secondary text-sm hover:border-border-strong transition-colors duration-150'
const addBtn = 'flex items-center gap-1.5 text-xs text-gold hover:text-gold-bright transition-colors duration-150'
