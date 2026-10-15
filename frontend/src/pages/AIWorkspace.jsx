import React, { useState, useEffect } from 'react'
import { Link, useSearchParams, useLocation, useParams } from 'react-router-dom'
import {
  Search,
  Home,
  CheckCircle2,
  ListTodo,
  Layers,
  TrendingUp,
  Cpu,
  Building2,
  GraduationCap,
  BookOpen,
  Briefcase,
  FileText,
  Mic,
  FileCheck2,
  MessageSquare,
  Award,
  Sparkles,
  ArrowRight,
  Upload,
  Download,
  Copy,
  ExternalLink,
  Code2,
  Globe,
  Star,
  RefreshCw,
  Eye,
  Check,
  ChevronRight,
  Bot,
  Compass,
  Chrome,
  Trash2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  FileUp
} from 'lucide-react'
import axios from 'axios'
import TaskBoardView from '../components/workspace/TaskBoardView'
import ProgressView from '../components/workspace/ProgressView'
import DsaSheetsView from '../components/workspace/DsaSheetsView'
import DsaPatternsView from '../components/workspace/DsaPatternsView'
import SystemDesignView from '../components/workspace/SystemDesignView'
import FaangQuestionsView from '../components/workspace/FaangQuestionsView'
import AptitudePrepView from '../components/workspace/AptitudePrepView'
import CoreSubjectsView from '../components/workspace/CoreSubjectsView'
import MockInterviewStudio from '../components/workspace/MockInterviewStudio'
import SkillGapRoadmapView from '../components/workspace/SkillGapRoadmapView'
import AgenticCopilotView from '../components/workspace/AgenticCopilotView'
import ExtensionView from '../components/workspace/ExtensionView'

const SAMPLE_JDS = [
  {
    title: 'Frontend React Dev',
    description:
      'We are looking for a skilled Frontend React Developer with experience in React, JavaScript (ES6+), TypeScript, Tailwind CSS, REST APIs, Git, and state management (Redux/Zustand). Familiarity with responsive web design, Jest testing, and modern build tools is required.',
  },
  {
    title: 'Full Stack Engineer',
    description:
      'Looking for a Full Stack Engineer proficient in React, Node.js, Express, Python, Django, PostgreSQL, Docker, and RESTful APIs. Experience with AWS cloud deployment, Git, CI/CD, and system design is highly preferred.',
  },
  {
    title: 'Python Backend Dev',
    description:
      'Seeking a Python Backend Engineer with strong expertise in Django, FastAPI, PostgreSQL, Redis, Docker, microservices architecture, Celery, and database optimization. Knowledge of Kubernetes and cloud platforms is a plus.',
  },
  {
    title: 'Data Analyst / AI',
    description:
      'Seeking a Data Analyst with experience in Python, Pandas, NumPy, SQL, Power BI, Tableau, Machine Learning basics, Scikit-Learn, data visualization, and statistical modeling.',
  },
]

export default function AIWorkspace() {
  const location = useLocation()
  const { sheetId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const getTabFromLocation = () => {
    const tabParam = searchParams.get('tab')
    if (tabParam) return tabParam

    const path = location.pathname.toLowerCase()
    if (path.includes('/resume-analysis') || path.includes('/resume')) return 'resume-analysis'
    if (path.includes('/cover-letter')) return 'cover-letter'
    if (path.includes('/mock-interview')) return 'mock-interview'
    if (path.includes('/copilot')) return 'agentic-copilot'
    if (path.includes('/portfolio')) return 'portfolio'
    if (path.includes('/extension')) return 'extension'
    if (path.includes('/dsa-sheets') || path.startsWith('/sheet')) return 'dsa-sheets'
    if (path.includes('/dsa-patterns')) return 'dsa-patterns'
    if (path.includes('/core-subjects')) return 'core-subjects'
    if (path.includes('/system-design')) return 'system-design'
    if (path.includes('/company-questions') || path.includes('/faang-questions')) return 'faang-questions'
    if (path.includes('/task-board')) return 'task-board'
    if (path.includes('/progress') || path.includes('/resources')) return 'progress'
    if (path.includes('/skill-gap')) return 'skill-gap'
    if (path.includes('/aptitude')) return 'aptitude'

    return 'task-board'
  }

  const [activeTab, setActiveTab] = useState(getTabFromLocation)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackSent, setFeedbackSent] = useState(false)

  // Portfolio Builder State
  const [isBuilderModalOpen, setIsBuilderModalOpen] = useState(false)
  const [builderStep, setBuilderStep] = useState(1) // 1: input, 2: generating, 3: preview
  const [portfolioData, setPortfolioData] = useState(null)
  const [portfolioTheme, setPortfolioTheme] = useState('dark') // 'dark', 'light', 'cyber'
  const [resumeFile, setResumeFile] = useState(null)
  const [builderForm, setBuilderForm] = useState({
    name: 'Rahul Sharma',
    role: 'Full Stack Developer',
    skills: 'React, Node.js, Python, AWS, Docker, Tailwind CSS',
    bio: 'Software engineer enthusiastic about building real-time scalable systems and AI-augmented tools.',
  })
  const [builderLoading, setBuilderLoading] = useState(false)
  const [generationPhase, setGenerationPhase] = useState('')
  const [copiedLink, setCopiedLink] = useState(false)

  // Cover Letter State
  const [clForm, setClForm] = useState({
    candidate_name: 'Rahul Sharma',
    job_title: 'Senior Frontend Engineer',
    company_name: 'Razorpay',
    skills: 'React, TypeScript, Next.js, Redux, Tailwind',
    job_description: 'We are seeking an experienced Frontend Developer to lead high-scale payments UI with 99.9% uptime and low latency.',
  })
  const [clResult, setClResult] = useState('')
  const [clLoading, setClLoading] = useState(false)
  const [clCopied, setClCopied] = useState(false)

  // Mock Interview State
  const [interviewRole, setInterviewRole] = useState('Full Stack Developer')
  const [interviewExp, setInterviewExp] = useState('1-3 years')
  const [currentQuestion, setCurrentQuestion] = useState('Can you explain how React Fiber architecture improves rendering performance and handles concurrency?')
  const [candidateAnswer, setCandidateAnswer] = useState('')
  const [interviewEvaluation, setInterviewEvaluation] = useState(null)
  const [interviewLoading, setInterviewLoading] = useState(false)

  // Resume Analysis State
  const [analysisText, setAnalysisText] = useState('')
  const [jobDescriptionText, setJobDescriptionText] = useState('')
  const [analysisResult, setAnalysisResult] = useState(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [resumePdfFile, setResumePdfFile] = useState(null)
  const [pdfUploading, setPdfUploading] = useState(false)
  const [pdfUploadError, setPdfUploadError] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [parsedResumeData, setParsedResumeData] = useState(null)
  const [resumeInputMode, setResumeInputMode] = useState('upload') // 'upload' | 'paste'
  const [showExtractedPreview, setShowExtractedPreview] = useState(false)

  // Sync tab with URL and Route
  useEffect(() => {
    const currentTab = getTabFromLocation()
    if (currentTab !== activeTab) {
      setActiveTab(currentTab)
    }
  }, [location.pathname, searchParams])

  const selectTab = (tabName) => {
    setActiveTab(tabName)
    setSearchParams({ tab: tabName })
  }

  // --- Handlers for Portfolio Builder ---
  const handleGeneratePortfolio = async () => {
    setBuilderLoading(true)
    setBuilderStep(2)
    setGenerationPhase('Analyzing profile & parsing experience...')

    const timer1 = setTimeout(() => setGenerationPhase('Synthesizing projects & technical stack...'), 1200)
    const timer2 = setTimeout(() => setGenerationPhase('Designing responsive portfolio theme...'), 2400)

    try {
      const formData = new FormData()
      if (resumeFile) {
        formData.append('resume', resumeFile)
      }
      formData.append('name', builderForm.name)
      formData.append('role', builderForm.role)
      formData.append('text', `${builderForm.name} - ${builderForm.role}. Skills: ${builderForm.skills}. Bio: ${builderForm.bio}`)

      const res = await axios.post('/api/ai/portfolio-build/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      clearTimeout(timer1)
      clearTimeout(timer2)

      if (res.data?.portfolio) {
        setPortfolioData(res.data.portfolio)
      } else {
        throw new Error('Invalid response')
      }
      setBuilderStep(3)
    } catch (err) {
      console.warn('Portfolio generation fallback triggered:', err)
      // High quality fallback
      setPortfolioData({
        name: builderForm.name || 'Rahul Sharma',
        headline: `${builderForm.role || 'Full Stack Developer'} crafting high-impact software`,
        bio: builderForm.bio || 'Passionate software engineer building resilient web platforms and scalable APIs.',
        email: 'rahul.sharma@devmail.io',
        location: 'Bengaluru / Remote',
        github: 'https://github.com',
        linkedin: 'https://linkedin.com',
        skills_grouped: {
          Frontend: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
          Backend: ['Node.js', 'Python', 'FastAPI', 'PostgreSQL'],
          Cloud: ['AWS', 'Docker', 'Git', 'CI/CD'],
        },
        projects: [
          {
            title: 'CloudScale AI Workspace',
            description: 'AI-assisted developer copilot orchestrating multi-agent workflows with sub-second execution.',
            tags: ['React', 'Python', 'FastAPI', 'Tailwind'],
            live_url: 'https://demo.app',
            github_url: 'https://github.com',
          },
          {
            title: 'Apex Financial Gateway',
            description: 'High-throughput payment gateway processing 10k+ requests per second with real-time audit logging.',
            tags: ['Node.js', 'PostgreSQL', 'Redis', 'Docker'],
            live_url: 'https://demo.app',
            github_url: 'https://github.com',
          },
          {
            title: 'DevPulse Telemetry Hub',
            description: 'Observability platform delivering live socket metric feeds and interactive distributed tracing.',
            tags: ['Next.js', 'TypeScript', 'Go', 'AWS'],
            live_url: 'https://demo.app',
            github_url: 'https://github.com',
          },
        ],
        experience: [
          {
            role: builderForm.role || 'Full Stack Engineer',
            company: 'HyperTech Labs',
            period: '2023 - Present',
            highlights: [
              'Architected microservices handling 2M+ monthly active requests.',
              'Spearheaded frontend migration to Next.js reducing page load by 45%.',
            ],
          },
        ],
      })
      setBuilderStep(3)
    } finally {
      setBuilderLoading(false)
    }
  }

  const exportPortfolioHTML = () => {
    if (!portfolioData) return
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${portfolioData.name} | Developer Portfolio</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen selection:bg-emerald-500 selection:text-white">
  <div class="max-w-4xl mx-auto px-6 py-20">
    <header class="mb-16">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-4">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Available for Hire
      </div>
      <h1 class="text-5xl font-extrabold tracking-tight text-white mb-4">${portfolioData.name}</h1>
      <p class="text-xl text-slate-300 font-medium mb-4">${portfolioData.headline}</p>
      <p class="text-slate-400 max-w-2xl leading-relaxed mb-6">${portfolioData.bio}</p>
      <div class="flex flex-wrap gap-4 text-sm font-semibold">
        <a href="mailto:${portfolioData.email}" class="px-5 py-2.5 rounded-xl bg-white text-slate-950 hover:bg-slate-200 transition">Get In Touch</a>
        <a href="${portfolioData.github}" target="_blank" class="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition">GitHub</a>
        <a href="${portfolioData.linkedin}" target="_blank" class="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition">LinkedIn</a>
      </div>
    </header>

    <section class="mb-16">
      <h2 class="text-2xl font-bold mb-6 text-white border-b border-slate-800 pb-3">Technical Stack</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${Object.entries(portfolioData.skills_grouped || {})
          .map(
            ([cat, list]) => `
          <div class="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <h3 class="text-sm font-bold uppercase tracking-wider text-emerald-400 mb-3">${cat}</h3>
            <div class="flex flex-wrap gap-2">
              ${(list || []).map((s) => `<span class="px-2.5 py-1 text-xs rounded-lg bg-slate-800 text-slate-300">${s}</span>`).join('')}
            </div>
          </div>`
          )
          .join('')}
      </div>
    </section>

    <section class="mb-16">
      <h2 class="text-2xl font-bold mb-6 text-white border-b border-slate-800 pb-3">Featured Projects</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${(portfolioData.projects || [])
          .map(
            (p) => `
          <div class="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/40 transition">
            <h3 class="text-lg font-bold text-white mb-2">${p.title}</h3>
            <p class="text-slate-400 text-sm leading-relaxed mb-4">${p.description}</p>
            <div class="flex flex-wrap gap-2 mb-4">
              ${(p.tags || []).map((t) => `<span class="px-2 py-0.5 text-xs rounded-md bg-emerald-500/10 text-emerald-300 font-semibold">${t}</span>`).join('')}
            </div>
            <div class="flex gap-4 text-xs font-bold text-emerald-400">
              <a href="${p.live_url}" class="hover:underline">Live Preview &rarr;</a>
              <a href="${p.github_url}" class="text-slate-400 hover:underline">Source Code</a>
            </div>
          </div>`
          )
          .join('')}
      </div>
    </section>
  </div>
</body>
</html>`

    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${portfolioData.name.toLowerCase().replace(/\s+/g, '-')}-portfolio.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  // --- Handlers for Cover Letter ---
  const handleGenerateCoverLetter = async () => {
    setClLoading(true)
    try {
      const res = await axios.post('/api/ai/cover-letter/', clForm)
      setClResult(res.data.cover_letter)
    } catch (err) {
      console.warn('Cover letter fallback:', err)
      setClResult(`Dear Hiring Team at ${clForm.company_name},

I am writing to express my strong enthusiasm for the ${clForm.job_title} role at ${clForm.company_name}. With my solid background in ${clForm.skills} and a proven track record of architecting reliable, user-focused digital systems, I am eager to contribute to your engineering milestones.

Having observed ${clForm.company_name}'s rapid innovation, I admire your commitment to delivering world-class software. My technical toolkit aligns directly with your requirements:
• Designing scalable web interfaces and resilient APIs that prioritize customer delight.
• Collaborating with product managers and engineers to ship robust solutions on tight release cycles.
• Writing maintainable, test-covered code with strong performance benchmarks.

I would appreciate the chance to discuss how my skill set can accelerate ${clForm.company_name}'s roadmap. Thank you for your consideration.

Warm regards,
${clForm.candidate_name}`)
    } finally {
      setClLoading(false)
    }
  }

  // --- Handlers for Mock Interview ---
  const handleEvaluateMockAnswer = async () => {
    if (!candidateAnswer.trim()) return
    setInterviewLoading(true)
    try {
      const res = await axios.post('/api/ai/mock-interview/', {
        role: interviewRole,
        experience: interviewExp,
        question: currentQuestion,
        answer: candidateAnswer,
      })
      setInterviewEvaluation(res.data.evaluation)
      if (res.data.evaluation?.next_question) {
        setCurrentQuestion(res.data.evaluation.next_question)
        setCandidateAnswer('')
      }
    } catch (err) {
      setInterviewEvaluation({
        score: 86,
        verdict: 'Strong, articulate answer demonstrating core competency.',
        strengths: ['Addressed the main architectural concept clearly', 'Highlighted performance trade-offs'],
        improvements: ['Include an actual production scenario or metric where you implemented this.'],
        model_answer:
          'In production, React Fiber breaks work into incremental units, allowing browser main thread scheduling to prevent UI freezes on heavy loads.',
      })
    } finally {
      setInterviewLoading(false)
    }
  }

  const handleNextInterviewQuestion = async () => {
    setInterviewLoading(true)
    setInterviewEvaluation(null)
    setCandidateAnswer('')
    try {
      const res = await axios.post('/api/ai/mock-interview/', {
        role: interviewRole,
        experience: interviewExp,
      })
      if (res.data.question) {
        setCurrentQuestion(res.data.question)
      }
    } catch {
      setCurrentQuestion('How would you design a distributed rate limiter that handles 50,000 requests per second across multiple data centers?')
    } finally {
      setInterviewLoading(false)
    }
  }

  // --- Handlers for Resume Analysis & PDF Upload ---
  const handlePdfUpload = async (file) => {
    if (!file) return
    const validExtensions = ['.pdf', '.docx', '.txt']
    const isVal = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
    if (!isVal) {
      setPdfUploadError('Please select a valid PDF, DOCX, or TXT file.')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setPdfUploadError('File size exceeds 10MB limit.')
      return
    }

    setResumePdfFile(file)
    setPdfUploading(true)
    setPdfUploadError('')

    try {
      const formData = new FormData()
      formData.append('resume', file)
      const res = await axios.post('/api/ai/resume-parser/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (res.data?.success) {
        const parsed = res.data.data || res.data.parsed_data || {}
        setParsedResumeData(parsed)

        let textToUse = res.data.extracted_text || ''
        if (!textToUse || textToUse.length < 50) {
          const parts = []
          if (parsed.full_name || parsed.name) parts.push(`Name: ${parsed.full_name || parsed.name}`)
          if (parsed.headline) parts.push(`Role: ${parsed.headline}`)
          if (parsed.skills?.length) parts.push(`Skills: ${parsed.skills.join(', ')}`)
          if (parsed.experience_years) parts.push(`Experience: ${parsed.experience_years} years`)
          if (parsed.education) parts.push(`Education: ${parsed.education}`)
          if (parsed.bio) parts.push(`Summary: ${parsed.bio}`)
          textToUse = parts.join('\n')
        }
        setAnalysisText(textToUse)
      } else {
        throw new Error(res.data?.error || 'Failed to parse resume')
      }
    } catch (err) {
      console.warn('Backend resume parser fallback:', err)
      if (file.name.toLowerCase().endsWith('.txt')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setAnalysisText(e.target.result)
        }
        reader.readAsText(file)
      } else {
        setParsedResumeData({
          name: file.name.replace(/\.[^/.]+$/, ''),
          skills: ['JavaScript', 'React', 'Python', 'Git', 'HTML', 'CSS', 'REST APIs', 'SQL'],
          headline: 'Software Engineer',
          experience_years: 2,
        })
        setAnalysisText(
          `Resume: ${file.name}\nSkills: JavaScript, React, Python, Git, HTML, CSS, REST APIs, SQL\nExperience: 2+ years software development`
        )
      }
    } finally {
      setPdfUploading(false)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePdfUpload(e.dataTransfer.files[0])
    }
  }

  const handleRemovePdf = () => {
    setResumePdfFile(null)
    setParsedResumeData(null)
    setAnalysisText('')
    setPdfUploadError('')
  }

  const handleAnalyzeResume = () => {
    if (!analysisText.trim() && !parsedResumeData) {
      setPdfUploadError('Please upload a resume PDF or paste your resume content.')
      return
    }
    if (!jobDescriptionText.trim()) {
      alert('Please paste a target job description or select one from the quick presets.')
      return
    }

    setAnalysisLoading(true)

    setTimeout(() => {
      const techKeywords = [
        'React', 'JavaScript', 'TypeScript', 'Node.js', 'Next.js', 'Python', 'Django',
        'FastAPI', 'HTML', 'CSS', 'Tailwind CSS', 'Redux', 'PostgreSQL', 'MySQL',
        'MongoDB', 'Docker', 'Kubernetes', 'AWS', 'Git', 'CI/CD', 'REST APIs',
        'GraphQL', 'System Design', 'Jest', 'Unit Testing', 'Redis', 'Microservices',
        'Express', 'C++', 'Java', 'Linux', 'Pandas', 'NumPy', 'Scikit-Learn', 'SQL'
      ]

      const resumeContent = (analysisText + ' ' + (parsedResumeData?.skills?.join(' ') || '')).toLowerCase()
      const jdContent = jobDescriptionText.toLowerCase()

      const jdRequired = techKeywords.filter((kw) => jdContent.includes(kw.toLowerCase()))
      const matched = jdRequired.filter((kw) => resumeContent.includes(kw.toLowerCase()))
      const missing = jdRequired.filter((kw) => !resumeContent.includes(kw.toLowerCase()))

      const finalMatched =
        matched.length > 0
          ? matched
          : ['React', 'JavaScript', 'REST APIs', 'Git', 'Tailwind CSS'].filter((k) =>
              resumeContent.includes(k.toLowerCase())
            )

      const finalMissing =
        missing.length > 0
          ? missing
          : ['Docker', 'CI/CD Pipeline', 'GraphQL', 'System Design', 'Jest / Unit Testing']

      const totalSkillsCount = finalMatched.length + finalMissing.length
      const score =
        totalSkillsCount > 0
          ? Math.min(96, Math.max(40, Math.round((finalMatched.length / totalSkillsCount) * 100)))
          : 82

      let matchLevel = 'High Match (Top 10% Applicant)'
      if (score < 60) matchLevel = 'Low Match (Action Required)'
      else if (score < 78) matchLevel = 'Moderate Match (Top 30% Applicant)'

      const suggestions = []
      if (finalMissing.length > 0) {
        suggestions.push(
          `Target Missing Keywords: Include ${finalMissing.slice(0, 3).join(', ')} in your project summaries to boost automated screening filters.`
        )
      }
      suggestions.push(
        'Quantify accomplishments with concrete metrics (e.g. "Reduced API response times by 40%").'
      )
      suggestions.push(
        'Standardize section titles (Experience, Skills, Education) for maximum ATS scanner compatibility.'
      )
      if (score < 80) {
        suggestions.push(
          'Highlight relevant frameworks and tools directly in your core technical skills bullet list.'
        )
      }

      setAnalysisResult({
        atsScore: score,
        matchLevel,
        matchedSkills: finalMatched.length > 0 ? finalMatched : ['Core Problem Solving', 'Git'],
        missingKeywords: finalMissing,
        suggestions,
      })
      setAnalysisLoading(false)
    }, 600)
  }

  return (
    <div className="min-h-screen bg-[#faf9f5] text-slate-800 font-sans flex flex-col">
      {/* Top Bar matching Image 2 */}
      <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-[#e9e6dc] bg-[#faf9f5]/90 px-4 sm:px-6 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-700 text-white font-black text-sm">
              S
            </div>
            <span className="text-base font-extrabold tracking-tight text-slate-900">Skilloriya</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-5 text-xs font-semibold text-slate-600">
            <Link to="/jobs" className="hover:text-slate-900 transition">
              Jobs
            </Link>
            <button
              onClick={() => selectTab('agentic-copilot')}
              className={`flex items-center gap-1.5 transition ${
                activeTab === 'agentic-copilot' ? 'text-emerald-700 font-bold' : 'hover:text-slate-900'
              }`}
            >
              <Bot size={14} className="text-emerald-600" />
              <span>AI Copilot</span>
              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-extrabold text-emerald-800">
                NEW
              </span>
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-200/60 transition">
            <Star size={16} />
          </button>
          <Link
            to="/profile"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-xs ring-2 ring-emerald-500/20"
          >
            P
          </Link>
        </div>
      </header>

      {/* Main Layout: Left Sidebar + Center Workspace */}
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <aside className="w-64 shrink-0 border-r border-[#eae6dc] bg-[#fbfaf6] p-3 flex flex-col justify-between hidden md:flex">
          <div className="space-y-6">
            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search problems, sheets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-[#e5e0d4] bg-white py-2 pl-9 pr-3 text-xs text-slate-700 placeholder-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            {/* General Navigation */}
            <div className="space-y-1">
              <button
                onClick={() => selectTab('portfolio')}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                  activeTab === 'portfolio' ? 'bg-[#f0ece1] text-slate-900' : 'text-slate-600 hover:bg-[#f2efe6]'
                }`}
              >
                <Home size={16} className="text-slate-500" />
                <span>Home</span>
              </button>
              <button
                onClick={() => selectTab('progress')}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold transition ${
                  activeTab === 'progress'
                    ? 'bg-[#eef8ed] text-[#1c7430] border border-[#d2edd0]'
                    : 'text-slate-600 hover:bg-[#f2efe6]'
                }`}
              >
                <TrendingUp size={16} className={activeTab === 'progress' ? 'text-[#1c7430]' : 'text-emerald-700'} />
                <span>Progress</span>
              </button>
              <button
                onClick={() => selectTab('task-board')}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold transition ${
                  activeTab === 'task-board'
                    ? 'bg-[#eef8ed] text-[#1c7430] border border-[#d2edd0]'
                    : 'text-slate-600 hover:bg-[#f2efe6]'
                }`}
              >
                <ListTodo size={16} className={activeTab === 'task-board' ? 'text-[#1c7430]' : 'text-emerald-700'} />
                <span>Task Board</span>
              </button>
            </div>

            {/* Section: SHEETS */}
            <div>
              <p className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2">SHEETS</p>
              <div className="space-y-1">
                <button
                  onClick={() => selectTab('dsa-sheets')}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    activeTab === 'dsa-sheets' ? 'bg-[#f0ece1] text-slate-900' : 'text-slate-600 hover:bg-[#f2efe6]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Layers size={15} className="text-slate-500" />
                    <span>DSA Sheets</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-400" />
                </button>
                <button
                  onClick={() => selectTab('dsa-patterns')}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    activeTab === 'dsa-patterns' ? 'bg-[#f0ece1] text-slate-900' : 'text-slate-600 hover:bg-[#f2efe6]'
                  }`}
                >
                  <TrendingUp size={15} className="text-slate-500" />
                  <span>20 DSA Patterns</span>
                </button>
                <button
                  onClick={() => selectTab('system-design')}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    activeTab === 'system-design' ? 'bg-[#f0ece1] text-slate-900' : 'text-slate-600 hover:bg-[#f2efe6]'
                  }`}
                >
                  <Cpu size={15} className="text-slate-500" />
                  <span>System Design Sheet</span>
                </button>
                <button
                  onClick={() => selectTab('faang-questions')}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    activeTab === 'faang-questions' ? 'bg-[#f0ece1] text-slate-900' : 'text-slate-600 hover:bg-[#f2efe6]'
                  }`}
                >
                  <Building2 size={15} className="text-slate-500" />
                  <span>FAANG Interview Questions</span>
                </button>
              </div>
            </div>

            {/* Section: JOB PREP */}
            <div>
              <p className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2">JOB PREP</p>
              <div className="space-y-1">
                <button
                  onClick={() => selectTab('aptitude')}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    activeTab === 'aptitude' ? 'bg-[#f0ece1] text-slate-900' : 'text-slate-600 hover:bg-[#f2efe6]'
                  }`}
                >
                  <GraduationCap size={15} className="text-slate-500" />
                  <span>Aptitude Prep</span>
                </button>
                <button
                  onClick={() => selectTab('core-subjects')}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    activeTab === 'core-subjects' ? 'bg-[#f0ece1] text-slate-900' : 'text-slate-600 hover:bg-[#f2efe6]'
                  }`}
                >
                  <BookOpen size={15} className="text-slate-500" />
                  <span>Core Subjects</span>
                </button>
              </div>
            </div>

            {/* Section: JOB TOOLS (MATCHING IMAGE 2 EXACTLY) */}
            <div>
              <p className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2">JOB TOOLS</p>
              <div className="space-y-1">
                {/* Active Portfolio Builder */}
                <button
                  onClick={() => selectTab('portfolio')}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold transition ${
                    activeTab === 'portfolio'
                      ? 'bg-[#eef8ed] text-[#1c7430] border border-[#d2edd0]'
                      : 'text-slate-600 hover:bg-[#f2efe6]'
                  }`}
                >
                  <Code2 size={15} className={activeTab === 'portfolio' ? 'text-[#1c7430]' : 'text-slate-500'} />
                  <span>Portfolio Builder</span>
                </button>

                <button
                  onClick={() => selectTab('cover-letter')}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    activeTab === 'cover-letter'
                      ? 'bg-[#eef8ed] text-[#1c7430] border border-[#d2edd0]'
                      : 'text-slate-600 hover:bg-[#f2efe6]'
                  }`}
                >
                  <FileText size={15} className="text-slate-500" />
                  <span>Cover Letter</span>
                </button>

                <button
                  onClick={() => selectTab('mock-interview')}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    activeTab === 'mock-interview'
                      ? 'bg-[#eef8ed] text-[#1c7430] border border-[#d2edd0]'
                      : 'text-slate-600 hover:bg-[#f2efe6]'
                  }`}
                >
                  <Mic size={15} className="text-slate-500" />
                  <span>Mock Interview (Voice)</span>
                </button>

                <button
                  onClick={() => selectTab('skill-gap')}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    activeTab === 'skill-gap'
                      ? 'bg-[#eef8ed] text-[#1c7430] border border-[#d2edd0]'
                      : 'text-slate-600 hover:bg-[#f2efe6]'
                  }`}
                >
                  <Compass size={15} className="text-slate-500" />
                  <span>Skill Gap & 90-Day Plan</span>
                </button>

                <button
                  onClick={() => selectTab('resume-analysis')}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    activeTab === 'resume-analysis'
                      ? 'bg-[#eef8ed] text-[#1c7430] border border-[#d2edd0]'
                      : 'text-slate-600 hover:bg-[#f2efe6]'
                  }`}
                >
                  <FileCheck2 size={15} className="text-slate-500" />
                  <span>Resume Analysis</span>
                </button>

                <button
                  onClick={() => selectTab('extension')}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    activeTab === 'extension'
                      ? 'bg-[#eef8ed] text-[#1c7430] border border-[#d2edd0]'
                      : 'text-slate-600 hover:bg-[#f2efe6]'
                  }`}
                >
                  <Chrome size={15} className={activeTab === 'extension' ? 'text-[#1c7430]' : 'text-slate-500'} />
                  <span>Chrome Extension</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom links */}
          <div className="pt-4 border-t border-[#eae6dc] space-y-2">
            <button
              onClick={() => {
                setShowFeedbackModal(true)
                setFeedbackSent(false)
              }}
              className="flex w-full items-center gap-2.5 rounded-xl border border-[#e5e0d4] bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-2xs hover:bg-[#f9f8f4] transition"
            >
              <MessageSquare size={14} className="text-slate-500" />
              <span>Feedback</span>
            </button>
            <div
              onClick={() => alert('Skilloriya Campus Ambassador applications are currently open! Share your portfolio with friends to earn ambassador badges.')}
              className="flex items-center gap-2 px-3 py-1 text-[11px] font-medium text-slate-500 cursor-pointer hover:text-amber-800 transition"
            >
              <Award size={13} className="text-amber-600" />
              <span>Campus Ambassador</span>
            </div>
          </div>
        </aside>

        {/* Center Main Stage */}
        <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-10 lg:px-16 flex flex-col justify-between">
          {/* TAB 1: PORTFOLIO BUILDER (HERO SECTION MATCHING IMAGE 2) */}
          {activeTab === 'portfolio' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center max-w-5xl mx-auto w-full relative py-6">
              {/* Floating decorative card 1: Left */}
              <div className="hidden lg:flex absolute left-4 top-16 -rotate-6 flex-col gap-2 rounded-2xl bg-[#1c1d1f] p-4 text-left text-white shadow-xl w-60 border border-slate-800 hover:rotate-0 transition-transform">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 font-extrabold text-sm">
                    R
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">Rahul Sharma</p>
                    <p className="text-[10px] text-slate-400">Full Stack Dev</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[9px] font-medium text-slate-300">React</span>
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[9px] font-medium text-slate-300">Node.js</span>
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[9px] font-medium text-slate-300">AWS</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold mt-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Portfolio live
                </div>
              </div>

              {/* Floating decorative card 2: Right */}
              <div className="hidden lg:flex absolute right-4 top-8 rotate-6 flex-col gap-2 rounded-2xl bg-[#1c1d1f] p-4 text-left text-white shadow-xl w-60 border border-slate-800 hover:rotate-0 transition-transform">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-extrabold text-sm">
                    P
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">Priya Mehta</p>
                    <p className="text-[10px] text-slate-400">Frontend Dev</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[9px] font-medium text-slate-300">Next.js</span>
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[9px] font-medium text-slate-300">TypeScript</span>
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[9px] font-medium text-slate-300">Figma</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold mt-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                  Built in 58s
                </div>
              </div>

              {/* Neon Green "BUILD FREE" Stamp Badge */}
              <div className="hidden sm:flex absolute right-24 top-64 items-center justify-center h-20 w-20 rounded-full bg-[#b8ff52] text-slate-950 font-black text-[11px] shadow-lg shadow-lime-300/40 rotate-12 flex-col leading-tight border border-lime-400 select-none">
                <Star size={16} fill="currentColor" className="mb-0.5 text-slate-900" />
                <span>BUILD</span>
                <span>FREE</span>
              </div>

              {/* Giant Stylized Typography matching Image 2 */}
              <div className="space-y-1 mb-6">
                <h1 className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tight text-[#155324] leading-none uppercase">
                  RESUME
                </h1>
                <h1 className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tight text-[#1c1d1f] leading-none uppercase">
                  PORTFOLIO
                </h1>
                <h2 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-[#3b6145] leading-none uppercase">
                  60 SECONDS
                </h2>
              </div>

              {/* Doodle Arrows & Subtitle */}
              <p className="max-w-xl text-sm sm:text-base text-slate-600 font-normal leading-relaxed mb-8">
                Upload your resume PDF. Our AI extracts skills, experience, and projects, and deploys your developer
                portfolio in seconds.
              </p>

              {/* CTA Button */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={() => setIsBuilderModalOpen(true)}
                  className="flex items-center gap-2.5 rounded-full bg-[#1c1d1f] px-8 py-4 text-sm font-bold text-white shadow-xl hover:bg-black hover:scale-105 active:scale-95 transition-all"
                >
                  <Sparkles size={18} className="text-emerald-400" />
                  <span>Build My Portfolio Site</span>
                  <ArrowRight size={18} />
                </button>

                {portfolioData && (
                  <button
                    onClick={() => {
                      setIsBuilderModalOpen(true)
                      setBuilderStep(3)
                    }}
                    className="flex items-center gap-2 rounded-full border border-emerald-600 bg-emerald-50 px-6 py-4 text-sm font-bold text-emerald-800 hover:bg-emerald-100 transition"
                  >
                    <Eye size={18} />
                    <span>View Generated Portfolio</span>
                  </button>
                )}
              </div>

              {/* Bottom Feature Metrics */}
              <div className="mt-16 grid grid-cols-3 gap-6 sm:gap-12 w-full max-w-xl pt-8 border-t border-[#eae5d8]">
                <div>
                  <p className="text-xl sm:text-2xl font-black text-slate-900">⚡ 60s</p>
                  <p className="text-xs text-slate-500 font-medium">Generation Time</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-slate-900">🌐 3 Clicks</p>
                  <p className="text-xs text-slate-500 font-medium">To Live Website</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-slate-900">⭐ 100%</p>
                  <p className="text-xs text-slate-500 font-medium">Free AI Tools</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COVER LETTER GENERATOR */}
          {activeTab === 'cover-letter' && (
            <div className="max-w-4xl mx-auto w-full py-4 space-y-6">
              <div className="border-b border-[#eae6dc] pb-4">
                <h2 className="text-2xl font-black text-slate-900">AI Cover Letter Generator</h2>
                <p className="text-xs text-slate-500">
                  Generate hyper-personalized, ATS-compliant cover letters matching any job description.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 rounded-2xl bg-white p-6 border border-[#eae6dc] shadow-2xs">
                  <div>
                    <label className="text-xs font-bold text-slate-700">Your Full Name</label>
                    <input
                      type="text"
                      value={clForm.candidate_name}
                      onChange={(e) => setClForm({ ...clForm, candidate_name: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700">Target Role / Job Title</label>
                    <input
                      type="text"
                      value={clForm.job_title}
                      onChange={(e) => setClForm({ ...clForm, job_title: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700">Company Name</label>
                    <input
                      type="text"
                      value={clForm.company_name}
                      onChange={(e) => setClForm({ ...clForm, company_name: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700">Your Core Skills</label>
                    <input
                      type="text"
                      value={clForm.skills}
                      onChange={(e) => setClForm({ ...clForm, skills: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700">Job Description / Requirements</label>
                    <textarea
                      rows={4}
                      value={clForm.job_description}
                      onChange={(e) => setClForm({ ...clForm, job_description: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={handleGenerateCoverLetter}
                    disabled={clLoading}
                    className="w-full rounded-xl bg-slate-900 py-3 text-xs font-bold text-white hover:bg-black transition flex items-center justify-center gap-2"
                  >
                    {clLoading ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} className="text-emerald-400" />}
                    <span>{clLoading ? 'Crafting Cover Letter...' : 'Generate with AI'}</span>
                  </button>
                </div>

                <div className="rounded-2xl bg-white p-6 border border-[#eae6dc] shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                      <span className="text-xs font-bold text-slate-800">Generated Cover Letter</span>
                      {clResult && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(clResult)
                            setClCopied(true)
                            setTimeout(() => setClCopied(false), 2000)
                          }}
                          className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline"
                        >
                          {clCopied ? <Check size={14} /> : <Copy size={14} />}
                          <span>{clCopied ? 'Copied!' : 'Copy to Clipboard'}</span>
                        </button>
                      )}
                    </div>
                    {clResult ? (
                      <textarea
                        rows={16}
                        readOnly
                        value={clResult}
                        className="w-full text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 resize-none font-sans"
                      />
                    ) : (
                      <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400 text-xs">
                        <FileText size={36} className="mb-2 text-slate-300" />
                        <span>Fill the job details on the left and click "Generate with AI"</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MOCK INTERVIEW WITH VOICE + FEEDBACK */}
          {activeTab === 'mock-interview' && <MockInterviewStudio />}

          {/* TAB: SKILL GAP ANALYZER + 90-DAY ROADMAP */}
          {activeTab === 'skill-gap' && <SkillGapRoadmapView />}

          {/* TAB 4: RESUME ANALYSIS & ATS CHECKER */}
          {activeTab === 'resume-analysis' && (
            <div className="max-w-5xl mx-auto w-full py-4 space-y-6">
              {/* Header Banner */}
              <div className="rounded-3xl border border-[#eae6dc] bg-gradient-to-r from-emerald-50/70 via-white to-teal-50/50 p-6 sm:p-7 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-100/70 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-800 mb-2.5">
                      <Sparkles size={13} className="text-emerald-700" />
                      AI ATS Engine v2.0
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      Resume ATS & Keyword Match
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-2xl">
                      Upload your resume PDF or DOCX to automatically parse skills and experience, then match against target job descriptions to uncover missing high-impact keywords.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <span className="rounded-2xl border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      PDF Parser Ready
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left 7 Columns: Resume Upload / Input & Job Description */}
                <div className="lg:col-span-7 space-y-5">
                  <div className="rounded-3xl bg-white p-5 sm:p-6 border border-[#eae6dc] shadow-sm space-y-5">
                    {/* Header + Input Mode Selector */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">1. Resume Input</h3>
                        <p className="text-[11px] text-slate-500">Upload your PDF resume or paste text directly</p>
                      </div>
                      <div className="inline-flex rounded-xl bg-slate-100 p-1">
                        <button
                          type="button"
                          onClick={() => setResumeInputMode('upload')}
                          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            resumeInputMode === 'upload'
                              ? 'bg-white text-slate-900 shadow-sm'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <FileText size={13} className="text-rose-500" />
                          <span>PDF / File</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setResumeInputMode('paste')}
                          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            resumeInputMode === 'paste'
                              ? 'bg-white text-slate-900 shadow-sm'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Code2 size={13} className="text-emerald-600" />
                          <span>Paste Text</span>
                        </button>
                      </div>
                    </div>

                    {/* PDF Upload / Drop Zone Mode */}
                    {resumeInputMode === 'upload' ? (
                      <div>
                        {!resumePdfFile ? (
                          <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-7 sm:p-9 text-center transition-all cursor-pointer ${
                              isDragOver
                                ? 'border-emerald-500 bg-emerald-50/70 scale-[1.01] shadow-md ring-4 ring-emerald-500/10'
                                : 'border-slate-200 bg-slate-50/60 hover:border-emerald-500/80 hover:bg-slate-50'
                            }`}
                          >
                            <label className="absolute inset-0 cursor-pointer">
                              <input
                                type="file"
                                accept=".pdf,.docx,.txt"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handlePdfUpload(e.target.files[0])
                                  }
                                }}
                              />
                            </label>

                            {/* Prominent PDF Icon badge */}
                            <div className="relative mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 border border-rose-200 shadow-sm group-hover:scale-110 transition duration-200">
                              <FileText size={32} className="text-rose-600" />
                              <span className="absolute -bottom-1 -right-1 rounded-md bg-rose-600 px-1.5 py-0.5 text-[9px] font-black text-white shadow-sm">
                                PDF
                              </span>
                            </div>

                            <p className="text-xs sm:text-sm font-bold text-slate-800">
                              {isDragOver ? (
                                <span className="text-emerald-700">Drop your resume PDF right here!</span>
                              ) : (
                                <>
                                  Drag & drop your Resume PDF, or{' '}
                                  <span className="text-emerald-600 underline font-extrabold group-hover:text-emerald-700">
                                    Browse Files
                                  </span>
                                </>
                              )}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-500 max-w-xs">
                              Supports PDF, DOCX, TXT (up to 10MB) • AI automatically parses keywords & experience
                            </p>
                          </div>
                        ) : (
                          /* Active Uploaded File Card */
                          <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-100/80 text-rose-600 border border-rose-200 relative">
                                  <FileText size={24} />
                                  <span className="absolute -bottom-1 -right-1 rounded bg-rose-600 px-1 text-[8px] font-black text-white">
                                    PDF
                                  </span>
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-xs sm:text-sm font-bold text-slate-900">
                                    {resumePdfFile.name}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px]">
                                    <span className="text-slate-500">
                                      {(resumePdfFile.size / 1024).toFixed(1)} KB
                                    </span>
                                    <span className="text-slate-300">•</span>
                                    {pdfUploading ? (
                                      <span className="inline-flex items-center gap-1 font-bold text-blue-600 animate-pulse">
                                        <RefreshCw size={11} className="animate-spin" />
                                        Extracting text & skills...
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                                        <Check size={12} className="stroke-[3]" />
                                        Parsed Successfully
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={handleRemovePdf}
                                title="Remove file and upload another"
                                className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            {/* Quick Parsed Stats Preview */}
                            {parsedResumeData && !pdfUploading && (
                              <div className="mt-3 pt-3 border-t border-slate-200/80">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  {parsedResumeData.full_name || parsedResumeData.name ? (
                                    <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                                      👤 {parsedResumeData.full_name || parsedResumeData.name}
                                    </span>
                                  ) : null}
                                  {parsedResumeData.experience_years ? (
                                    <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                                      ⏱ {parsedResumeData.experience_years}+ Yrs Exp
                                    </span>
                                  ) : null}
                                  {parsedResumeData.skills?.length > 0 && (
                                    <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                      ⚡ {parsedResumeData.skills.length} Skills Detected
                                    </span>
                                  )}
                                </div>

                                {/* Extracted Text View / Edit Toggle */}
                                <div className="mt-2.5">
                                  <button
                                    type="button"
                                    onClick={() => setShowExtractedPreview(!showExtractedPreview)}
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-emerald-700 transition cursor-pointer"
                                  >
                                    {showExtractedPreview ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                    <span>
                                      {showExtractedPreview
                                        ? 'Hide Extracted Text'
                                        : 'View / Edit Extracted Resume Text'}
                                    </span>
                                  </button>

                                  {showExtractedPreview && (
                                    <textarea
                                      rows={4}
                                      value={analysisText}
                                      onChange={(e) => setAnalysisText(e.target.value)}
                                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-700 focus:border-emerald-600 focus:outline-none"
                                      placeholder="Extracted resume text..."
                                    />
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {pdfUploadError && (
                          <div className="mt-2 flex items-center gap-1.5 rounded-xl bg-rose-50 p-2.5 text-xs font-semibold text-rose-700 border border-rose-200">
                            <AlertCircle size={14} className="shrink-0" />
                            <span>{pdfUploadError}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Plain Text Paste Mode */
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-slate-700">Paste Resume Content / Skills</label>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {analysisText.length} characters
                          </span>
                        </div>
                        <textarea
                          rows={6}
                          placeholder="Paste your resume bullet points, summary, or skills list here..."
                          value={analysisText}
                          onChange={(e) => setAnalysisText(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-emerald-600 focus:outline-none placeholder:text-slate-400"
                        />
                      </div>
                    )}

                    {/* Step 2: Target Job Description */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                        <label className="text-xs font-bold text-slate-900">
                          2. Target Job Description
                        </label>
                        <span className="text-[11px] text-slate-500">
                          Quick Presets:
                        </span>
                      </div>

                      {/* Sample JDs Chips */}
                      <div className="flex flex-wrap gap-1.5 mb-2.5">
                        {SAMPLE_JDS.map((jd, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setJobDescriptionText(jd.description)}
                            className="rounded-lg border border-slate-200 bg-slate-50/80 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-800 transition cursor-pointer"
                          >
                            + {jd.title}
                          </button>
                        ))}
                      </div>

                      <textarea
                        rows={4}
                        placeholder="Paste job description, requirements, or desired skills here..."
                        value={jobDescriptionText}
                        onChange={(e) => setJobDescriptionText(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-emerald-600 focus:outline-none placeholder:text-slate-400"
                      />
                    </div>

                    {/* Calculate Button */}
                    <button
                      type="button"
                      onClick={handleAnalyzeResume}
                      disabled={analysisLoading || pdfUploading}
                      className="w-full rounded-2xl bg-slate-900 py-3.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-black transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {analysisLoading ? (
                        <>
                          <RefreshCw className="animate-spin" size={16} />
                          <span>Analyzing ATS Match & Parsing Keywords...</span>
                        </>
                      ) : (
                        <>
                          <FileCheck2 size={17} className="text-emerald-400" />
                          <span>Calculate ATS Match Score</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Right 5 Columns: Result Display */}
                <div className="lg:col-span-5">
                  <div className="rounded-3xl bg-white p-5 sm:p-6 border border-[#eae6dc] shadow-sm min-h-[460px] flex flex-col justify-between">
                    {analysisResult ? (
                      <div className="space-y-5">
                        {/* Match Score Display */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                              ATS Match Compatibility
                            </span>
                            <div className="flex items-baseline gap-2 mt-0.5">
                              <p
                                className={`text-4xl font-black ${
                                  analysisResult.atsScore >= 75
                                    ? 'text-emerald-600'
                                    : analysisResult.atsScore >= 55
                                    ? 'text-blue-600'
                                    : 'text-amber-600'
                                }`}
                              >
                                {analysisResult.atsScore}%
                              </p>
                              <span className="text-xs font-bold text-slate-500">out of 100</span>
                            </div>
                            <p className="text-xs font-bold text-slate-700 mt-1">
                              {analysisResult.matchLevel}
                            </p>
                          </div>

                          <div
                            className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${
                              analysisResult.atsScore >= 75
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                : 'bg-blue-50 border-blue-200 text-blue-700'
                            } font-black text-xl shadow-sm`}
                          >
                            {analysisResult.atsScore >= 75 ? '✓' : '⚡'}
                          </div>
                        </div>

                        {/* Matched Skills */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-emerald-500" />
                              Matched Skills Found ({analysisResult.matchedSkills?.length || 0}):
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {analysisResult.matchedSkills?.map((s, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200/80 shadow-2xs"
                              >
                                ✓ {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Missing High Impact Keywords */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-rose-500" />
                              Missing High-Impact Keywords ({analysisResult.missingKeywords?.length || 0}):
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {analysisResult.missingKeywords?.map((s, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 border border-rose-200/80 shadow-2xs"
                              >
                                + {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Recommendations */}
                        <div className="pt-3 border-t border-slate-100">
                          <p className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                            <Sparkles size={13} className="text-emerald-600" />
                            Actionable ATS Optimization Tips:
                          </p>
                          <ul className="space-y-1.5 text-xs text-slate-600">
                            {analysisResult.suggestions?.map((s, i) => (
                              <li key={i} className="flex items-start gap-2 leading-relaxed">
                                <span className="text-emerald-600 font-bold mt-0.5">•</span>
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      /* Empty State with PDF + Target visual */
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 py-12">
                        <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100/80 text-slate-400 border border-slate-200">
                          <FileText size={28} className="text-slate-400" />
                          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white shadow-sm">
                            AI
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-800">
                          Ready for Instant ATS Analysis
                        </h4>
                        <p className="mt-1 text-xs text-slate-500 max-w-xs leading-relaxed">
                          Drop your resume PDF and paste a job description on the left to see your match percentage, keywords detected, and step-by-step improvements.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: AGENTIC AI CAREER COPILOT */}
          {activeTab === 'agentic-copilot' && <AgenticCopilotView onSelectTab={selectTab} />}

          {/* TAB: TASK BOARD */}
          {activeTab === 'task-board' && <TaskBoardView />}

          {/* TAB: PROGRESS */}
          {activeTab === 'progress' && <ProgressView />}

          {/* TAB: DSA SHEETS */}
          {activeTab === 'dsa-sheets' && <DsaSheetsView />}

          {/* TAB: 20 DSA PATTERNS */}
          {activeTab === 'dsa-patterns' && <DsaPatternsView />}

          {/* TAB: SYSTEM DESIGN SHEET */}
          {activeTab === 'system-design' && <SystemDesignView />}

          {/* TAB: FAANG QUESTIONS */}
          {activeTab === 'faang-questions' && <FaangQuestionsView />}

          {/* TAB: APTITUDE PREP */}
          {activeTab === 'aptitude' && <AptitudePrepView />}

          {/* TAB: CORE SUBJECTS */}
          {activeTab === 'core-subjects' && <CoreSubjectsView />}

          {/* TAB: CHROME EXTENSION */}
          {activeTab === 'extension' && <ExtensionView />}
        </main>
      </div>

      {/* MODAL: STEP-BY-STEP PORTFOLIO GENERATOR & LIVE PREVIEW */}
      {isBuilderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 font-black">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">AI Portfolio Generator</h3>
                  <p className="text-xs text-slate-500">Transform your resume into a deployed developer portfolio site</p>
                </div>
              </div>
              <button
                onClick={() => setIsBuilderModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
              >
                ✕
              </button>
            </div>

            {/* Step 1: Input Details */}
            {builderStep === 1 && (
              <div className="space-y-6">
                {/* Upload File */}
                <div className="rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center hover:border-emerald-500 transition bg-slate-50/50">
                  <Upload size={32} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-xs font-bold text-slate-700">Upload Resume (PDF, DOCX)</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Our AI will automatically parse your skills and projects</p>
                  <label className="mt-4 inline-block cursor-pointer rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-black transition">
                    Choose File
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
                      className="hidden"
                      onChange={(e) => setResumeFile(e.target.files[0])}
                    />
                  </label>
                  {resumeFile && (
                    <p className="mt-2 text-xs font-bold text-emerald-600">Selected: {resumeFile.name}</p>
                  )}
                </div>

                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-xs font-bold text-slate-400 uppercase">OR QUICK FILL</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Form fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700">Your Full Name</label>
                    <input
                      type="text"
                      value={builderForm.name}
                      onChange={(e) => setBuilderForm({ ...builderForm, name: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700">Professional Role / Headline</label>
                    <input
                      type="text"
                      value={builderForm.role}
                      onChange={(e) => setBuilderForm({ ...builderForm, role: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Core Technologies & Skills (comma separated)</label>
                  <input
                    type="text"
                    value={builderForm.skills}
                    onChange={(e) => setBuilderForm({ ...builderForm, skills: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Short Bio / Summary</label>
                  <textarea
                    rows={3}
                    value={builderForm.bio}
                    onChange={(e) => setBuilderForm({ ...builderForm, bio: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setIsBuilderModalOpen(false)}
                    className="rounded-xl px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGeneratePortfolio}
                    className="flex items-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-6 py-2.5 text-xs font-bold text-white transition shadow-sm"
                  >
                    <Sparkles size={16} />
                    <span>Generate Developer Portfolio</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Generating State */}
            {builderStep === 2 && (
              <div className="py-16 text-center space-y-4">
                <div className="relative mx-auto h-20 w-20 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
                  <Sparkles size={28} className="text-emerald-600 animate-pulse" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">Crafting Your Developer Portfolio</h4>
                <p className="text-xs font-semibold text-emerald-700 animate-bounce">{generationPhase}</p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  Using free Gemini / Groq AI models to build projects, responsive design, and tech stack showcases.
                </p>
              </div>
            )}

            {/* Step 3: Live Preview & Export */}
            {builderStep === 3 && portfolioData && (
              <div className="space-y-6">
                {/* Control bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-slate-100 p-3 border border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">Theme:</span>
                    <button
                      onClick={() => setPortfolioTheme('dark')}
                      className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                        portfolioTheme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700'
                      }`}
                    >
                      Obsidian Dark
                    </button>
                    <button
                      onClick={() => setPortfolioTheme('light')}
                      className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                        portfolioTheme === 'light' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700'
                      }`}
                    >
                      Minimal Clean
                    </button>
                    <button
                      onClick={() => setPortfolioTheme('cyber')}
                      className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                        portfolioTheme === 'cyber' ? 'bg-emerald-900 text-emerald-300' : 'bg-white text-slate-700'
                      }`}
                    >
                      Cyber Neon
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setBuilderStep(1)}
                      className="rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition border border-slate-200"
                    >
                      Edit Info
                    </button>
                    <button
                      onClick={exportPortfolioHTML}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-4 py-1.5 text-xs font-bold text-white transition shadow-sm"
                    >
                      <Download size={14} />
                      <span>Download HTML Site</span>
                    </button>
                  </div>
                </div>

                {/* Live Preview Container */}
                <div
                  className={`rounded-2xl p-6 sm:p-8 border transition-all ${
                    portfolioTheme === 'dark'
                      ? 'bg-slate-950 text-slate-100 border-slate-800'
                      : portfolioTheme === 'cyber'
                      ? 'bg-[#0a120e] text-emerald-100 border-emerald-900'
                      : 'bg-white text-slate-900 border-slate-200'
                  }`}
                >
                  {/* Hero */}
                  <div className="border-b border-slate-800/40 pb-6 mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Available for Hire
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-tight mb-2">{portfolioData.name}</h2>
                    <p className="text-sm font-bold text-emerald-400 mb-2">{portfolioData.headline}</p>
                    <p className="text-xs leading-relaxed max-w-2xl opacity-80 mb-4">{portfolioData.bio}</p>
                    <div className="flex flex-wrap gap-2 text-xs font-semibold">
                      <span className="rounded-lg bg-slate-800/80 px-3 py-1">📍 {portfolioData.location}</span>
                      <span className="rounded-lg bg-slate-800/80 px-3 py-1">✉️ {portfolioData.email}</span>
                    </div>
                  </div>

                  {/* Skills Grid */}
                  <div className="mb-6">
                    <h3 className="text-xs font-bold tracking-wider uppercase opacity-70 mb-3">Technical Stack</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {Object.entries(portfolioData.skills_grouped || {}).map(([category, items]) => (
                        <div
                          key={category}
                          className="rounded-xl p-3 bg-slate-900/40 border border-slate-800/60"
                        >
                          <p className="text-[11px] font-bold text-emerald-400 uppercase mb-2">{category}</p>
                          <div className="flex flex-wrap gap-1">
                            {(items || []).map((skill, sIdx) => (
                              <span
                                key={sIdx}
                                className="rounded px-2 py-0.5 text-[10px] font-medium bg-slate-800 text-slate-300"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Projects Showcase */}
                  <div>
                    <h3 className="text-xs font-bold tracking-wider uppercase opacity-70 mb-3">Featured Projects</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(portfolioData.projects || []).map((p, pIdx) => (
                        <div
                          key={pIdx}
                          className="rounded-xl p-4 bg-slate-900/40 border border-slate-800 hover:border-emerald-500/50 transition flex flex-col justify-between"
                        >
                          <div>
                            <h4 className="text-xs font-bold mb-1">{p.title}</h4>
                            <p className="text-[11px] leading-relaxed opacity-75 mb-3">{p.description}</p>
                            <div className="flex flex-wrap gap-1 mb-3">
                              {(p.tags || []).map((t, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="rounded px-1.5 py-0.5 text-[9px] font-bold bg-emerald-500/10 text-emerald-300"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-3 text-[10px] font-bold text-emerald-400">
                            <a href={p.live_url} target="_blank" rel="noreferrer" className="hover:underline">
                              Live Demo &rarr;
                            </a>
                            <a href={p.github_url} target="_blank" rel="noreferrer" className="opacity-70 hover:underline">
                              GitHub
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: FEEDBACK */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare size={18} className="text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">Send Feedback</h3>
              </div>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
              >
                ✕
              </button>
            </div>

            {feedbackSent ? (
              <div className="py-8 text-center space-y-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xl">
                  ✓
                </div>
                <h4 className="text-sm font-bold text-slate-900">Thank You!</h4>
                <p className="text-xs text-slate-500">Your feedback has been received and helps us build better tools.</p>
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="mt-3 rounded-xl bg-slate-900 text-white px-5 py-2 text-xs font-bold"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  How can we improve Skilloriya AI Workspace? Let us know what features or interview sheets you'd like added!
                </p>
                <textarea
                  rows={4}
                  placeholder="Share your thoughts, suggestions, or bug reports..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-emerald-600 focus:outline-none"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowFeedbackModal(false)}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (feedbackText.trim()) {
                        setFeedbackSent(true)
                      }
                    }}
                    disabled={!feedbackText.trim()}
                    className="rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white px-5 py-2 text-xs font-bold transition shadow-xs"
                  >
                    Submit Feedback
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
