import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import {
  MessageSquare,
  X,
  Send,
  Loader2,
  User,
  Search,
  Briefcase,
  CheckCheck,
  Minimize2,
  Maximize2,
  Video,
  Building2,
  ExternalLink,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const ChatDrawer = ({ isOpen, onClose, initialPartnerId = null, initialJobId = null }) => {
  const [isOpenLocal, setIsOpenLocal] = useState(isOpen || false)
  const [conversations, setConversations] = useState([])
  const [selectedPartner, setSelectedPartner] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [loadingConversations, setLoadingConversations] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMinimized, setIsMinimized] = useState(false)

  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (typeof isOpen === 'boolean') {
      setIsOpenLocal(isOpen)
    }
  }, [isOpen])

  useEffect(() => {
    const handleOpenChat = (e) => {
      setIsOpenLocal(true)
      setIsMinimized(false)
      if (e.detail?.partnerId) {
        setSelectedPartner({
          partner_id: e.detail.partnerId,
          partner_name: e.detail.partnerName || 'Recruiter / Candidate',
          job_title: e.detail.jobTitle || '',
          partner_company: e.detail.companyName || '',
        })
        loadMessages(e.detail.partnerId)
      }
      loadConversations()
    }
    window.addEventListener('open-chat', handleOpenChat)
    return () => window.removeEventListener('open-chat', handleOpenChat)
  }, [])

  const getAuthConfig = () => {
    const token = localStorage.getItem('access_token')
    return { headers: { Authorization: `Bearer ${token}` } }
  }

  const loadConversations = async () => {
    const token = localStorage.getItem('access_token')
    if (!token) return

    setLoadingConversations(true)
    try {
      const res = await axios.get('/api/chat/conversations/', getAuthConfig())
      setConversations(res.data || [])
    } catch (err) {
      console.error('Failed to load conversations:', err)
    } finally {
      setLoadingConversations(false)
    }
  }

  const loadMessages = async (partnerId) => {
    if (!partnerId) return
    setLoadingMessages(true)
    try {
      const res = await axios.get(`/api/chat/messages/${partnerId}/`, getAuthConfig())
      setMessages(res.data || [])
    } catch (err) {
      console.error('Failed to load messages:', err)
    } finally {
      setLoadingMessages(false)
    }
  }

  useEffect(() => {
    if (isOpenLocal) {
      loadConversations()
    }
  }, [isOpenLocal])

  useEffect(() => {
    if (initialPartnerId && isOpenLocal) {
      setSelectedPartner({
        partner_id: initialPartnerId,
        partner_name: 'Candidate / Recruiter',
      })
      loadMessages(initialPartnerId)
    }
  }, [initialPartnerId, isOpenLocal])

  useEffect(() => {
    if (selectedPartner?.partner_id && isOpenLocal) {
      loadMessages(selectedPartner.partner_id)
      const interval = setInterval(() => {
        loadMessages(selectedPartner.partner_id)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [selectedPartner?.partner_id, isOpenLocal])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleStartVideoMeeting = async () => {
    if (!selectedPartner?.partner_id || sending) return
    const roomId = `meet-${selectedPartner.partner_id}-${Date.now().toString().slice(-6)}`
    const meetingMessage = `🎥 Live Video Meeting Room Created!\nJoin interview: /interview/${roomId}`

    setSending(true)
    try {
      const res = await axios.post(
        '/api/chat/send/',
        {
          recipient_id: selectedPartner.partner_id,
          content: meetingMessage,
          job_id: selectedPartner.job_id || initialJobId || null,
        },
        getAuthConfig()
      )
      setMessages((prev) => [...prev, res.data])
      loadConversations()
      window.open(`/interview/${roomId}`, '_blank')
    } catch (err) {
      console.error('Failed to start video meeting:', err)
    } finally {
      setSending(false)
    }
  }

  const handleSendMessage = async (e) => {
    e?.preventDefault()
    if (!inputText.trim() || !selectedPartner?.partner_id || sending) return

    const textToSend = inputText.trim()
    setInputText('')
    setSending(true)

    try {
      const res = await axios.post(
        '/api/chat/send/',
        {
          recipient_id: selectedPartner.partner_id,
          content: textToSend,
          job_id: selectedPartner.job_id || initialJobId || null,
        },
        getAuthConfig()
      )
      setMessages((prev) => [...prev, res.data])
      loadConversations()
    } catch (err) {
      console.error('Failed to send message:', err)
    } finally {
      setSending(false)
    }
  }

  const handleClose = () => {
    setIsOpenLocal(false)
    onClose?.()
  }

  if (!isOpenLocal) return null

  const filteredConversations = conversations.filter((c) =>
    c.partner_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.partner_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.partner_company?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      <div
        className={`w-[94vw] max-w-[440px] sm:w-[440px] overflow-hidden rounded-[2rem] border border-blue-200/80 bg-white/95 shadow-[0_24px_70px_rgba(37,99,235,0.25)] backdrop-blur-xl transition-all duration-300 ${
          isMinimized ? 'h-16' : 'h-[600px]'
        }`}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-600 px-5 text-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <MessageSquare size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold truncate">
                {selectedPartner ? selectedPartner.partner_name : 'Skilloria Recruiter & Candidate Chat'}
              </h3>
              <p className="text-[11px] text-blue-100/80 truncate">
                {selectedPartner ? (
                  `${selectedPartner.partner_company ? `${selectedPartner.partner_company} · ` : ''}${selectedPartner.partner_role === 'employer' ? 'Recruiter' : 'Candidate'}`
                ) : 'Direct messaging & live video meets'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {selectedPartner ? (
              <button
                onClick={handleStartVideoMeeting}
                className="flex items-center gap-1 rounded-xl bg-emerald-500/30 px-2.5 py-1 text-xs font-bold text-emerald-200 hover:bg-emerald-500/50 transition border border-emerald-400/40"
                title="Start Instant Video Meeting"
              >
                <Video size={13} />
                <span>Meet</span>
              </button>
            ) : null}
            {selectedPartner ? (
              <button
                onClick={() => setSelectedPartner(null)}
                className="rounded-lg p-1.5 text-blue-100 hover:bg-white/15"
                title="Back to all chats"
              >
                Chats
              </button>
            ) : null}
            <button
              onClick={() => setIsMinimized((prev) => !prev)}
              className="rounded-lg p-1.5 text-blue-100 hover:bg-white/15"
            >
              {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </button>
            <button
              onClick={handleClose}
              className="rounded-lg p-1.5 text-blue-100 hover:bg-white/15"
            >
              <X size={18} />
            </button>
          </div>
        </div>


        {!isMinimized ? (
          <div className="flex h-[516px] flex-col">
            {/* Conversation List Screen */}
            {!selectedPartner ? (
              <div className="flex flex-1 flex-col overflow-hidden p-3">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search messages..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div className="flex-1 overflow-y-auto space-y-1.5">
                  {loadingConversations ? (
                    <div className="flex h-40 items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="flex h-60 flex-col items-center justify-center text-center p-6 text-slate-400">
                      <MessageSquare size={32} className="mb-2 text-slate-300" />
                      <p className="text-sm font-semibold text-slate-700">No conversations yet</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Apply to a job or message candidate from the dashboard to start chatting.
                      </p>
                    </div>
                  ) : (
                    filteredConversations.map((conv) => (
                      <button
                        key={conv.partner_id}
                        onClick={() => {
                          setSelectedPartner(conv)
                          loadMessages(conv.partner_id)
                        }}
                        className="flex w-full items-center justify-between rounded-2xl p-3 text-left transition hover:bg-blue-50/80 border border-transparent hover:border-blue-100"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm shadow-sm">
                            {conv.partner_name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="truncate text-xs font-bold text-slate-900">{conv.partner_name}</p>
                              {conv.partner_role === 'employer' ? (
                                <span className="rounded bg-blue-100 px-1.5 py-0.2 text-[9px] font-extrabold text-blue-700">
                                  Recruiter
                                </span>
                              ) : null}
                            </div>
                            {conv.partner_company ? (
                              <p className="truncate text-[10px] font-semibold text-indigo-600 flex items-center gap-1 mt-0.5">
                                <Building2 size={10} />
                                {conv.partner_company}
                              </p>
                            ) : null}
                            {conv.job_title ? (
                              <p className="truncate text-[10px] text-slate-500 flex items-center gap-1">
                                <Briefcase size={10} />
                                Re: {conv.job_title}
                              </p>
                            ) : null}
                            <p className="truncate text-[11px] text-slate-400 mt-0.5">{conv.last_message || 'Ready to chat'}</p>
                          </div>
                        </div>

                        {conv.unread_count > 0 ? (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white shadow">
                            {conv.unread_count}
                          </span>
                        ) : null}
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : (
              /* Active Chat Screen */
              <div className="flex flex-1 flex-col overflow-hidden">
                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                  {loadingMessages ? (
                    <div className="flex h-40 items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center text-xs text-slate-400 p-6">
                      <MessageSquare size={32} className="mb-2 text-slate-300" />
                      <p className="font-semibold text-slate-700">Start conversation with {selectedPartner.partner_name}</p>
                      <p className="text-[11px] text-slate-400 mt-1">Send a message or launch a video meet below.</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.recipient === selectedPartner.partner_id || msg.recipient_email === selectedPartner.partner_email
                      const isMeeting = msg.content?.includes('/interview/')

                      let meetingPath = null
                      if (isMeeting) {
                        const match = msg.content.match(/\/interview\/[a-zA-Z0-9_\-]+/)
                        if (match) meetingPath = match[0]
                      }

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-sm ${
                              isMe
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-slate-900 border border-slate-200/80'
                            }`}
                          >
                            {msg.job_title ? (
                              <div className="mb-1 flex items-center gap-1 text-[10px] font-semibold opacity-85">
                                <Briefcase size={10} />
                                <span>Re: {msg.job_title}</span>
                              </div>
                            ) : null}
                            <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                            {meetingPath && (
                              <div className="mt-2.5 pt-2 border-t border-white/20">
                                <Link
                                  to={meetingPath}
                                  target="_blank"
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-600 transition shadow"
                                >
                                  <Video size={13} />
                                  <span>Join Video Meeting Now ↗</span>
                                </Link>
                              </div>
                            )}
                          </div>
                          <span className="mt-1 text-[10px] text-slate-400 px-1">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Box */}
                <form
                  onSubmit={handleSendMessage}
                  className="border-t border-slate-200/80 bg-white p-3 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || sending}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={15} />}
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default ChatDrawer
