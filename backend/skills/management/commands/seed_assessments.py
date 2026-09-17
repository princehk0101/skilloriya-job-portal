from django.core.management.base import BaseCommand
from skills.models import Assessment, AssessmentQuestion

ASSESSMENTS_DATA = [
    {
        "title": "Frontend Development",
        "slug": "frontend-development",
        "category": "Web Development",
        "time_minutes": 20,
        "passing_score": 70,
        "level": "Intermediate",
        "icon_name": "Layout",
        "description": "Test your core knowledge of HTML5, CSS3, JavaScript ES6+, React Hooks, and modern web APIs.",
        "questions": [
            {
                "question_text": "Which React hook is primarily used for managing side effects like API calls and DOM subscriptions?",
                "option_a": "useState",
                "option_b": "useEffect",
                "option_c": "useContext",
                "option_d": "useReducer",
                "correct_option": "B",
                "explanation": "useEffect is designed to execute side effects in functional React components."
            },
            {
                "question_text": "What is the difference between '==' and '===' in JavaScript?",
                "option_a": "'==' compares value and type, '===' only compares value",
                "option_b": "'===' compares both value and type without type coercion",
                "option_c": "There is no difference in ES6",
                "option_d": "'===' is only used for objects",
                "correct_option": "B",
                "explanation": "Strict equality (===) checks value and type without converting types automatically."
            },
            {
                "question_text": "In CSS Flexbox, which property aligns items along the cross axis?",
                "option_a": "justify-content",
                "option_b": "align-items",
                "option_c": "flex-direction",
                "option_d": "flex-wrap",
                "correct_option": "B",
                "explanation": "align-items controls alignment along the cross axis, while justify-content controls main axis alignment."
            },
            {
                "question_text": "What is the virtual DOM in React?",
                "option_a": "A direct copy of the browser window object",
                "option_b": "A lightweight JavaScript representation of the actual DOM in memory",
                "option_c": "A shadow root element for CSS scoping",
                "option_d": "A third-party database library",
                "correct_option": "B",
                "explanation": "The virtual DOM is an in-memory lightweight representation of the real DOM used for fast diffing."
            },
            {
                "question_text": "Which method transforms a JavaScript object into a JSON string?",
                "option_a": "JSON.parse()",
                "option_b": "JSON.stringify()",
                "option_c": "JSON.toObject()",
                "option_d": "JSON.encode()",
                "correct_option": "B",
                "explanation": "JSON.stringify() serializes a JS object/array into a valid JSON string."
            }
        ]
    },
    {
        "title": "Backend Development & Python",
        "slug": "backend-python",
        "category": "Backend",
        "time_minutes": 25,
        "passing_score": 70,
        "level": "Intermediate",
        "icon_name": "Server",
        "description": "Evaluate your understanding of Python, Django REST Framework, database ORM, and API architecture.",
        "questions": [
            {
                "question_text": "In Django ORM, which method is used to avoid N+1 query problems for ForeignKey relationships?",
                "option_a": "prefetch_related()",
                "option_b": "select_related()",
                "option_c": "defer()",
                "option_d": "distinct()",
                "correct_option": "B",
                "explanation": "select_related() creates a SQL JOIN and includes the fields of the related object in the SELECT statement."
            },
            {
                "question_text": "What does a 401 HTTP Status Code indicate?",
                "option_a": "Forbidden",
                "option_b": "Unauthorized (Authentication required)",
                "option_c": "Not Found",
                "option_d": "Bad Request",
                "correct_option": "B",
                "explanation": "401 Unauthorized indicates that the request lacks valid authentication credentials."
            },
            {
                "question_text": "In Python, which built-in data type is mutable and maintains insertion order (Python 3.7+)?",
                "option_a": "tuple",
                "option_b": "dict",
                "option_c": "frozenset",
                "option_d": "int",
                "correct_option": "B",
                "explanation": "Dictionaries (dict) in Python 3.7+ are mutable and guarantee key insertion order."
            },
            {
                "question_text": "Which HTTP method is idempotent and used to update a resource completely?",
                "option_a": "POST",
                "option_b": "PUT",
                "option_c": "PATCH",
                "option_d": "CONNECT",
                "correct_option": "B",
                "explanation": "PUT is idempotent and replaces the entire target resource with the request payload."
            },
            {
                "question_text": "What is JWT (JSON Web Token) commonly used for in web APIs?",
                "option_a": "Image compression",
                "option_b": "Stateless authentication and secure claims exchange",
                "option_c": "SQL query caching",
                "option_d": "Database migrations",
                "correct_option": "B",
                "explanation": "JWT is an open standard (RFC 7519) used to securely transmit digitally signed claims for authentication."
            }
        ]
    },
    {
        "title": "Database Management & SQL",
        "slug": "database-sql",
        "category": "Databases",
        "time_minutes": 20,
        "passing_score": 70,
        "level": "Beginner",
        "icon_name": "Database",
        "description": "Assess your skills in SQL queries, indexing, joins, normalization, and ACID properties.",
        "questions": [
            {
                "question_text": "What does the ACID acronym stand for in relational databases?",
                "option_a": "Atomicity, Consistency, Isolation, Durability",
                "option_b": "Accuracy, Concurrency, Integrity, Distribution",
                "option_c": "Action, Control, Index, Data",
                "option_d": "Array, Column, Index, Diagram",
                "correct_option": "A",
                "explanation": "ACID properties ensure reliable processing of database transactions."
            },
            {
                "question_text": "Which SQL JOIN returns all rows from the left table and matched rows from the right table?",
                "option_a": "INNER JOIN",
                "option_b": "LEFT JOIN",
                "option_c": "RIGHT JOIN",
                "option_d": "FULL OUTER JOIN",
                "correct_option": "B",
                "explanation": "LEFT JOIN returns all records from the left table, and matched records from the right table."
            },
            {
                "question_text": "What is the primary purpose of a database Index?",
                "option_a": "To encrypt sensitive data",
                "option_b": "To speed up data retrieval operations on a table",
                "option_c": "To reduce database file size on disk",
                "option_d": "To auto-generate backup copies",
                "correct_option": "B",
                "explanation": "Indexes improve the speed of query execution at the cost of additional write overhead."
            }
        ]
    },
    {
        "title": "Generative AI & Agentic Systems",
        "slug": "genai-agentic-ai",
        "category": "AI & Machine Learning",
        "time_minutes": 20,
        "passing_score": 70,
        "level": "Intermediate",
        "icon_name": "Cpu",
        "description": "Assess your skills in LLMs, Prompt Engineering, RAG (Retrieval-Augmented Generation), LangChain, and Autonomous AI Agents.",
        "questions": [
            {
                "question_text": "What is the primary role of a Vector Database in a RAG (Retrieval-Augmented Generation) pipeline?",
                "option_a": "To train deep learning neural network weights from scratch",
                "option_b": "To store and perform semantic similarity search over high-dimensional text embeddings",
                "option_c": "To convert Python code to binary executable files",
                "option_d": "To encrypt user passwords in SHA-256",
                "correct_option": "B",
                "explanation": "Vector databases index embeddings for rapid approximate nearest neighbor (ANN) similarity search."
            },
            {
                "question_text": "In LangChain or Agentic workflows, what is the 'ReAct' framework?",
                "option_a": "A frontend UI library developed by Meta",
                "option_b": "A prompting and reasoning paradigm combining Reasoning and Action steps iteratively",
                "option_c": "A reactive database cache",
                "option_d": "An image generation model",
                "correct_option": "B",
                "explanation": "ReAct allows autonomous agents to alternate between thought/reasoning and calling tools/actions."
            },
            {
                "question_text": "What is 'Temperature' parameter used for in Large Language Model (LLM) sampling?",
                "option_a": "To monitor GPU hardware thermals",
                "option_b": "To control the randomness/creativity of token probabilities in text generation",
                "option_c": "To set the maximum context window size in tokens",
                "option_d": "To speed up server response time",
                "correct_option": "B",
                "explanation": "Lower temperature produces deterministic output; higher temperature yields creative and varied responses."
            },
            {
                "question_text": "Which technique allows an LLM agent to interact with external databases and APIs autonomously?",
                "option_a": "Function Calling / Tool Use",
                "option_b": "Token quantization",
                "option_c": "CSS Grid layout",
                "option_d": "Static code analysis",
                "correct_option": "A",
                "explanation": "Function calling and tool use empower LLMs to invoke external APIs, web search, and databases."
            }
        ]
    }
]


class Command(BaseCommand):
    help = "Seeds standard Skilloria assessments and questions."

    def handle(self, *args, **options):
        for data in ASSESSMENTS_DATA:
            questions = data.pop("questions")
            assessment, created = Assessment.objects.update_or_create(
                slug=data["slug"],
                defaults=data
            )
            for idx, q_data in enumerate(questions):
                AssessmentQuestion.objects.update_or_create(
                    assessment=assessment,
                    question_text=q_data["question_text"],
                    defaults={
                        "option_a": q_data["option_a"],
                        "option_b": q_data["option_b"],
                        "option_c": q_data["option_c"],
                        "option_d": q_data["option_d"],
                        "correct_option": q_data["correct_option"],
                        "explanation": q_data.get("explanation", ""),
                        "order": idx + 1
                    }
                )
            self.stdout.write(self.style.SUCCESS(f"Seeded assessment: {assessment.title}"))
