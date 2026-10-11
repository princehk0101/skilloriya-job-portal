import React, { useState } from 'react'
import {
  BookOpen,
  Search,
  ChevronDown,
  ChevronUp,
  Cpu,
  Database,
  Globe,
  Code2,
  CheckCircle2
} from 'lucide-react'

const CORE_SUBJECTS_DATA = {
  os: {
    title: 'Operating Systems (OS)',
    icon: Cpu,
    questions: [
      {
        q: 'What is the key difference between a Process and a Thread?',
        a: 'A Process is an independent executing program with its own dedicated memory space (Address Space, Heap, Stack, Code). A Thread is the smallest unit of execution within a process that shares memory, code, and resources with peer threads in the same process, but maintains its own program counter and stack. Context switching between threads is significantly faster and has lower overhead than switching between processes.',
      },
      {
        q: 'What are the 4 Coffman conditions required for a Deadlock to occur?',
        a: '1. Mutual Exclusion: At least one resource must be non-shareable.\n2. Hold and Wait: A process is holding at least one resource and requesting additional resources.\n3. No Preemption: Resources cannot be forcibly confiscated from a process holding them.\n4. Circular Wait: A set of processes waiting on each other in a circular chain (P0 -> P1 -> ... -> P0).\nTo prevent deadlocks, eliminating at least one of these four conditions (e.g., ordering resource acquisition to eliminate circular wait) is sufficient.',
      },
      {
        q: 'Explain Virtual Memory, Paging, and Page Faults.',
        a: 'Virtual Memory creates an illusion of a large, contiguous memory space for each process by mapping virtual addresses to physical RAM frames or disk swap space via a Page Table. Paging divides virtual memory into fixed-size blocks called pages (typically 4KB). When a CPU tries to access a virtual page not present in physical RAM, the MMU triggers a Page Fault hardware interrupt, causing the OS to fetch the page from disk into an available frame.',
      },
      {
        q: 'What is the difference between a Mutex and a Semaphore?',
        a: 'A Mutex (Mutual Exclusion) is a locking mechanism with ownership: only the thread that locked the mutex can unlock it. A Semaphore is a signaling mechanism (counter): any thread can signal (increment) or wait (decrement). A Counting Semaphore allows up to N threads to access a resource pool simultaneously, while a Binary Semaphore acts like a signal flag without ownership.',
      },
    ],
  },
  dbms: {
    title: 'Database Management Systems (DBMS & SQL)',
    icon: Database,
    questions: [
      {
        q: 'What are ACID properties in database transactions?',
        a: '• Atomicity: All operations in a transaction succeed together, or the entire transaction is rolled back (All or Nothing).\n• Consistency: The database transitions from one valid state to another, enforcing all schema constraints, foreign keys, and triggers.\n• Isolation: Concurrent transactions execute without interfering with one another (isolation levels: Read Uncommitted, Read Committed, Repeatable Read, Serializable).\n• Durability: Once a transaction commits, its modifications are permanently recorded on disk even across system crashes or power failures (via Write-Ahead Logging / WAL).',
      },
      {
        q: 'Explain Database Indexing and why B+ Trees are preferred over Hash Indexes.',
        a: 'An Index is an auxiliary data structure that accelerates data retrieval without scanning the entire table. B+ Trees are preferred for relational databases because all data pointers reside in leaf nodes connected as a linked list, enabling rapid Range Queries (e.g. WHERE age BETWEEN 20 AND 30) in O(log N) time, whereas Hash Indexes only support exact equality lookups (O(1)) and completely fail on ranges.',
      },
      {
        q: 'What is Database Normalization (1NF, 2NF, 3NF, BCNF)?',
        a: 'Normalization minimizes data redundancy and avoids insertion, update, and deletion anomalies:\n• 1NF: Atomic values only (no repeating groups or arrays in columns).\n• 2NF: 1NF + No partial functional dependencies (all non-key attributes fully depend on the entire primary key).\n• 3NF: 2NF + No transitive dependencies (non-key attributes do not depend on other non-key attributes).\n• BCNF: Stricter version of 3NF where for every functional dependency X -> Y, X must be a super key.',
      },
      {
        q: 'What is the difference between SQL (Relational) and NoSQL databases?',
        a: 'SQL (PostgreSQL, MySQL): Structured schema, ACID compliance, relational tables, vertical scaling, optimal for complex joins and financial transactions. NoSQL (MongoDB, Cassandra, Redis): Dynamic schema, document/key-value/column-family models, horizontal scaling, BASE consistency, optimal for massive unstructured data and high write throughput.',
      },
    ],
  },
  cn: {
    title: 'Computer Networks (CN)',
    icon: Globe,
    questions: [
      {
        q: 'Describe the TCP 3-Way Handshake and 4-Way Connection Teardown.',
        a: 'Handshake (Connection Establishment):\n1. Client sends SYN (Synchronize Sequence Number).\n2. Server responds with SYN-ACK (Acknowledges client SYN and sends server SYN).\n3. Client sends ACK (Acknowledges server SYN). Connection established!\nTeardown (Termination):\n1. Client sends FIN. 2. Server sends ACK. 3. Server sends FIN. 4. Client sends ACK and enters TIME_WAIT state (2MSL) before closing.',
      },
      {
        q: 'What happens when you type https://www.google.com in your browser and press Enter?',
        a: '1. DNS Lookup: Browser cache -> OS cache -> Router -> Recursive DNS resolver to resolve IP.\n2. TCP Handshake: 3-way SYN, SYN-ACK, ACK on port 443.\n3. TLS Handshake: Key exchange, certificate verification, and session key negotiation.\n4. HTTP Request: Client sends GET / over encrypted TLS channel.\n5. Server Processing & Response: Load balancer routes request to backend, returning HTTP 200 with HTML.\n6. Browser Rendering: DOM & CSSOM constructed, layout computed, pixels painted on screen.',
      },
      {
        q: 'Compare HTTP/1.1 vs HTTP/2 vs HTTP/3.',
        a: '• HTTP/1.1: Text-based, head-of-line (HOL) blocking at application level, multiple TCP connections needed.\n• HTTP/2: Binary protocol, multiplexing over a single TCP connection, HPACK header compression, Server Push.\n• HTTP/3: Uses QUIC over UDP instead of TCP, eliminating transport-level head-of-line blocking during packet loss and enabling zero-RTT handshakes.',
      },
    ],
  },
  oops: {
    title: 'Object-Oriented Programming (OOPs)',
    icon: Code2,
    questions: [
      {
        q: 'What are the 4 fundamental pillars of OOPs with examples?',
        a: '1. Encapsulation: Bundling data and methods into a single class and restricting direct access using access modifiers (private, protected, public).\n2. Abstraction: Hiding internal implementation complexities and exposing only high-level interfaces (e.g. abstract classes and interfaces).\n3. Inheritance: Reusing and extending existing class functionality in a hierarchical child relationship.\n4. Polymorphism: Ability to take many forms via Compile-time (Method Overloading) or Runtime (Method Overriding / Dynamic Method Dispatch).',
      },
      {
        q: 'Explain the SOLID Principles of Object-Oriented Software Design.',
        a: '• S - Single Responsibility: A class should have one, and only one, reason to change.\n• O - Open/Closed: Software entities should be open for extension, but closed for modification.\n• L - Liskov Substitution: Subtypes must be substitutable for their base types without breaking behavior.\n• I - Interface Segregation: Clients should not be forced to depend on interfaces they do not use.\n• D - Dependency Inversion: Depend on abstractions rather than concrete implementations.',
      },
    ],
  },
}

export default function CoreSubjectsView() {
  const [activeSubject, setActiveSubject] = useState('os')
  const [search, setSearch] = useState('')
  const [expandedIndex, setExpandedIndex] = useState(0)

  const currentData = CORE_SUBJECTS_DATA[activeSubject]
  const Icon = currentData.icon

  const filteredQuestions = currentData.questions.filter(
    (item) =>
      item.q.toLowerCase().includes(search.toLowerCase()) ||
      item.a.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="w-full max-w-[1600px] mx-auto py-4 px-2 sm:px-4 space-y-6">
      {/* Title */}
      <div className="border-b border-[#eae6dc] pb-4">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 uppercase">
          COMPUTER SCIENCE CORE SUBJECTS
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed mt-1">
          Essential CS fundamentals requested in every campus placement and tech interview: Operating Systems, DBMS & SQL,
          Computer Networks, and Object-Oriented Design.
        </p>
      </div>

      {/* Subject Navigation Tabs */}
      <div className="flex flex-wrap gap-2.5">
        {Object.entries(CORE_SUBJECTS_DATA).map(([key, item]) => {
          const SubIcon = item.icon
          const isActive = activeSubject === key

          return (
            <button
              key={key}
              onClick={() => {
                setActiveSubject(key)
                setExpandedIndex(0)
              }}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition shadow-xs ${
                isActive
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white border border-[#eae6dc] text-slate-700 hover:bg-slate-50'
              }`}
            >
              <SubIcon size={16} className={isActive ? 'text-emerald-400' : 'text-slate-500'} />
              <span>{item.title}</span>
            </button>
          )
        })}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder={`Search ${currentData.title} interview questions & answers...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 shadow-2xs"
        />
      </div>

      {/* Questions Accordion */}
      <div className="space-y-4">
        {filteredQuestions.map((item, idx) => {
          const isExpanded = expandedIndex === idx

          return (
            <div
              key={idx}
              className="rounded-2xl border border-[#eae6dc] bg-white overflow-hidden shadow-xs hover:border-slate-300 transition"
            >
              <div
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 transition select-none"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-100 text-slate-800 font-black text-xs shrink-0">
                    Q{idx + 1}
                  </span>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">{item.q}</h3>
                </div>
                {isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
              </div>

              {isExpanded && (
                <div className="border-t border-slate-100 bg-[#faf9f5] p-5 sm:p-6 space-y-2">
                  <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Model Interview Answer & Explanation
                  </p>
                  <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-white p-4 rounded-xl border border-slate-200">
                    {item.a}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {filteredQuestions.length === 0 && (
          <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            No questions matching your search term.
          </div>
        )}
      </div>
    </div>
  )
}
