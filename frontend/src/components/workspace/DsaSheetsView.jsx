import React, { useState, useEffect } from 'react'
import {
  Layers,
  Search,
  ExternalLink,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Code2,
  Filter
} from 'lucide-react'

const DSA_DATA = [
  // Arrays & Hashing
  {
    id: 'dsa-1',
    title: 'Two Sum',
    category: 'Arrays & Hashing',
    difficulty: 'Easy',
    leetcodeUrl: 'https://leetcode.com/problems/two-sum/',
    companies: ['Google', 'Amazon', 'Meta'],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(N)',
    hint: 'Use a hash map to store elements and their indices. For each element num, check if (target - num) exists in the map.',
  },
  {
    id: 'dsa-2',
    title: 'Group Anagrams',
    category: 'Arrays & Hashing',
    difficulty: 'Medium',
    leetcodeUrl: 'https://leetcode.com/problems/group-anagrams/',
    companies: ['Amazon', 'Microsoft'],
    timeComplexity: 'O(N * K log K)',
    spaceComplexity: 'O(N * K)',
    hint: 'Sort each string alphabetically and use the sorted string as the hash map key to group original strings together.',
  },
  {
    id: 'dsa-3',
    title: 'Product of Array Except Self',
    category: 'Arrays & Hashing',
    difficulty: 'Medium',
    leetcodeUrl: 'https://leetcode.com/problems/product-of-array-except-self/',
    companies: ['Apple', 'Amazon', 'Meta'],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1) auxiliary',
    hint: 'Compute prefix products in a first pass from left to right, then multiply by postfix products in a second pass from right to left.',
  },

  // Two Pointers & Sliding Window
  {
    id: 'dsa-4',
    title: '3Sum',
    category: 'Two Pointers',
    difficulty: 'Medium',
    leetcodeUrl: 'https://leetcode.com/problems/3sum/',
    companies: ['Meta', 'Google', 'Amazon'],
    timeComplexity: 'O(N^2)',
    spaceComplexity: 'O(1) extra',
    hint: 'Sort the array first. Loop through index i, and use two pointers (left and right) to find pairs that sum to -nums[i]. Skip duplicates.',
  },
  {
    id: 'dsa-5',
    title: 'Trapping Rain Water',
    category: 'Two Pointers',
    difficulty: 'Hard',
    leetcodeUrl: 'https://leetcode.com/problems/trapping-rain-water/',
    companies: ['Google', 'Amazon', 'Goldman Sachs'],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    hint: 'Use two pointers from left and right boundaries while keeping track of maxLeft and maxRight. Water trapped is min(maxLeft, maxRight) - currentHeight.',
  },
  {
    id: 'dsa-6',
    title: 'Longest Substring Without Repeating Characters',
    category: 'Sliding Window',
    difficulty: 'Medium',
    leetcodeUrl: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
    companies: ['Amazon', 'Bloomberg', 'Microsoft'],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(min(N, M))',
    hint: 'Maintain a sliding window with a Set or Map of visited characters. When duplicate found, shrink window from left until valid.',
  },
  {
    id: 'dsa-7',
    title: 'Minimum Window Substring',
    category: 'Sliding Window',
    difficulty: 'Hard',
    leetcodeUrl: 'https://leetcode.com/problems/minimum-window-substring/',
    companies: ['Meta', 'Uber', 'Google'],
    timeComplexity: 'O(N + M)',
    spaceComplexity: 'O(N + M)',
    hint: 'Count required characters in target string T. Expand window right pointer until all characters matched, then contract left pointer to minimize length.',
  },

  // Binary Search & Linked List
  {
    id: 'dsa-8',
    title: 'Search in Rotated Sorted Array',
    category: 'Binary Search',
    difficulty: 'Medium',
    leetcodeUrl: 'https://leetcode.com/problems/search-in-rotated-sorted-array/',
    companies: ['Microsoft', 'Amazon'],
    timeComplexity: 'O(log N)',
    spaceComplexity: 'O(1)',
    hint: 'In a rotated array, at least one half (left to mid or mid to right) is always strictly sorted. Check if target falls in that sorted half.',
  },
  {
    id: 'dsa-9',
    title: 'Reverse Linked List',
    category: 'Linked List',
    difficulty: 'Easy',
    leetcodeUrl: 'https://leetcode.com/problems/reverse-linked-list/',
    companies: ['Google', 'Apple', 'Adobe'],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    hint: 'Keep three pointers: prev (null), curr (head), and next. In each step: next = curr.next; curr.next = prev; prev = curr; curr = next.',
  },
  {
    id: 'dsa-10',
    title: 'LRU Cache',
    category: 'Linked List',
    difficulty: 'Medium',
    leetcodeUrl: 'https://leetcode.com/problems/lru-cache/',
    companies: ['Amazon', 'Microsoft', 'Meta'],
    timeComplexity: 'O(1) get & put',
    spaceComplexity: 'O(Capacity)',
    hint: 'Combine a Doubly Linked List (for O(1) node eviction and insertion at head) with a Hash Map (for O(1) key lookups).',
  },

  // Trees & Graphs
  {
    id: 'dsa-11',
    title: 'Lowest Common Ancestor of a Binary Tree',
    category: 'Trees',
    difficulty: 'Medium',
    leetcodeUrl: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/',
    companies: ['Meta', 'Amazon', 'Google'],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(H)',
    hint: 'Recursively search left and right subtrees. If root matches either node or both subtrees return non-null, root is the LCA.',
  },
  {
    id: 'dsa-12',
    title: 'Number of Islands',
    category: 'Graphs',
    difficulty: 'Medium',
    leetcodeUrl: 'https://leetcode.com/problems/number-of-islands/',
    companies: ['Amazon', 'Google', 'Bloomberg'],
    timeComplexity: 'O(M * N)',
    spaceComplexity: 'O(M * N)',
    hint: 'Iterate over grid. Whenever cell is "1", increment island counter and perform BFS/DFS to sink all connected land cells to "0".',
  },
  {
    id: 'dsa-13',
    title: 'Course Schedule (Cycle Detection)',
    category: 'Graphs',
    difficulty: 'Medium',
    leetcodeUrl: 'https://leetcode.com/problems/course-schedule/',
    companies: ['Amazon', 'Microsoft', 'Uber'],
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V + E)',
    hint: 'Build adjacency list and in-degree array. Use Kahns Algorithm (BFS Topological Sort) or DFS with 3 states (unvisited, visiting, visited).',
  },

  // Dynamic Programming
  {
    id: 'dsa-14',
    title: 'Coin Change',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    leetcodeUrl: 'https://leetcode.com/problems/coin-change/',
    companies: ['Amazon', 'Goldman Sachs'],
    timeComplexity: 'O(Amount * Coins)',
    spaceComplexity: 'O(Amount)',
    hint: 'dp[i] represents minimum coins needed for amount i. dp[i] = min(dp[i], 1 + dp[i - coin]) for each coin <= i.',
  },
  {
    id: 'dsa-15',
    title: 'Longest Increasing Subsequence',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    leetcodeUrl: 'https://leetcode.com/problems/longest-increasing-subsequence/',
    companies: ['Google', 'Meta'],
    timeComplexity: 'O(N log N) with Binary Search',
    spaceComplexity: 'O(N)',
    hint: 'Maintain an array tails[] where tails[i] stores smallest tail of all increasing subsequences of length i+1. Update using binary search.',
  },
]

export default function DsaSheetsView() {
  const [solvedIds, setSolvedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('devsunite_dsa_solved')
      return saved ? JSON.parse(saved) : ['dsa-1', 'dsa-9']
    } catch {
      return ['dsa-1', 'dsa-9']
    }
  })

  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedDifficulty, setSelectedDifficulty] = useState('All')
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    localStorage.setItem('devsunite_dsa_solved', JSON.stringify(solvedIds))
  }, [solvedIds])

  const toggleSolved = (id) => {
    if (solvedIds.includes(id)) {
      setSolvedIds(solvedIds.filter((item) => item !== id))
    } else {
      setSolvedIds([...solvedIds, id])
    }
  }

  const categories = ['All', 'Arrays & Hashing', 'Two Pointers', 'Sliding Window', 'Binary Search', 'Linked List', 'Trees', 'Graphs', 'Dynamic Programming']
  const difficulties = ['All', 'Easy', 'Medium', 'Hard']

  const filteredProblems = DSA_DATA.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.companies.some((c) => c.toLowerCase().includes(search.toLowerCase()))

    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === 'All' || p.difficulty === selectedDifficulty

    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const getDifficultyBadge = (d) => {
    if (d === 'Easy') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    if (d === 'Medium') return 'bg-amber-50 text-amber-700 border-amber-200'
    return 'bg-red-50 text-red-700 border-red-200'
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto py-4 px-2 sm:px-4 space-y-6">
      {/* Title */}
      <div className="border-b border-[#eae6dc] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 uppercase">
            CURATED DSA PROBLEM SHEETS
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed mt-1">
            Industry vetted coding problem sheets covering all core patterns. Mark problems solved to track your readiness.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white border border-[#eae6dc] px-4 py-2 text-right shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Progress</span>
            <p className="text-sm font-black text-emerald-700">
              {solvedIds.length} / {DSA_DATA.length} Solved ({Math.round((solvedIds.length / DSA_DATA.length) * 100)}%)
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl bg-white p-4 border border-[#eae6dc] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search problems by name, topic, or company (e.g. Google)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              {difficulties.map((d) => (
                <option key={d} value={d}>
                  {d === 'All' ? 'All Difficulties' : d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Problems List */}
      <div className="space-y-3">
        {filteredProblems.map((prob) => {
          const isSolved = solvedIds.includes(prob.id)
          const isExpanded = expandedId === prob.id

          return (
            <div
              key={prob.id}
              className={`rounded-2xl border transition-all ${
                isSolved
                  ? 'bg-[#f7faf7] border-[#d4ebd6]'
                  : 'bg-white border-[#eae6dc] hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isSolved}
                    onChange={() => toggleSolved(prob.id)}
                    className="mt-0.5 sm:mt-0 h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-sm font-bold ${isSolved ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                        {prob.title}
                      </span>
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${getDifficultyBadge(prob.difficulty)}`}>
                        {prob.difficulty}
                      </span>
                      <span className="rounded-md bg-slate-100 text-slate-600 px-2 py-0.5 text-[10px] font-semibold">
                        {prob.category}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {prob.companies.map((c, i) => (
                        <span key={i} className="text-[10px] font-medium text-slate-400">
                          #{c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : prob.id)}
                    className="flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 transition"
                  >
                    <span>Hint & Approach</span>
                    {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>

                  <a
                    href={prob.leetcodeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 rounded-xl bg-slate-900 hover:bg-black px-3 py-1.5 text-xs font-bold text-white transition shadow-2xs"
                  >
                    <span>Solve</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              {/* Expanded Hint & Approach Drawer */}
              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/70 p-4 rounded-b-2xl space-y-2.5">
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-700">
                    <span>
                      <strong className="text-slate-900">Time:</strong> {prob.timeComplexity}
                    </span>
                    <span>
                      <strong className="text-slate-900">Space:</strong> {prob.spaceComplexity}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-800">Intuition & Solution Approach:</p>
                    <p className="text-xs text-slate-600 leading-relaxed mt-0.5">{prob.hint}</p>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {filteredProblems.length === 0 && (
          <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            No matching problems found. Try adjusting your search query or filters.
          </div>
        )}
      </div>
    </div>
  )
}
