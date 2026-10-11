import React, { useState } from 'react'
import {
  TrendingUp,
  Search,
  Code2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen
} from 'lucide-react'

const PATTERNS_LIST = [
  {
    id: 1,
    name: 'Sliding Window',
    summary: 'Subarrays or substrings with contiguous elements where you maintain a window boundary.',
    whenToUse: 'Finding longest/shortest contiguous subarray, or substrings satisfying specific constraints (e.g. at most K distinct characters).',
    problems: ['Longest Substring Without Repeating Characters', 'Minimum Window Substring', 'Max Consecutive Ones III'],
    complexity: 'Time: O(N) | Space: O(K)',
    codeSnippet: `// Sliding Window Boilerplate
function slidingWindow(arr, k) {
  let left = 0;
  let maxResult = 0;
  let currentWindow = new Map();

  for (let right = 0; right < arr.length; right++) {
    // 1. Add current element to window
    currentWindow.set(arr[right], (currentWindow.get(arr[right]) || 0) + 1);

    // 2. Shrink window while invalid
    while (/* condition violated */ left <= right) {
      currentWindow.set(arr[left], currentWindow.get(arr[left]) - 1);
      left++;
    }

    // 3. Update answer
    maxResult = Math.max(maxResult, right - left + 1);
  }
  return maxResult;
}`,
  },
  {
    id: 2,
    name: 'Two Pointers (Opposite Direction)',
    summary: 'Iterate from both ends of a sorted array towards the center.',
    whenToUse: 'Searching for pairs in a sorted array, palindromes, or partitioning arrays (e.g., Two Sum II, 3Sum, Container With Most Water).',
    problems: ['Two Sum II (Sorted)', '3Sum', 'Container With Most Water', 'Valid Palindrome'],
    complexity: 'Time: O(N) | Space: O(1)',
    codeSnippet: `// Two Pointers Boilerplate
function twoPointers(sortedArr, target) {
  let left = 0;
  let right = sortedArr.length - 1;

  while (left < right) {
    const sum = sortedArr[left] + sortedArr[right];
    if (sum === target) {
      return [left, right];
    } else if (sum < target) {
      left++;
    } else {
      right--;
    }
  }
  return [-1, -1];
}`,
  },
  {
    id: 3,
    name: 'Fast & Slow Pointers (Hare & Tortoise)',
    summary: 'Two pointers moving at different speeds (1 step vs 2 steps).',
    whenToUse: 'Detecting cycles in linked lists, finding middle of linked list, or palindrome linked list validation.',
    problems: ['Linked List Cycle', 'Middle of Linked List', 'Find Duplicate Number'],
    complexity: 'Time: O(N) | Space: O(1)',
    codeSnippet: `// Fast & Slow Pointers
function hasCycle(head) {
  let slow = head;
  let fast = head;

  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) {
      return true; // Cycle detected
    }
  }
  return false;
}`,
  },
  {
    id: 4,
    name: 'Merge Intervals',
    summary: 'Sort intervals by start time and combine overlapping boundaries.',
    whenToUse: 'Any problem with intervals, timeslots, calendar meetings, or overlapping ranges.',
    problems: ['Merge Intervals', 'Insert Interval', 'Non-overlapping Intervals', 'Meeting Rooms II'],
    complexity: 'Time: O(N log N) | Space: O(N)',
    codeSnippet: `// Merge Intervals
function merge(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);
  const merged = [intervals[0]];

  for (let i = 1; i < intervals.length; i++) {
    const prev = merged[merged.length - 1];
    const curr = intervals[i];

    if (curr[0] <= prev[1]) {
      prev[1] = Math.max(prev[1], curr[1]);
    } else {
      merged.push(curr);
    }
  }
  return merged;
}`,
  },
  {
    id: 5,
    name: 'Cyclic Sort',
    summary: 'Place numbers from 1 to N into their corresponding 0-indexed indices.',
    whenToUse: 'Problems dealing with numbers in a given range [1, N] where you need to find missing or duplicate numbers.',
    problems: ['Missing Number', 'Find All Numbers Disappeared in an Array', 'Find the Duplicate Number'],
    complexity: 'Time: O(N) | Space: O(1)',
    codeSnippet: `// Cyclic Sort
function cyclicSort(nums) {
  let i = 0;
  while (i < nums.length) {
    const correctIdx = nums[i] - 1;
    if (nums[i] !== nums[correctIdx]) {
      [nums[i], nums[correctIdx]] = [nums[correctIdx], nums[i]];
    } else {
      i++;
    }
  }
  return nums;
}`,
  },
  {
    id: 6,
    name: 'In-place Reversal of a LinkedList',
    summary: 'Reverse pointers of linked list nodes without allocating extra memory.',
    whenToUse: 'Reversing a full or partial section of a linked list (e.g. reverse nodes in k-Group).',
    problems: ['Reverse Linked List', 'Reverse Linked List II', 'Reverse Nodes in k-Group'],
    complexity: 'Time: O(N) | Space: O(1)',
    codeSnippet: `// In-place Reversal
function reverseList(head) {
  let prev = null;
  let curr = head;

  while (curr) {
    const nextNode = curr.next;
    curr.next = prev;
    prev = curr;
    curr = nextNode;
  }
  return prev;
}`,
  },
  {
    id: 7,
    name: 'Tree Breadth-First Search (BFS)',
    summary: 'Level-order traversal of trees using a Queue FIFO structure.',
    whenToUse: 'Traversing level by level, finding zigzag orders, or minimum depth of binary tree.',
    problems: ['Binary Tree Level Order Traversal', 'Zigzag Level Order Traversal', 'Populating Next Right Pointers'],
    complexity: 'Time: O(N) | Space: O(N)',
    codeSnippet: `// Tree BFS (Level Order)
function levelOrder(root) {
  if (!root) return [];
  const result = [];
  const queue = [root];

  while (queue.length > 0) {
    const levelSize = queue.length;
    const currentLevel = [];

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      currentLevel.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(currentLevel);
  }
  return result;
}`,
  },
  {
    id: 8,
    name: 'Tree Depth-First Search (DFS)',
    summary: 'Pre-order, In-order, or Post-order traversal using recursion or stack.',
    whenToUse: 'Path sums, lowest common ancestor, diameter of tree, validating BST.',
    problems: ['Path Sum II', 'Lowest Common Ancestor', 'Diameter of Binary Tree', 'Validate BST'],
    complexity: 'Time: O(N) | Space: O(H)',
    codeSnippet: `// Tree DFS Recursive
function maxDepth(root) {
  if (!root) return 0;
  const left = maxDepth(root.left);
  const right = maxDepth(root.right);
  return 1 + Math.max(left, right);
}`,
  },
  {
    id: 9,
    name: 'Two Heaps (Min-Heap & Max-Heap)',
    summary: 'Partition data into two halves to find running median or balance values.',
    whenToUse: 'Computing median of a data stream or finding elements near the middle.',
    problems: ['Find Median from Data Stream', 'Sliding Window Median'],
    complexity: 'Time: O(log N) insert, O(1) median | Space: O(N)',
    codeSnippet: `// Two Heaps Concept
// MaxHeap stores the smaller half
// MinHeap stores the larger half
// Balance so sizes differ by at most 1`,
  },
  {
    id: 10,
    name: 'Subsets & Backtracking',
    summary: 'Systematically generate permutations, combinations, or power sets.',
    whenToUse: 'Finding all valid configurations (e.g. Subsets, Permutations, N-Queens, Sudoku Solver).',
    problems: ['Subsets', 'Permutations', 'Combination Sum', 'N-Queens'],
    complexity: 'Time: O(2^N) or O(N!) | Space: O(N)',
    codeSnippet: `// Backtracking Subsets
function subsets(nums) {
  const result = [];
  function backtrack(start, currentPath) {
    result.push([...currentPath]);
    for (let i = start; i < nums.length; i++) {
      currentPath.push(nums[i]);
      backtrack(i + 1, currentPath);
      currentPath.pop(); // backtrack
    }
  }
  backtrack(0, []);
  return result;
}`,
  },
  {
    id: 11,
    name: 'Modified Binary Search',
    summary: 'Binary search variants on rotated, matrix, or bitonic arrays.',
    whenToUse: 'Finding peak elements, square roots, search in rotated sorted arrays.',
    problems: ['Search in Rotated Sorted Array', 'Find Minimum in Rotated Sorted Array', 'Peak Index in Mountain Array'],
    complexity: 'Time: O(log N) | Space: O(1)',
    codeSnippet: `// Binary Search Template
let left = 0, right = arr.length - 1;
while (left <= right) {
  const mid = left + Math.floor((right - left) / 2);
  if (arr[mid] === target) return mid;
  if (arr[mid] < target) left = mid + 1;
  else right = mid - 1;
}`,
  },
  {
    id: 12,
    name: 'Top "K" Elements (Heap)',
    summary: 'Maintain a Min-Heap of size K to find the K largest items.',
    whenToUse: 'Finding K most frequent items, Kth largest element in stream.',
    problems: ['Kth Largest Element in an Array', 'Top K Frequent Elements', 'Sort Characters By Frequency'],
    complexity: 'Time: O(N log K) | Space: O(K)',
    codeSnippet: `// Top K Elements with Min-Heap
// Push elements into min-heap.
// If heap.size > K, pop minimum.
// Remaining heap contains K largest items.`,
  },
  {
    id: 13,
    name: 'Monotonic Stack',
    summary: 'A stack that maintains elements in strictly increasing or decreasing order.',
    whenToUse: 'Finding Next Greater Element, Daily Temperatures, or Largest Rectangle in Histogram.',
    problems: ['Next Greater Element I', 'Daily Temperatures', 'Largest Rectangle in Histogram'],
    complexity: 'Time: O(N) | Space: O(N)',
    codeSnippet: `// Monotonic Decreasing Stack for Next Greater Element
function nextGreater(nums) {
  const res = new Array(nums.length).fill(-1);
  const stack = []; // stores indices

  for (let i = 0; i < nums.length; i++) {
    while (stack.length && nums[stack[stack.length - 1]] < nums[i]) {
      const idx = stack.pop();
      res[idx] = nums[i];
    }
    stack.push(i);
  }
  return res;
}`,
  },
  {
    id: 14,
    name: 'Topological Sort (Graph BFS/DFS)',
    summary: 'Linear ordering of vertices in a Directed Acyclic Graph (DAG).',
    whenToUse: 'Course prerequisites, build order dependency resolution, task scheduling.',
    problems: ['Course Schedule II', 'Alien Dictionary', 'Minimum Height Trees'],
    complexity: 'Time: O(V + E) | Space: O(V + E)',
    codeSnippet: `// Kahns Algorithm (BFS Topological Sort)
// 1. Calculate in-degrees for all vertices
// 2. Push all nodes with in-degree === 0 to queue
// 3. Process queue, decrement neighbor in-degrees, push new 0-in-degree nodes`,
  },
  {
    id: 15,
    name: 'Prefix Sum & Hash Map',
    summary: 'Store cumulative running sum to evaluate subarray sums in O(1).',
    whenToUse: 'Finding subarrays that sum to K or contiguous subsegments with specific properties.',
    problems: ['Subarray Sum Equals K', 'Continuous Subarray Sum', 'Contiguous Array'],
    complexity: 'Time: O(N) | Space: O(N)',
    codeSnippet: `// Prefix Sum with Hash Map
function subarraySum(nums, k) {
  let count = 0, currentSum = 0;
  const map = new Map([[0, 1]]);

  for (const num of nums) {
    currentSum += num;
    if (map.has(currentSum - k)) {
      count += map.get(currentSum - k);
    }
    map.set(currentSum, (map.get(currentSum) || 0) + 1);
  }
  return count;
}`,
  },
  {
    id: 16,
    name: '0/1 Knapsack & Dynamic Programming',
    summary: 'Choice between picking or skipping items with weight/value constraints.',
    whenToUse: 'Partition equal subset sum, target sum, coin change combinations.',
    problems: ['Partition Equal Subset Sum', 'Target Sum', 'Coin Change II'],
    complexity: 'Time: O(N * W) | Space: O(W)',
    codeSnippet: `// 1D DP Array for 0/1 Knapsack
for (const item of items) {
  for (let w = capacity; w >= item.weight; w--) {
    dp[w] = Math.max(dp[w], dp[w - item.weight] + item.value);
  }
}`,
  },
  {
    id: 17,
    name: 'Trie (Prefix Tree)',
    summary: 'Tree data structure for high-performance string prefix lookups.',
    whenToUse: 'Autocomplete, spell check, IP routing, word search puzzles.',
    problems: ['Implement Trie (Prefix Tree)', 'Design Add and Search Words', 'Word Search II'],
    complexity: 'Time: O(L) per search/insert | Space: O(Total Characters)',
    codeSnippet: `class TrieNode {
  constructor() {
    this.children = {};
    this.isEnd = false;
  }
}`,
  },
  {
    id: 18,
    name: 'Bit Manipulation & XOR',
    summary: 'Exploiting XOR properties (a ^ a = 0, a ^ 0 = a) and bit masking.',
    whenToUse: 'Single Number, Counting Bits, Power of Two, Subsets using bitmasking.',
    problems: ['Single Number', 'Number of 1 Bits (Hamming Weight)', 'Counting Bits'],
    complexity: 'Time: O(1) per op | Space: O(1)',
    codeSnippet: `// Single Number using XOR
function singleNumber(nums) {
  let res = 0;
  for (const n of nums) res ^= n;
  return res;
}`,
  },
  {
    id: 19,
    name: 'Union Find (Disjoint Set Union - DSU)',
    summary: 'Track elements partitioned into disjoint subsets with near O(1) connectivity queries.',
    whenToUse: 'Dynamic graph connectivity, Kruskals Minimum Spanning Tree, redundant connections.',
    problems: ['Number of Connected Components', 'Redundant Connection', 'Graph Valid Tree'],
    complexity: 'Time: O(alpha(N)) with path compression | Space: O(N)',
    codeSnippet: `// DSU with Path Compression & Union by Rank
class UnionFind {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
  }
  find(i) {
    if (this.parent[i] === i) return i;
    return this.parent[i] = this.find(this.parent[i]);
  }
  union(i, j) {
    const rootI = this.find(i);
    const rootJ = this.find(j);
    if (rootI !== rootJ) this.parent[rootI] = rootJ;
  }
}`,
  },
  {
    id: 20,
    name: 'K-Way Merge',
    summary: 'Merge K sorted arrays or lists using a Min-Heap of size K.',
    whenToUse: 'Merge K sorted lists, find Kth smallest number in sorted matrix.',
    problems: ['Merge k Sorted Lists', 'Find K Pairs with Smallest Sums', 'Kth Smallest Element in Sorted Matrix'],
    complexity: 'Time: O(N log K) | Space: O(K)',
    codeSnippet: `// Insert head of each K list into Min-Heap.
// Pop min node, append to output, and push its .next node into heap.`,
  },
]

export default function DsaPatternsView() {
  const [search, setSearch] = useState('')
  const [expandedPattern, setExpandedPattern] = useState(1)
  const [copiedId, setCopiedId] = useState(null)

  const filteredPatterns = PATTERNS_LIST.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.summary.toLowerCase().includes(search.toLowerCase()) ||
      p.whenToUse.toLowerCase().includes(search.toLowerCase())
  )

  const handleCopyCode = (id, code) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto py-4 px-2 sm:px-4 space-y-6">
      {/* Title */}
      <div className="border-b border-[#eae6dc] pb-4">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 uppercase">
          20 MASTER DSA INTERVIEW PATTERNS
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed mt-1">
          Stop memorizing individual problems. Master these 20 foundational algorithmic patterns that solve 95% of
          technical coding interview questions at Google, Meta, Amazon, and top startups.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search patterns (e.g. Sliding Window, Monotonic Stack, Heap)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:outline-none shadow-2xs"
        />
      </div>

      {/* Pattern Cards List */}
      <div className="space-y-4">
        {filteredPatterns.map((pat) => {
          const isOpen = expandedPattern === pat.id

          return (
            <div
              key={pat.id}
              className="rounded-2xl border border-[#eae6dc] bg-white overflow-hidden shadow-xs hover:border-slate-300 transition"
            >
              {/* Pattern Header / Accordion trigger */}
              <div
                onClick={() => setExpandedPattern(isOpen ? null : pat.id)}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/60 transition select-none"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-900 text-white font-black text-xs">
                    {pat.id}
                  </span>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900">{pat.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{pat.summary}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline-block rounded-lg bg-emerald-50 text-emerald-800 px-2 py-0.5 text-[11px] font-bold border border-emerald-200">
                    {pat.complexity}
                  </span>
                  {isOpen ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                </div>
              </div>

              {/* Accordion Body */}
              {isOpen && (
                <div className="border-t border-slate-100 bg-[#faf9f5] p-5 sm:p-6 space-y-4">
                  {/* Intuition & When to use */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl bg-white p-4 border border-[#eae6dc]">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Sparkles size={13} className="text-amber-500" />
                        When to Use This Pattern
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{pat.whenToUse}</p>
                    </div>

                    <div className="rounded-xl bg-white p-4 border border-[#eae6dc]">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <BookOpen size={13} className="text-blue-500" />
                        Standard Practice Questions
                      </h4>
                      <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                        {pat.problems.map((prob, i) => (
                          <li key={i}>{prob}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Code Template */}
                  <div className="rounded-xl bg-[#1e1e24] text-slate-100 p-4 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                        <Code2 size={14} className="text-emerald-400" />
                        <span>Code Template / Boilerplate</span>
                      </div>
                      <button
                        onClick={() => handleCopyCode(pat.id, pat.codeSnippet)}
                        className="flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-[11px] font-bold text-slate-200 transition"
                      >
                        {copiedId === pat.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        <span>{copiedId === pat.id ? 'Copied' : 'Copy Template'}</span>
                      </button>
                    </div>
                    <pre className="text-xs font-mono text-emerald-300 overflow-x-auto py-2 leading-relaxed">
                      <code>{pat.codeSnippet}</code>
                    </pre>
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
