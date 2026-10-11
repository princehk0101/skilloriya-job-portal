import React, { useState } from 'react'
import {
  Building2,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Award,
  CheckCircle2
} from 'lucide-react'

const FAANG_DATA = [
  {
    id: 'f-1',
    company: 'Google',
    role: 'Software Engineer L4 / L5',
    round: 'Coding Round 1',
    title: 'Word Ladder II (Shortest Transformation Sequences)',
    question: 'Given two words (beginWord and endWord), and a dictionary wordList, find all shortest transformation sequences from beginWord to endWord where only one letter changes at a time.',
    optimalApproach: 'Use BFS to find the shortest distance/level from beginWord to endWord and construct parent pointers (directed acyclic graph). Then run DFS with backtracking to reconstruct all paths of minimum length.',
    complexity: 'Time: O(N * 26 * L + Path count) | Space: O(N * L)',
    tips: 'Google interviewers look closely for graph modeling intuition, bidirectional BFS optimizations, and clean modular code structure.',
  },
  {
    id: 'f-2',
    company: 'Google',
    role: 'Senior Software Engineer',
    round: 'System Design',
    title: 'Design Google Docs (Real-time Collaborative Editor)',
    question: 'Design a web-based document editing platform where hundreds of concurrent users can write simultaneously with low latency and conflict resolution.',
    optimalApproach: 'Compare Operational Transformation (OT) vs Conflict-free Replicated Data Types (CRDTs, e.g. Yjs / Automerge). Explain state synchronization over WebSockets, snapshotting to cloud storage, and character-level vector clocks.',
    complexity: 'Scale: Millions of active collaborative sessions | Target Latency: < 50ms',
    tips: 'Focus on network partition scenarios, offline edits reconciliation, and history replay mechanisms.',
  },
  {
    id: 'f-3',
    company: 'Amazon',
    role: 'SDE 2',
    round: 'Coding Round 2',
    title: 'Rotting Oranges / Multi-source BFS',
    question: 'Given an m x n grid containing fresh and rotten oranges, determine the minimum minutes until no fresh orange remains. If impossible, return -1.',
    optimalApproach: 'Multi-source BFS: enqueue all initially rotten oranges at minute 0 and count fresh oranges. Traverse level by level in 4 directions, decrementing fresh count until queue is empty.',
    complexity: 'Time: O(M * N) | Space: O(M * N)',
    tips: 'Amazon frequently asks multi-source BFS and matrix grid explorations. Clarify edge cases (no fresh oranges at start).',
  },
  {
    id: 'f-4',
    company: 'Amazon',
    role: 'SDE 1 / 2',
    round: 'Leadership Principles (LP)',
    title: 'Customer Obsession & Bias for Action Scenario',
    question: 'Tell me about a time when you had to make a critical engineering decision with incomplete data or under tight deadlines to delight a customer.',
    optimalApproach: 'Structure using the STAR framework (Situation, Task, Action, Result). Highlight how you prioritized customer impact over personal convenience, calculated two-way door risks, and shipped rapidly with observability.',
    complexity: 'Focus: STAR methodology + Quantifiable business impact',
    tips: 'Never say "we" exclusively; Amazon interviewers want to know YOUR individual contribution and decision rationale.',
  },
  {
    id: 'f-5',
    company: 'Meta',
    role: 'Software Engineer E4 / E5',
    round: 'Coding Round 1',
    title: 'Valid Palindrome II (At most one deletion)',
    question: 'Given a string s, return true if the s can be palindrome after deleting at most one character from it.',
    optimalApproach: 'Two pointers from left and right. When mismatch occurs (s[left] !== s[right]), check if substring(left+1, right) or substring(left, right-1) is a palindrome.',
    complexity: 'Time: O(N) | Space: O(1)',
    tips: 'Meta coding rounds are famously fast-paced: you are expected to solve TWO medium coding problems in 45 minutes with bug-free code.',
  },
  {
    id: 'f-6',
    company: 'Microsoft',
    role: 'Software Engineer',
    round: 'Coding Round 2',
    title: 'LRU Cache Design & Concurrent Access',
    question: 'Design a Least Recently Used (LRU) cache with O(1) get and put operations, and explain how to make it thread-safe for multi-threaded applications.',
    optimalApproach: 'Combine a Doubly Linked List with a Hash Map. For thread safety, use fine-grained Striped Locks or ReadWriteLocks (ConcurrentHashMap + synchronized linked list mutations).',
    complexity: 'Time: O(1) get & put | Space: O(Capacity)',
    tips: 'Microsoft interviewers often test your object-oriented design and thread-safety awareness during coding rounds.',
  },
]

export default function FaangQuestionsView() {
  const [selectedCompany, setSelectedCompany] = useState('All')
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState('f-1')

  const companies = ['All', 'Google', 'Amazon', 'Meta', 'Microsoft']

  const filtered = FAANG_DATA.filter((item) => {
    const matchesCompany = selectedCompany === 'All' || item.company === selectedCompany
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.question.toLowerCase().includes(search.toLowerCase()) ||
      item.company.toLowerCase().includes(search.toLowerCase())
    return matchesCompany && matchesSearch
  })

  return (
    <div className="w-full max-w-7xl mx-auto py-4 px-2 sm:px-4 space-y-6">
      {/* Title */}
      <div className="border-b border-[#eae6dc] pb-4">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 uppercase">
          FAANG INTERVIEW QUESTIONS BANK
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed mt-1">
          Authentic interview questions and evaluation rubrics collected from candidates who cracked Google, Amazon,
          Meta, and Microsoft.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {companies.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCompany(c)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                selectedCompany === c
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white border border-[#eae6dc] text-slate-700 hover:bg-slate-100'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
          />
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filtered.map((item) => {
          const isExpanded = expandedId === item.id

          return (
            <div
              key={item.id}
              className="rounded-2xl border border-[#eae6dc] bg-white overflow-hidden shadow-xs hover:border-slate-300 transition"
            >
              <div
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 transition select-none"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-slate-900 text-white px-2 py-0.5 text-[10px] font-bold">
                      {item.company}
                    </span>
                    <span className="rounded-md bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px] font-semibold">
                      {item.round}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">({item.role})</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 pt-1">{item.title}</h3>
                </div>

                {isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
              </div>

              {isExpanded && (
                <div className="border-t border-slate-100 bg-[#faf9f5] p-5 sm:p-6 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                      Problem Statement
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200">
                      {item.question}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl bg-white p-4 border border-slate-200">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Sparkles size={14} className="text-emerald-600" />
                        Optimal Solution Approach
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.optimalApproach}</p>
                      <p className="mt-2 text-[11px] font-bold text-emerald-800">{item.complexity}</p>
                    </div>

                    <div className="rounded-xl bg-white p-4 border border-slate-200">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Award size={14} className="text-amber-500" />
                        What Interviewers Look For
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.tips}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
