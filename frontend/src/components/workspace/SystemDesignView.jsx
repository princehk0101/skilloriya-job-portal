import React, { useState } from 'react'
import {
  Cpu,
  Layers,
  Server,
  Database,
  Cloud,
  Network,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react'

const SYSTEM_DESIGN_TOPICS = [
  {
    id: 'sd-1',
    title: 'Load Balancing & Reverse Proxies',
    category: 'Core Concept',
    icon: Network,
    summary: 'Distributing incoming network traffic across multiple backend servers to prevent bottlenecks and ensure high availability.',
    points: [
      'Layer 4 (Transport) vs Layer 7 (Application) Load Balancing.',
      'Algorithms: Round Robin, Least Connections, IP Hash, Weighted Round Robin.',
      'Health checking and automatic failover.',
      'Tools: NGINX, HAProxy, AWS ALB / NLB.',
    ],
  },
  {
    id: 'sd-2',
    title: 'Caching Strategies & Redis',
    category: 'Core Concept',
    icon: Server,
    summary: 'Temporary fast storage layer (in-memory) to drastically reduce database load and latency for read-heavy systems.',
    points: [
      'Patterns: Cache-Aside (Lazy Loading), Write-Through, Write-Behind (Write-Back), Refresh-Ahead.',
      'Eviction Policies: LRU (Least Recently Used), LFU, FIFO, TTL expiry.',
      'Cache Stampede & Cache Penetration mitigation with bloom filters and mutex locks.',
      'Tools: Redis, Memcached, CDN edge caches (Cloudflare, AWS CloudFront).',
    ],
  },
  {
    id: 'sd-3',
    title: 'Database Sharding & Replication',
    category: 'Core Concept',
    icon: Database,
    summary: 'Horizontally partitioning huge databases across independent server nodes and replicating data for fault tolerance.',
    points: [
      'Primary-Replica (Master-Slave) replication for read scaling.',
      'Horizontal Sharding by Hash, Range, or Directory-based routing.',
      'Consistent Hashing with virtual nodes to prevent massive data migration during node add/remove.',
      'Challenges: Cross-shard joins, distributed transactions (2-Phase Commit).',
    ],
  },
  {
    id: 'sd-4',
    title: 'Message Queues & Event Streaming',
    category: 'Core Concept',
    icon: Cloud,
    summary: 'Asynchronous communication buffers enabling decoupled microservices and smoothing out peak traffic spikes.',
    points: [
      'Point-to-Point (Queue) vs Publish-Subscribe (Topic) messaging.',
      'Message delivery semantics: At-most-once, At-least-once, Exactly-once.',
      'Backpressure handling and consumer dead-letter queues (DLQ).',
      'Tools: Apache Kafka (high-throughput partitioned logs), RabbitMQ (flexible AMQP routing), AWS SQS.',
    ],
  },
]

const CASE_STUDIES = [
  {
    id: 'cs-1',
    title: 'Design URL Shortener (TinyURL)',
    scale: '100M URLs generated per month | 10:1 Read to Write ratio',
    coreComponents: [
      'API Gateway / Rate Limiter to protect against scrapers.',
      'Key Generation Service (KGS) to pre-generate unique 7-character Base62 keys.',
      'NoSQL Key-Value Store (MongoDB / DynamoDB / Redis) for sub-millisecond redirect lookups.',
      '301 (Permanent) vs 302 (Temporary) HTTP redirect status codes.',
    ],
    schema: 'ShortLink { id, short_key, original_url, created_at, expires_at, user_id }',
  },
  {
    id: 'cs-2',
    title: 'Design Real-Time Chat App (WhatsApp / Slack)',
    scale: '500M Daily Active Users | Low latency < 100ms message delivery',
    coreComponents: [
      'Persistent bi-directional WebSocket connections managed by a Gateway cluster.',
      'Message Service paired with Apache Kafka for fan-out and ordered message dispatch.',
      'Cassandra / ScyllaDB for high-throughput write-heavy chat history storage.',
      'Redis Pub/Sub for managing active online presence and typing indicators.',
    ],
    schema: 'Message { message_id, conversation_id, sender_id, text, timestamp, delivery_status }',
  },
  {
    id: 'cs-3',
    title: 'Design Video Streaming Platform (YouTube / Netflix)',
    scale: 'Billions of hours streamed daily | Global multi-CDN delivery',
    coreComponents: [
      'Video Upload Pipeline: S3 chunked uploads, transcoding into multiple resolutions (1080p, 720p, 480p) via HLS/DASH.',
      'Adaptive Bitrate Streaming (ABR) dynamically shifting video resolution based on client network bandwidth.',
      'Global CDN Edge servers caching popular segments locally close to viewers.',
      'Metadata & recommendation engine backed by Elasticsearch & vector database.',
    ],
    schema: 'VideoMeta { video_id, title, uploader_id, hls_manifest_url, duration, views_count }',
  },
]

export default function SystemDesignView() {
  const [activeTab, setActiveTab] = useState('concepts') // 'concepts' | 'cases'
  const [expandedId, setExpandedId] = useState('cs-1')

  return (
    <div className="w-full max-w-[1600px] mx-auto py-4 px-2 sm:px-4 space-y-6">
      {/* Title */}
      <div className="border-b border-[#eae6dc] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 uppercase">
            SYSTEM DESIGN & ARCHITECTURE
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed mt-1">
            Master High-Level Design (HLD) and Low-Level Design (LLD) architectural principles, trade-offs, and complete
            system walkthroughs for Senior / SDE 2+ interviews.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab('concepts')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'concepts' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Core Building Blocks
          </button>
          <button
            onClick={() => setActiveTab('cases')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'cases' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            End-to-End Case Studies
          </button>
        </div>
      </div>

      {/* View 1: Core Building Blocks */}
      {activeTab === 'concepts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SYSTEM_DESIGN_TOPICS.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-[#eae6dc] bg-white p-5 sm:p-6 shadow-xs space-y-4 hover:border-slate-300 transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-lg bg-blue-50 text-blue-700 px-2 py-0.5 text-[10px] font-bold border border-blue-200">
                      {item.category}
                    </span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                      <Icon size={18} />
                    </div>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.summary}</p>

                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-2">Key Highlights & Trade-offs</p>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {item.points.map((pt, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 size={13} className="text-emerald-600 mt-0.5 shrink-0" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* View 2: End-to-End System Design Case Studies */}
      {activeTab === 'cases' && (
        <div className="space-y-4">
          {CASE_STUDIES.map((study) => {
            const isExpanded = expandedId === study.id

            return (
              <div
                key={study.id}
                className="rounded-2xl border border-[#eae6dc] bg-white shadow-xs overflow-hidden"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : study.id)}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 transition select-none"
                >
                  <div>
                    <h3 className="text-base font-black text-slate-900">{study.title}</h3>
                    <p className="text-xs text-emerald-700 font-bold mt-0.5">{study.scale}</p>
                  </div>
                  {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-100 bg-[#faf9f5] p-5 sm:p-6 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                        Architectural Blueprint & Flow
                      </h4>
                      <ul className="space-y-2 text-xs text-slate-700">
                        {study.coreComponents.map((c, i) => (
                          <li key={i} className="flex items-start gap-2 bg-white p-3 rounded-xl border border-slate-200">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white text-[10px] font-bold shrink-0">
                              {i + 1}
                            </span>
                            <span className="leading-relaxed">{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-xl bg-[#1e1e24] p-4 text-slate-100 font-mono text-xs">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Database Model Schema</p>
                      <code className="text-emerald-300">{study.schema}</code>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
