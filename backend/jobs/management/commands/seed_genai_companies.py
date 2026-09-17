import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from companies.models import Company, CompanyReview
from jobs.models import Job, JobCategory

User = get_user_model()

COMPANIES_DATA = [
    {
        "name": "DeepMind Agentic Labs",
        "email": "careers@deepmind-agentic.ai",
        "location": "Bangalore, India (Remote-First)",
        "website": "https://deepmind-agentic.ai",
        "description": "Pioneering the frontier of autonomous agentic systems, multi-agent collaboration (CrewAI/AutoGen), and self-healing LLM workflows.",
        "is_verified": True,
        "is_featured": True,
        "jobs": [
            {
                "title": "Agentic AI Research Intern (Students Welcome)",
                "description": "We are seeking passionate students and fresh graduates to work on cutting-edge Agentic AI workflows. You will design multi-agent planning pipelines, evaluate tool-calling capabilities of open-source LLMs (Llama 3, Mistral, Qwen), and build autonomous research assistants.\n\nKey Requirements:\n- Strong foundation in Python and data structures.\n- Familiarity with LangChain, LlamaIndex, or CrewAI.\n- Understanding of Prompt Engineering and RAG (Retrieval Augmented Generation).\n- Open to pre-final and final year college students.",
                "location": "Remote",
                "salary": 540000,  # 45k/mo stipend (5.4 LPA)
                "job_type": "remote",
                "experience_required": 0,
                "is_featured": True,
            },
            {
                "title": "Autonomous AI Agent Engineer (AutoGen / LangGraph)",
                "description": "Build production-ready agentic architectures that can browse the web, write and debug code, and execute multi-step business workflows autonomously.\n\nKey Requirements:\n- 1+ years building with Python, FastAPI, and Vector Databases (Chroma, Pinecone, Qdrant).\n- Deep hands-on experience with LangGraph, AutoGen, and tool-augmented generation.\n- Experience with Docker, CI/CD, and scalable backend microservices.",
                "location": "Remote",
                "salary": 2800000,
                "job_type": "remote",
                "experience_required": 1,
                "is_featured": True,
            }
        ],
        "reviews": [
            {
                "title": "Incredible learning curve in bleeding-edge AI",
                "rating": 5,
                "review": "Working here gives you exposure to tech that 99% of companies haven't even started exploring yet.",
                "pros": "Cutting edge tech stack, flexible work hours, high stipend.",
                "cons": "Fast paced environment requiring rapid learning.",
                "salary_estimate": "₹28-35 LPA"
            }
        ]
    },
    {
        "name": "Anthropic AI Systems",
        "email": "hiring@anthropic-systems.ai",
        "location": "Hyderabad / Remote",
        "website": "https://anthropic-systems.ai",
        "description": "Building trustworthy, steerable, and enterprise-safe Generative AI models and conversational AI assistants for global scale.",
        "is_verified": True,
        "is_featured": True,
        "jobs": [
            {
                "title": "GenAI & LLM Fine-Tuning Intern (Freshers/Students)",
                "description": "Join our AI Alignment team! You will work with LoRA/QLoRA fine-tuning, synthetic data generation, and benchmark evaluations for custom domain LLMs.\n\nKey Requirements:\n- Proficiency in Python, PyTorch, or HuggingFace Transformers.\n- Good conceptual grasp of Transformer attention mechanisms and tokenization.\n- Curiosity and drive to solve complex NLP problems.",
                "location": "Remote",
                "salary": 480000,  # 40k/mo stipend
                "job_type": "remote",
                "experience_required": 0,
                "is_featured": True,
            },
            {
                "title": "Prompt Engineering & Model Alignment Engineer",
                "description": "Design deterministic prompting frameworks, automated evaluation suites, and safety guardrails (NeMo Guardrails, Llama-Guard) for enterprise clients.\n\nKey Requirements:\n- Proven experience crafting structured output prompts (JSON mode, function calling).\n- Experience with Python, Few-shot prompting, and chain-of-thought verification.",
                "location": "Hyderabad",
                "salary": 2200000,
                "job_type": "hybrid",
                "experience_required": 1,
                "is_featured": False,
            }
        ],
        "reviews": [
            {
                "title": "Best workplace for AI researchers",
                "rating": 5,
                "review": "Extremely supportive team and massive compute resources provided for experimenting.",
                "pros": "Top mentors, great work life balance, good salary.",
                "cons": "Requires solid math and ML fundamentals.",
                "salary_estimate": "₹22-28 LPA"
            }
        ]
    },
    {
        "name": "LangChain Autonomous Labs",
        "email": "careers@langchain-labs.dev",
        "location": "Bangalore / Remote",
        "website": "https://langchain-labs.dev",
        "description": "Enterprise GenAI consultancy and product studio specializing in production RAG systems, Vector search, and LangGraph workflow orchestration.",
        "is_verified": True,
        "is_featured": True,
        "jobs": [
            {
                "title": "Full-Stack GenAI Developer (React + FastAPI + Vector DB)",
                "description": "Build intuitive AI interfaces and robust backend APIs. You will connect frontend chat UI and streaming responses with FastAPI, Redis caching, and Milvus/Qdrant vector retrieval.\n\nKey Requirements:\n- Strong JavaScript/TypeScript & React skills (SSE/Streaming UI).\n- Python & FastAPI backend development experience.\n- Familiarity with Vector embeddings and Semantic search.",
                "location": "Remote",
                "salary": 1800000,
                "job_type": "remote",
                "experience_required": 0,
                "is_featured": True,
            },
            {
                "title": "Multi-Agent Workflow & RAG Specialist",
                "description": "Optimize hybrid search (dense + sparse BM25), reciprocal rank fusion (RRF), and agentic query routing across millions of enterprise documents.\n\nKey Requirements:\n- Experience with LangChain/LlamaIndex production deployments.\n- Hands-on knowledge of rerankers (Cohere, BGE) and semantic caching.",
                "location": "Bangalore",
                "salary": 2400000,
                "job_type": "hybrid",
                "experience_required": 1,
                "is_featured": False,
            }
        ],
        "reviews": [
            {
                "title": "High impact projects and direct client deployment",
                "rating": 5,
                "review": "You get to build real GenAI applications used by thousands of users daily.",
                "pros": "Fast growth, direct code ownership, modern stack.",
                "cons": "Requires staying updated with daily AI advancements.",
                "salary_estimate": "₹18-24 LPA"
            }
        ]
    },
    {
        "name": "Cognitive AI Systems",
        "email": "talent@cognitive-ai.co",
        "location": "Pune, India (Hybrid)",
        "website": "https://cognitive-ai.co",
        "description": "Pioneering knowledge graph-backed Generative AI and automated reasoning engines for healthcare, finance, and edtech sectors.",
        "is_verified": True,
        "is_featured": False,
        "jobs": [
            {
                "title": "Junior GenAI Application Developer (Students Welcome)",
                "description": "Are you a student or fresh grad who loves experimenting with LLM APIs? We want you on our team to prototype new AI features, test reasoning agents, and build internal tools.\n\nKey Requirements:\n- Python programming skills.\n- Experience calling OpenAI / Gemini / Claude APIs.\n- Basic knowledge of Git and web frameworks.",
                "location": "Remote",
                "salary": 1200000,
                "job_type": "remote",
                "experience_required": 0,
                "is_featured": True,
            },
            {
                "title": "Knowledge Graph & GraphRAG Architect",
                "description": "Integrate Neo4j knowledge graphs with Vector Databases to enable GraphRAG capabilities for multi-hop reasoning over complex data graphs.\n\nKey Requirements:\n- Experience with Cypher query language and Neo4j.\n- Python, LlamaIndex Knowledge Graph Index, and LangChain.",
                "location": "Pune",
                "salary": 2600000,
                "job_type": "hybrid",
                "experience_required": 2,
                "is_featured": False,
            }
        ],
        "reviews": [
            {
                "title": "Great culture and leadership",
                "rating": 4,
                "review": "Very transparent company culture and good benefits.",
                "pros": "Mentorship, great colleagues, wellness allowance.",
                "cons": "Office commutes on hybrid days.",
                "salary_estimate": "₹12-20 LPA"
            }
        ]
    },
    {
        "name": "Cohere GenAI India",
        "email": "hiring@cohere-india.ai",
        "location": "Gurgaon / Delhi NCR (Remote)",
        "website": "https://cohere-india.ai",
        "description": "Delivering next-generation Multilingual LLMs, Embeddings, and Agentic Workflow automation for Fortune 500 enterprises.",
        "is_verified": True,
        "is_featured": True,
        "jobs": [
            {
                "title": "GenAI Python Developer Intern (College Students)",
                "description": "Get real-world experience building Agentic LLM pipelines! You will assist our engineering team in creating synthetic datasets, testing agent performance, and deploying FastAPI microservices.\n\nKey Requirements:\n- Python & OOP concepts.\n- Eager to learn modern AI frameworks (RAG, Agents, Vector DBs).\n- Portfolio project or GitHub repository demonstrating coding skills.",
                "location": "Remote",
                "salary": 600000,  # 50k/mo stipend (6 LPA)
                "job_type": "remote",
                "experience_required": 0,
                "is_featured": True,
            },
            {
                "title": "Applied Agentic AI Architect",
                "description": "Architect end-to-end multi-agent systems for enterprise automation with human-in-the-loop validation, memory persistence, and tool execution.\n\nKey Requirements:\n- 2+ years backend/ML engineering experience.\n- Deep understanding of ReAct agent loops, LangGraph state machines, and function calling.",
                "location": "Remote",
                "salary": 3200000,
                "job_type": "remote",
                "experience_required": 2,
                "is_featured": True,
            }
        ],
        "reviews": [
            {
                "title": "World class team and compensation",
                "rating": 5,
                "review": "Best place to accelerate your career in Artificial Intelligence and LLM engineering.",
                "pros": "Top compensation, 100% remote flexibility, stock options.",
                "cons": "High bar for code quality and testing.",
                "salary_estimate": "₹30-40 LPA"
            }
        ]
    }
]

class Command(BaseCommand):
    help = "Seed 5 Top GenAI & Agentic AI Companies with student-friendly job openings"

    def handle(self, *args, **options):
        # 1. Create or get Category
        genai_cat, _ = JobCategory.objects.get_or_create(
            slug="genai-agentic-ai",
            defaults={"name": "GenAI & Agentic AI"}
        )
        ai_cat, _ = JobCategory.objects.get_or_create(
            slug="ai-ml",
            defaults={"name": "AI & Machine Learning"}
        )

        total_companies = 0
        total_jobs = 0

        for c_data in COMPANIES_DATA:
            # Create or update user
            user, created = User.objects.get_or_create(
                email=c_data["email"],
                defaults={
                    "role": "employer",
                    "is_verified": True,
                    "first_name": c_data["name"],
                    "company_name": c_data["name"],
                    "location": c_data["location"],
                    "headline": f"Hiring at {c_data['name']}",
                }
            )
            if created:
                user.set_password("Company123!")
                user.save()

            # Create or update company
            company, _ = Company.objects.get_or_create(
                owner=user,
                defaults={
                    "name": c_data["name"],
                    "description": c_data["description"],
                    "website": c_data["website"],
                    "location": c_data["location"],
                    "is_verified": c_data["is_verified"],
                    "is_featured": c_data["is_featured"],
                }
            )
            company.name = c_data["name"]
            company.description = c_data["description"]
            company.website = c_data["website"]
            company.location = c_data["location"]
            company.is_verified = c_data["is_verified"]
            company.is_featured = c_data["is_featured"]
            company.save()
            total_companies += 1

            # Seed Jobs
            for j_data in c_data["jobs"]:
                job, j_created = Job.objects.get_or_create(
                    employer=user,
                    title=j_data["title"],
                    defaults={
                        "category": genai_cat,
                        "description": j_data["description"],
                        "location": j_data["location"],
                        "salary": j_data["salary"],
                        "job_type": j_data["job_type"],
                        "experience_required": j_data["experience_required"],
                        "is_featured": j_data["is_featured"],
                        "is_active": True,
                    }
                )
                if not j_created:
                    job.category = genai_cat
                    job.description = j_data["description"]
                    job.location = j_data["location"]
                    job.salary = j_data["salary"]
                    job.job_type = j_data["job_type"]
                    job.experience_required = j_data["experience_required"]
                    job.is_featured = j_data["is_featured"]
                    job.is_active = True
                    job.save()
                total_jobs += 1

            # Seed Reviews
            for r_data in c_data.get("reviews", []):
                CompanyReview.objects.get_or_create(
                    company=company,
                    reviewer=user,
                    defaults={
                        "title": r_data["title"],
                        "rating": r_data["rating"],
                        "review": r_data["review"],
                        "pros": r_data.get("pros", ""),
                        "cons": r_data.get("cons", ""),
                        "salary_estimate": r_data.get("salary_estimate", ""),
                    }
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully seeded {total_companies} GenAI Companies and {total_jobs} active job openings!"
            )
        )
