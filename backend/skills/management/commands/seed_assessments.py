from django.core.management.base import BaseCommand
from skills.models import Assessment, AssessmentQuestion

# 20+ High quality, comprehensive questions per assessment track covering all modern roles
ASSESSMENTS_DATA = [
    {
        "title": "Backend Development & Python",
        "slug": "backend-python",
        "category": "Backend",
        "time_minutes": 20,
        "passing_score": 70,
        "level": "Intermediate",
        "icon_name": "Server",
        "description": "Evaluate understanding of Python, Django REST Framework, database ORM, concurrency, and API architecture.",
        "questions": [
            {
                "question_text": "In Django ORM, which method uses SQL JOINs to avoid N+1 queries on ForeignKey relationships?",
                "option_a": "prefetch_related()",
                "option_b": "select_related()",
                "option_c": "defer()",
                "option_d": "distinct()",
                "correct_option": "B",
                "explanation": "select_related() creates a SQL JOIN and includes the related fields directly in the SELECT query."
            },
            {
                "question_text": "What does a 401 HTTP Status Code mean compared to a 403 Forbidden?",
                "option_a": "401 means server error, 403 means client error",
                "option_b": "401 means Unauthorized (missing or invalid authentication credentials), 403 means Authenticated but access is denied",
                "option_c": "401 is for GET requests, 403 is for POST requests",
                "option_d": "There is no functional difference in REST APIs",
                "correct_option": "B",
                "explanation": "401 challenges authentication credentials, while 403 means the user identity is known but lacks permissions."
            },
            {
                "question_text": "In Python, which built-in collection is mutable and guarantees key insertion order in Python 3.7+?",
                "option_a": "tuple",
                "option_b": "dict",
                "option_c": "frozenset",
                "option_d": "int",
                "correct_option": "B",
                "explanation": "dict in Python 3.7+ is guaranteed to maintain insertion order while being fully mutable."
            },
            {
                "question_text": "Which HTTP method is idempotent and completely replaces the target resource with the request body?",
                "option_a": "POST",
                "option_b": "PUT",
                "option_c": "PATCH",
                "option_d": "CONNECT",
                "correct_option": "B",
                "explanation": "PUT is idempotent and replaces the entire target resource with the payload provided."
            },
            {
                "question_text": "What is the Global Interpreter Lock (GIL) in CPython?",
                "option_a": "A lock that prevents multiple Python processes from spawning",
                "option_b": "A mutex that allows only one native thread to execute Python bytecode at a time",
                "option_c": "A database transaction isolation lock",
                "option_d": "A network security socket encryption wrapper",
                "correct_option": "B",
                "explanation": "The GIL is a mutex protecting access to Python objects, preventing multiple threads from executing bytecode simultaneously."
            },
            {
                "question_text": "What is the purpose of Python's 'asyncio' and the 'await' keyword?",
                "option_a": "To spawn OS kernel background threads",
                "option_b": "To pause coroutine execution until an I/O operation completes without blocking the event loop",
                "option_c": "To convert synchronous functions into C extensions",
                "option_d": "To parallelize CPU-heavy calculations across GPU cores",
                "correct_option": "B",
                "explanation": "await yields control back to the event loop during asynchronous I/O operations."
            },
            {
                "question_text": "In Django REST Framework, what does a Serializer primarily do?",
                "option_a": "Compresses images uploaded by clients",
                "option_b": "Converts complex data types like querysets and model instances into native Python datatypes (JSON/XML) and validates input",
                "option_c": "Manages database table migrations",
                "option_d": "Handles WebSocket bi-directional streaming",
                "correct_option": "B",
                "explanation": "Serializers convert complex ORM model instances to Python primitives and validate inbound JSON payloads."
            },
            {
                "question_text": "Which Python decorator is used to define a method that belongs to the class rather than an instance?",
                "option_a": "@staticmethod",
                "option_b": "@classmethod",
                "option_c": "@property",
                "option_d": "@abstractmethod",
                "correct_option": "B",
                "explanation": "@classmethod receives the class 'cls' as the first implicit parameter instead of an instance 'self'."
            },
            {
                "question_text": "What is the time complexity of looking up a key in a Python dictionary on average?",
                "option_a": "O(1)",
                "option_b": "O(log N)",
                "option_c": "O(N)",
                "option_d": "O(N log N)",
                "correct_option": "A",
                "explanation": "Python dicts use an optimized hash table structure yielding average O(1) time complexity for lookups."
            },
            {
                "question_text": "In Celery / Redis background task queues, what is an 'idempotent' task?",
                "option_a": "A task that only runs once and can never be re-tried",
                "option_b": "A task that can be executed multiple times without altering the final state beyond the initial execution",
                "option_c": "A task that runs indefinitely in the background",
                "option_d": "A task written in pure C++",
                "correct_option": "B",
                "explanation": "Idempotent tasks can safely be re-attempted during network retries without duplicate side effects."
            },
            {
                "question_text": "In Python, what is the difference between deepcopy and shallow copy?",
                "option_a": "Shallow copy copies references to nested objects; deepcopy recursively copies all nested objects",
                "option_b": "Deepcopy only works on primitive types like int and float",
                "option_c": "Shallow copy is slower than deepcopy",
                "option_d": "There is no difference in modern Python",
                "correct_option": "A",
                "explanation": "copy.copy creates a shallow copy, while copy.deepcopy recursively duplicates all nested compound objects."
            },
            {
                "question_text": "In Django, where should sensitive credentials like SECRET_KEY and DB_PASSWORD be stored?",
                "option_a": "Hardcoded in settings.py",
                "option_b": "In environment variables / .env files loaded securely",
                "option_c": "In the public Git repository commit message",
                "option_d": "Inside the SQLite database file",
                "correct_option": "B",
                "explanation": "Sensitive secrets should always be injected via environment variables or secret managers."
            },
            {
                "question_text": "What is a Python Generator, and how does it save memory?",
                "option_a": "A compiler that converts code into machine language",
                "option_b": "A function that uses 'yield' to produce items on demand (lazy evaluation) rather than storing all items in memory",
                "option_c": "A tool that generates documentation automatically",
                "option_d": "A multithreading coordinator",
                "correct_option": "B",
                "explanation": "Generators yield items one at a time on demand, achieving O(1) auxiliary memory consumption."
            },
            {
                "question_text": "What is the primary difference between WSGI and ASGI in Python web servers?",
                "option_a": "WSGI is asynchronous, ASGI is synchronous",
                "option_b": "WSGI is synchronous (request-response); ASGI supports asynchronous coroutines, WebSockets, and long-polling",
                "option_c": "ASGI only works with static HTML pages",
                "option_d": "WSGI was designed for microcontrollers",
                "correct_option": "B",
                "explanation": "ASGI (Asynchronous Server Gateway Interface) extends WSGI to handle async protocols like WebSockets."
            },
            {
                "question_text": "Which Django middleware handles cross-site request forgery protection?",
                "option_a": "SessionMiddleware",
                "option_b": "CsrfViewMiddleware",
                "option_c": "AuthenticationMiddleware",
                "option_d": "CommonMiddleware",
                "correct_option": "B",
                "explanation": "CsrfViewMiddleware checks that POST/PUT/DELETE requests contain a valid CSRF token to prevent cross-site exploits."
            },
            {
                "question_text": "In Python exception handling, when does the 'finally' block execute?",
                "option_a": "Only if an exception is caught",
                "option_b": "Always, whether an exception was raised or not",
                "option_c": "Only if no exception was raised",
                "option_d": "Never if return statement is inside try",
                "correct_option": "B",
                "explanation": "The finally block executes under all circumstances, typically used for releasing resources and closing handles."
            },
            {
                "question_text": "What is connection pooling in database backends (e.g. pgBouncer)?",
                "option_a": "Replicating data across multiple data centers",
                "option_b": "Maintaining a cache of open database connections to avoid expensive connection creation overhead on every query",
                "option_c": "Encrypting network traffic between server and client",
                "option_d": "Compressing database logs into zip archives",
                "correct_option": "B",
                "explanation": "Connection pools reuse active database connections to avoid the heavy TCP/TLS handshake latency."
            },
            {
                "question_text": "In Python, what is the 'collections.defaultdict' used for?",
                "option_a": "To sort keys alphabetically",
                "option_b": "To provide a default fallback value for non-existent keys without raising a KeyError",
                "option_c": "To limit the maximum number of items in a dictionary",
                "option_d": "To encrypt dictionary values in memory",
                "correct_option": "B",
                "explanation": "defaultdict calls a factory function (e.g. list, int) automatically when an unseen key is accessed."
            },
            {
                "question_text": "What is the function of JWT refresh tokens?",
                "option_a": "To encrypt the database password",
                "option_b": "To securely obtain a new short-lived access token without requiring the user to re-enter login credentials",
                "option_c": "To invalidate all active CSS sessions",
                "option_d": "To speed up DNS resolution",
                "correct_option": "B",
                "explanation": "Refresh tokens allow clients to renew expired access tokens securely from the auth server."
            },
            {
                "question_text": "In pytest, what is a 'fixture'?",
                "option_a": "A permanent bug that cannot be fixed",
                "option_b": "A function that provides a fixed baseline of test data, database setup, or mocks before tests run",
                "option_c": "A hardware device attached to the server",
                "option_d": "A compiler plugin for Python 3.12",
                "correct_option": "B",
                "explanation": "Pytest fixtures manage test setup and teardown dependencies in a clean, reusable way."
            }
        ]
    },
    {
        "title": "React & Modern Frontend Architecture",
        "slug": "react-frontend",
        "category": "Frontend",
        "time_minutes": 20,
        "passing_score": 70,
        "level": "Intermediate",
        "icon_name": "Code",
        "description": "Evaluate expertise in React 18/19, Custom Hooks, Redux Toolkit, SSR (Next.js), and component performance optimization.",
        "questions": [
            {
                "question_text": "What is the primary benefit of React's useMemo hook?",
                "option_a": "To memoize expensive computed values across renders until dependencies change",
                "option_b": "To trigger automatic re-renders on prop change",
                "option_c": "To replace Redux for global store management",
                "option_d": "To force synchronous DOM mutations",
                "correct_option": "A",
                "explanation": "useMemo caches the result of a calculation between re-renders until dependency values change."
            },
            {
                "question_text": "In Next.js App Router, which component executes exclusively on the server by default?",
                "option_a": "Client Components with 'use client'",
                "option_b": "React Server Components (RSC)",
                "option_c": "Service Workers",
                "option_d": "Web Components",
                "correct_option": "B",
                "explanation": "In Next.js App Router, components in the app directory are React Server Components by default unless marked with 'use client'."
            },
            {
                "question_text": "How does React 18 Concurrent Mode improve user interface responsiveness?",
                "option_a": "By running all JavaScript in multi-threaded Web Workers",
                "option_b": "By allowing React to interrupt, pause, and resume rendering work to prioritize urgent user interactions",
                "option_c": "By eliminating virtual DOM diffing",
                "option_d": "By converting JSX into pure WebAssembly binaries",
                "correct_option": "B",
                "explanation": "Concurrent React enables interruptible rendering via useTransition and startTransition for non-blocking UI."
            },
            {
                "question_text": "What is the difference between useCallback and useMemo in React?",
                "option_a": "useCallback returns a memoized function callback; useMemo returns a memoized calculated value",
                "option_b": "useCallback only works in class components",
                "option_c": "useMemo cannot take a dependency array",
                "option_d": "useCallback is deprecated in React 18",
                "correct_option": "A",
                "explanation": "useCallback(fn, deps) is equivalent to useMemo(() => fn, deps), caching the function instance."
            },
            {
                "question_text": "Why is using array index as a 'key' prop considered an anti-pattern in dynamic React lists?",
                "option_a": "React throws a runtime syntax error",
                "option_b": "It causes incorrect component state retention and rendering bugs when items are reordered or deleted",
                "option_c": "It slows down network transfer speed",
                "option_d": "It breaks CSS styling rules",
                "correct_option": "B",
                "explanation": "Indices change when items are inserted/removed/reordered, confusing React's reconciliation diffing."
            },
            {
                "question_text": "In Redux Toolkit, what does 'createSlice' automatically generate for you?",
                "option_a": "Database migrations",
                "option_b": "Action creators and reducer functions based on the case reducers defined",
                "option_c": "HTML templates",
                "option_d": "Browser cookies",
                "correct_option": "B",
                "explanation": "createSlice automatically generates action creator functions corresponding to the reducer methods."
            },
            {
                "question_text": "What problem does React Context solve, and what is its primary caveat?",
                "option_a": "Solves prop drilling, but every consumer re-renders whenever the context value changes unless memoized",
                "option_b": "Solves server-side caching, but cannot be used in functional components",
                "option_c": "Replaces all API calls, but increases bundle size by 50%",
                "option_d": "Solves CSS modularity, but breaks TypeScript typing",
                "correct_option": "A",
                "explanation": "Context eliminates prop drilling across nested components, but changes cause all consumer components to re-render."
            },
            {
                "question_text": "What is the purpose of React.lazy and Suspense?",
                "option_a": "To delay execution of API requests by 5 seconds",
                "option_b": "To dynamically code-split and load components on demand while showing a fallback loader",
                "option_c": "To convert React to React Native",
                "option_d": "To prevent memory leaks in event listeners",
                "correct_option": "B",
                "explanation": "React.lazy enables route-based code-splitting, rendering a Suspense fallback while the bundle chunk loads."
            },
            {
                "question_text": "In JavaScript event handling, what is the difference between event.stopPropagation() and event.preventDefault()?",
                "option_a": "stopPropagation halts event bubbling up the DOM tree; preventDefault cancels default browser behavior",
                "option_b": "preventDefault halts bubbling; stopPropagation cancels default behavior",
                "option_c": "They are completely identical",
                "option_d": "stopPropagation is only for touch screen events",
                "correct_option": "A",
                "explanation": "stopPropagation stops propagation through parent handlers; preventDefault prevents default actions like form reload."
            },
            {
                "question_text": "What is hydration in Server-Side Rendered (SSR) React applications?",
                "option_a": "Drinking water during coding sessions",
                "option_b": "Attaching event listeners and React state to server-rendered HTML in the client browser",
                "option_c": "Compressing images with gzip",
                "option_d": "Clearing the localStorage cache",
                "correct_option": "B",
                "explanation": "Hydration turns static server-rendered HTML into an interactive React application by attaching DOM event listeners."
            },
            {
                "question_text": "In React 18, what does the 'useTransition' hook accomplish?",
                "option_a": "Adds CSS transition animations to DOM elements",
                "option_b": "Marks state updates as non-urgent transitions, keeping the user interface responsive during heavy renders",
                "option_c": "Navigates between Next.js routes",
                "option_d": "Validates form input fields",
                "correct_option": "B",
                "explanation": "useTransition lets you mark updates as transitions, preventing UI freezes during heavy computations."
            },
            {
                "question_text": "What is the closure problem in React's useEffect hook?",
                "option_a": "When the browser tab closes unexpectedly",
                "option_b": "When an effect captures stale state or props variables because they were omitted from the dependency array",
                "option_c": "When CSS flexbox collapses to zero height",
                "option_d": "When Redux store is garbage collected",
                "correct_option": "B",
                "explanation": "Stale closures occur when an effect callback references variables from an older render cycle."
            },
            {
                "question_text": "Which React Hook would you use to measure the size or position of a DOM element after paint?",
                "option_a": "useEffect",
                "option_b": "useLayoutEffect",
                "option_c": "useId",
                "option_d": "useDebugValue",
                "correct_option": "B",
                "explanation": "useLayoutEffect fires synchronously after all DOM mutations but before the browser paints to avoid layout flicker."
            },
            {
                "question_text": "How does React handle synthetic events differently from native browser DOM events?",
                "option_a": "Synthetic events are pooled cross-browser wrappers delegating to the root container for consistent behavior",
                "option_b": "Synthetic events only work in Chrome",
                "option_c": "Native events cannot be prevented",
                "option_d": "Synthetic events cannot access event.target",
                "correct_option": "A",
                "explanation": "SyntheticEvent wraps native browser events for consistent cross-browser behavior via top-level delegation."
            },
            {
                "question_text": "In TypeScript with React, what is the difference between React.FC<Props> and regular function declaration?",
                "option_a": "Function declarations provide cleaner typing without implicit children props and better generic support",
                "option_b": "React.FC compiles faster into assembly",
                "option_c": "Function declarations cannot use hooks",
                "option_d": "There is no difference in TypeScript",
                "correct_option": "A",
                "explanation": "Standard function typing (function Component(props: Props)) is modern best practice over React.FC."
            },
            {
                "question_text": "What is the purpose of the 'forwardRef' API in React?",
                "option_a": "To redirect users to another page",
                "option_b": "To allow a parent component to pass a ref down through a child component to an underlying DOM node",
                "option_c": "To bind this context in class components",
                "option_d": "To auto-save draft form data to database",
                "correct_option": "B",
                "explanation": "forwardRef lets a component expose a DOM node to a parent component using a ref."
            },
            {
                "question_text": "What is the difference between server-side rendering (SSR) and static site generation (SSG)?",
                "option_a": "SSR renders HTML on every client request; SSG renders HTML once at build time",
                "option_b": "SSG only works with Python",
                "option_c": "SSR does not support JavaScript",
                "option_d": "SSG cannot be hosted on CDNs",
                "correct_option": "A",
                "explanation": "SSG generates HTML during build time for maximum speed on CDNs; SSR builds HTML dynamically per request."
            },
            {
                "question_text": "How do you prevent unnecessary re-renders in a child functional component receiving primitive props?",
                "option_a": "Wrap the child component in React.memo()",
                "option_b": "Call forceUpdate() inside the child",
                "option_c": "Delete the child component key",
                "option_d": "Use document.getElementById()",
                "correct_option": "A",
                "explanation": "React.memo performs a shallow comparison of props to skip re-rendering if props have not changed."
            },
            {
                "question_text": "In Tailwind CSS, what is the purpose of the JIT (Just-in-Time) compiler engine?",
                "option_a": "To optimize database queries",
                "option_b": "To generate CSS styles on demand by scanning template files, eliminating bloated CSS bundles",
                "option_c": "To convert JavaScript into WebGL",
                "option_d": "To compress web fonts",
                "correct_option": "B",
                "explanation": "Tailwind's JIT compiler generates only the exact utility classes used across your code."
            },
            {
                "question_text": "What is the React DevTools Profiler used for?",
                "option_a": "To edit user profile photos",
                "option_b": "To record component render times and identify wasteful commit phase re-renders",
                "option_c": "To inspect HTTP network headers",
                "option_d": "To check SSL certificate validity",
                "correct_option": "B",
                "explanation": "The Profiler visualizes component render durations, commit phases, and why specific components rendered."
            }
        ]
    },
    {
        "title": "Java & Spring Boot Enterprise Architecture",
        "slug": "java-spring-boot",
        "category": "Enterprise Backend",
        "time_minutes": 20,
        "passing_score": 70,
        "level": "Intermediate",
        "icon_name": "Terminal",
        "description": "Assess core Java (OOP, Streams, Concurrency), Spring Boot annotations, Dependency Injection, and Hibernate JPA.",
        "questions": [
            {
                "question_text": "In Java Spring Boot, what is the role of the '@Autowired' annotation?",
                "option_a": "To compile bytecode into native machine code",
                "option_b": "To enable automatic Dependency Injection into Spring-managed beans",
                "option_c": "To configure database SSL connections",
                "option_d": "To enforce transactional read-only locks",
                "correct_option": "B",
                "explanation": "@Autowired tells Spring's IoC container to resolve and inject collaborating beans into the target field or constructor."
            },
            {
                "question_text": "In modern Java (8+), which Stream API operation is intermediate (lazy) rather than terminal?",
                "option_a": "collect()",
                "option_b": "filter()",
                "option_c": "forEach()",
                "option_d": "count()",
                "correct_option": "B",
                "explanation": "filter() is an intermediate operation returning a new lazy stream; terminal operations like collect() trigger pipeline execution."
            },
            {
                "question_text": "What is the key difference between HashMap and ConcurrentHashMap in Java?",
                "option_a": "HashMap is thread-safe; ConcurrentHashMap is not",
                "option_b": "ConcurrentHashMap uses bucket/segment level locking for high concurrent throughput without locking the entire map",
                "option_c": "HashMap does not allow null keys; ConcurrentHashMap allows multiple null keys",
                "option_d": "There is no difference in modern JVMs",
                "correct_option": "B",
                "explanation": "ConcurrentHashMap achieves thread-safety with lock striping/CAS operations without blocking concurrent reads."
            },
            {
                "question_text": "What is the difference between Comparable and Comparator interfaces in Java?",
                "option_a": "Comparable defines natural ordering via compareTo(); Comparator defines custom/multiple sort strategies via compare()",
                "option_b": "Comparator can only be used with arrays",
                "option_c": "Comparable is deprecated in Java 17",
                "option_d": "Comparator is only for string types",
                "correct_option": "A",
                "explanation": "Comparable modifies the class itself (natural sort); Comparator creates separate sorting logic."
            },
            {
                "question_text": "In Spring Boot, what does the '@Transactional' annotation do?",
                "option_a": "Converts Java methods into REST endpoints",
                "option_b": "Wraps the method execution in a database transaction, automatically committing or rolling back on runtime exceptions",
                "option_c": "Encrypts network payloads",
                "option_d": "Schedules a recurring cron job",
                "correct_option": "B",
                "explanation": "@Transactional manages transaction boundary, ensuring ACID compliance and rollback on unchecked exceptions."
            },
            {
                "question_text": "In Java Garbage Collection, what is the Young Generation vs Old (Tenured) Generation?",
                "option_a": "Young generation holds newly allocated objects; objects surviving multiple minor GC cycles are promoted to Old generation",
                "option_b": "Old generation is stored on hard disk",
                "option_c": "Young generation contains static variables only",
                "option_d": "They refer to JVM licensing tiers",
                "correct_option": "A",
                "explanation": "Generational hypothesis: most objects die young. Minor GC collects Eden/Survivor spaces; survivors promote to Tenured."
            },
            {
                "question_text": "What is the difference between String, StringBuilder, and StringBuffer in Java?",
                "option_a": "String is immutable; StringBuilder is mutable and not thread-safe; StringBuffer is mutable and thread-safe (synchronized)",
                "option_b": "StringBuilder cannot append characters",
                "option_c": "StringBuffer is immutable",
                "option_d": "String is stored in thread stack only",
                "correct_option": "A",
                "explanation": "String creates new instances on modification; StringBuilder is fast non-synchronized; StringBuffer is synchronized."
            },
            {
                "question_text": "In Spring Boot, how does Spring Boot Starters simplify dependency management?",
                "option_a": "They automatically download Python libraries",
                "option_b": "They aggregate curated, compatible dependency descriptors and transitive libraries under a single dependency",
                "option_c": "They compile Java code into C++",
                "option_d": "They provide a web browser interface",
                "correct_option": "B",
                "explanation": "Starters (e.g. spring-boot-starter-web) bundle common compatible dependencies and auto-configuration."
            },
            {
                "question_text": "What is the difference between Fail-Fast and Fail-Safe iterators in Java collections?",
                "option_a": "Fail-Fast throws ConcurrentModificationException immediately if the collection is modified during iteration; Fail-Safe operates on a clone",
                "option_b": "Fail-Safe crashes the JVM",
                "option_c": "Fail-Fast iterators only exist in C#",
                "option_d": "There is no difference",
                "correct_option": "A",
                "explanation": "Fail-fast iterators (ArrayList) abort immediately on concurrent mutation; fail-safe iterators (CopyOnWriteArrayList) traverse a snapshot."
            },
            {
                "question_text": "In JPA / Hibernate, what is the 'N+1 Select' problem?",
                "option_a": "When a query runs N+1 times faster than expected",
                "option_b": "When 1 query fetches N parent entities, followed by N separate queries to fetch related child entities",
                "option_c": "When database tables exceed N columns",
                "option_d": "A bug in SQL syntax validation",
                "correct_option": "B",
                "explanation": "N+1 query problem occurs when lazy loading fetches associated entities individually rather than with a JOIN fetch."
            },
            {
                "question_text": "In Java Concurrency, what is the purpose of the 'volatile' keyword?",
                "option_a": "To lock an object mutex permanently",
                "option_b": "To ensure that read/write operations on a variable are directly flushed to and read from main memory across all threads",
                "option_c": "To convert a variable into a constant",
                "option_d": "To delete variable from garbage collector",
                "correct_option": "B",
                "explanation": "volatile guarantees memory visibility across threads, preventing CPU core caching inconsistencies."
            },
            {
                "question_text": "In Spring Framework, what is an Inversion of Control (IoC) Container?",
                "option_a": "A hardware server rack",
                "option_b": "A core container that instantiates, configures, and manages the lifecycle of application beans using Dependency Injection",
                "option_c": "A database query optimizer",
                "option_d": "A Docker orchestration CLI",
                "correct_option": "B",
                "explanation": "Spring's IoC container manages bean assembly and life cycle, taking control away from manual instantiation."
            },
            {
                "question_text": "What is the difference between Checked and Unchecked exceptions in Java?",
                "option_a": "Checked exceptions inherit from Exception and must be handled or declared; Unchecked inherit from RuntimeException",
                "option_b": "Unchecked exceptions are fatal hardware crashes",
                "option_c": "Checked exceptions cannot be caught in try-catch",
                "option_d": "There are no unchecked exceptions in Java",
                "correct_option": "A",
                "explanation": "Checked exceptions are checked at compile time; RuntimeException subclasses are unchecked."
            },
            {
                "question_text": "In Spring Boot, which annotation is used to map HTTP POST requests onto specific handler methods?",
                "option_a": "@GetMapping",
                "option_b": "@PostMapping",
                "option_c": "@PutMapping",
                "option_d": "@RequestMapping(method = DELETE)",
                "correct_option": "B",
                "explanation": "@PostMapping is a shortcut annotation acting as a synonym for @RequestMapping(method = RequestMethod.POST)."
            },
            {
                "question_text": "What is the difference between '==' and '.equals()' when comparing Java Objects?",
                "option_a": "'==' compares memory reference addresses; '.equals()' compares logical object equality",
                "option_b": "'.equals()' compares memory addresses; '==' compares values",
                "option_c": "They are identical for all objects",
                "option_d": "'.equals()' only works for primitive integers",
                "correct_option": "A",
                "explanation": "== checks reference equality (identity), while .equals() evaluates content/state equality when overridden."
            },
            {
                "question_text": "What is a Java Record introduced in Java 14+?",
                "option_a": "A database audio recording API",
                "option_b": "An immutable data carrier class that auto-generates constructor, getters, equals, hashCode, and toString",
                "option_c": "A thread pool coordinator",
                "option_d": "A substitute for Spring MVC controllers",
                "correct_option": "B",
                "explanation": "Records provide a compact syntax for declaring pure data-holding immutable classes."
            },
            {
                "question_text": "In Spring Security, what is the role of a SecurityFilterChain?",
                "option_a": "To encrypt disk files",
                "option_b": "To configure the ordered sequence of security filters that process and authorize incoming HTTP requests",
                "option_c": "To generate SSL private keys",
                "option_d": "To manage database table migrations",
                "correct_option": "B",
                "explanation": "SecurityFilterChain defines authentication providers, authorization rules, and CORS/CSRF filters."
            },
            {
                "question_text": "What is the difference between Callable and Runnable in Java multithreading?",
                "option_a": "Callable can return a result and throw checked exceptions; Runnable returns void and cannot throw checked exceptions",
                "option_b": "Runnable runs on GPU cores",
                "option_c": "Callable cannot be submitted to an ExecutorService",
                "option_d": "Runnable is deprecated in Java 21",
                "correct_option": "A",
                "explanation": "Callable<V> has a call() method returning V and throwing Exception; Runnable's run() method returns void."
            },
            {
                "question_text": "What does the '@RestController' annotation in Spring Boot combine?",
                "option_a": "@Controller and @ResponseBody",
                "option_b": "@Service and @Repository",
                "option_c": "@Component and @Configuration",
                "option_d": "@Bean and @Scope",
                "correct_option": "A",
                "explanation": "@RestController is a convenience annotation combining @Controller and @ResponseBody to return JSON directly."
            },
            {
                "question_text": "What are Java Virtual Threads (Project Loom) in Java 21?",
                "option_a": "Lightweight JVM-managed user-mode threads that drastically reduce the resource cost of high-throughput concurrent I/O",
                "option_b": "Hardware CPUs emulated in software",
                "option_c": "A cloud virtualization service",
                "option_d": "Threads designed exclusively for graphics rendering",
                "correct_option": "A",
                "explanation": "Virtual threads are lightweight threads managed by the runtime, allowing millions of concurrent tasks per JVM."
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
                "explanation": "ACID properties guarantee reliable transaction execution in database management systems."
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
            },
            {
                "question_text": "What is the difference between WHERE and HAVING clauses in SQL?",
                "option_a": "WHERE filters rows before grouping; HAVING filters aggregated groups after GROUP BY",
                "option_b": "HAVING only works on primary keys",
                "option_c": "WHERE can only be used with COUNT()",
                "option_d": "There is no difference in PostgreSQL",
                "correct_option": "A",
                "explanation": "WHERE filters individual rows prior to aggregation; HAVING filters grouped summary rows."
            },
            {
                "question_text": "In relational database design, what does Third Normal Form (3NF) require?",
                "option_a": "Must be in 2NF and have no transitive functional dependencies of non-key attributes on the primary key",
                "option_b": "Must have exactly 3 columns per table",
                "option_c": "Must duplicate data across 3 backup tables",
                "option_d": "Must use NoSQL key-value pairs",
                "correct_option": "A",
                "explanation": "3NF eliminates transitive dependencies where non-prime attributes depend on other non-prime attributes."
            },
            {
                "question_text": "Why are B+ Trees predominantly preferred over Hash indexes in relational databases?",
                "option_a": "B+ Trees support fast range queries (BETWEEN, <, >) in O(log N) because leaf nodes form a linked list",
                "option_b": "B+ Trees use zero disk space",
                "option_c": "Hash indexes cannot store integers",
                "option_d": "B+ Trees only work in memory",
                "correct_option": "A",
                "explanation": "B+ Trees maintain sorted order across leaf pointers, allowing fast range scans that hash tables cannot perform."
            },
            {
                "question_text": "What does a database Deadlock represent?",
                "option_a": "When a table is permanently deleted",
                "option_b": "A situation where two or more transactions hold locks and wait for each other in a circular chain, unable to proceed",
                "option_c": "When database connection pool runs out of memory",
                "option_d": "When server power is lost",
                "correct_option": "B",
                "explanation": "Deadlock occurs when transaction A waits on a lock held by B, and B simultaneously waits on a lock held by A."
            },
            {
                "question_text": "What is the difference between TRUNCATE and DELETE in SQL?",
                "option_a": "DELETE is a DML command that logs row-by-row and supports WHERE; TRUNCATE is DDL that resets the table rapidly without row logging",
                "option_b": "TRUNCATE can be filtered with WHERE clause",
                "option_c": "DELETE is faster than TRUNCATE",
                "option_d": "TRUNCATE does not remove foreign keys",
                "correct_option": "A",
                "explanation": "TRUNCATE drops and re-creates data pages quickly; DELETE deletes individual rows and logs undo entries."
            },
            {
                "question_text": "What is the purpose of Database Sharding?",
                "option_a": "Backing up tables to Amazon S3",
                "option_b": "Horizontally partitioning large datasets across multiple independent database server nodes",
                "option_c": "Creating indexes on foreign keys",
                "option_d": "Compressing database backups into zip files",
                "correct_option": "B",
                "explanation": "Sharding splits rows across multiple database instances to scale beyond the limits of a single machine."
            },
            {
                "question_text": "What is a Foreign Key constraint in SQL?",
                "option_a": "A key imported from another database vendor",
                "option_b": "A field that refers to the Primary Key of another table, enforcing referential integrity",
                "option_c": "An encrypted password hash",
                "option_d": "A temporary variable inside a stored procedure",
                "correct_option": "B",
                "explanation": "Foreign keys enforce referential integrity between matching columns across related tables."
            },
            {
                "question_text": "In SQL transactions, what is a 'Phantom Read' anomaly?",
                "option_a": "Reading data that was never written",
                "option_b": "When a transaction re-executes a range query and finds new rows that were inserted and committed by another transaction",
                "option_c": "When the database driver disconnects",
                "option_d": "When server clock drifts",
                "correct_option": "B",
                "explanation": "Phantom reads occur in Repeatable Read isolation when newly inserted rows satisfy the query filter upon re-reading."
            },
            {
                "question_text": "What does the SQL command 'EXPLAIN ANALYZE' do in PostgreSQL?",
                "option_a": "Deletes slow query logs",
                "option_b": "Executes the query and displays the actual execution plan, cost estimates, and real timing per node",
                "option_c": "Auto-optimizes table indexes",
                "option_d": "Re-indexes database corruptions",
                "correct_option": "B",
                "explanation": "EXPLAIN ANALYZE runs the statement and outputs detailed execution statistics and actual execution times."
            },
            {
                "question_text": "What is the difference between Clustered and Non-Clustered Indexes?",
                "option_a": "A Clustered index physically sorts the table rows on disk (1 per table); Non-Clustered index stores pointers to rows",
                "option_b": "A table can have unlimited clustered indexes",
                "option_c": "Non-clustered indexes are slower than full table scans",
                "option_d": "There is no difference in MySQL InnoDB",
                "correct_option": "A",
                "explanation": "A clustered index determines the physical storage order of table data; non-clustered indexes contain separate row pointers."
            },
            {
                "question_text": "Which SQL aggregation function counts the number of non-null values in a column?",
                "option_a": "SUM()",
                "option_b": "COUNT(column)",
                "option_c": "AVG()",
                "option_d": "MAX()",
                "correct_option": "B",
                "explanation": "COUNT(column) counts rows where column IS NOT NULL, whereas COUNT(*) counts all rows."
            },
            {
                "question_text": "In Redis, what makes it drastically faster than traditional disk-based relational databases?",
                "option_a": "It compiles SQL into machine code",
                "option_b": "It stores all primary datasets directly in RAM (in-memory) with single-threaded event loop multiplexing",
                "option_c": "It does not support data persistence",
                "option_d": "It only accepts text files",
                "correct_option": "B",
                "explanation": "Redis operates in-memory with sub-millisecond read/write latency and non-blocking I/O multiplexing."
            },
            {
                "question_text": "What is Database Normalization vs Denormalization?",
                "option_a": "Normalization reduces redundancy; Denormalization deliberately introduces redundancy to optimize read query performance",
                "option_b": "Denormalization makes databases slower",
                "option_c": "Normalization is only for NoSQL",
                "option_d": "They are synonymous terms",
                "correct_option": "A",
                "explanation": "Denormalization adds redundant data to eliminate costly multi-table joins in read-heavy applications."
            },
            {
                "question_text": "What does the CAP Theorem state for distributed data stores?",
                "option_a": "A system can simultaneously guarantee Consistency, Availability, and Partition Tolerance",
                "option_b": "In the presence of network partitions, a distributed system must trade off between Consistency and Availability",
                "option_c": "All databases must be ACID compliant",
                "option_d": "Cloud databases must use Kubernetes",
                "correct_option": "B",
                "explanation": "CAP theorem proves that when network partitions (P) occur, you must choose between Consistency (C) or Availability (A)."
            },
            {
                "question_text": "What is an SQL View?",
                "option_a": "A physical copy of table data stored on disk",
                "option_b": "A virtual table defined by an underlying stored SQL query",
                "option_c": "A graphical UI dashboard",
                "option_d": "A database server monitoring tool",
                "correct_option": "B",
                "explanation": "A View is a virtual table containing rows and columns resulting from an embedded SELECT statement."
            },
            {
                "question_text": "In PostgreSQL, what is WAL (Write-Ahead Logging)?",
                "option_a": "Logging website visitor clicks",
                "option_b": "Writing transaction changes to disk log before updating data pages, ensuring durability and recovery across crashes",
                "option_c": "Encrypting network requests",
                "option_d": "Blocking unauthorized IP addresses",
                "correct_option": "B",
                "explanation": "WAL guarantees durability by logging transaction modifications prior to modifying data blocks."
            },
            {
                "question_text": "Which SQL clause is used to sort the result set in descending order?",
                "option_a": "ORDER BY column DESC",
                "option_b": "SORT BY column DOWN",
                "option_c": "GROUP BY column DESC",
                "option_d": "FILTER BY column DESC",
                "correct_option": "A",
                "explanation": "ORDER BY column DESC sorts the resulting records from highest to lowest."
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
                "question_text": "What is the primary role of a Vector Database in a RAG pipeline?",
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
            },
            {
                "question_text": "What is 'Hallucination' in generative AI models?",
                "option_a": "When the server runs out of GPU memory",
                "option_b": "When an LLM generates plausible-sounding but factually incorrect or fabricated information",
                "option_c": "When a model translates audio to text",
                "option_d": "When embeddings are converted to integers",
                "correct_option": "B",
                "explanation": "Hallucinations occur when probabilistic language models generate confident yet incorrect information."
            },
            {
                "question_text": "What is Chunking in Retrieval-Augmented Generation (RAG)?",
                "option_a": "Breaking large documents into smaller semantic segments to fit within LLM context windows and improve retrieval precision",
                "option_b": "Splitting GPU clusters across clouds",
                "option_c": "Compressing images with lossy algorithms",
                "option_d": "Deleting temporary database tables",
                "correct_option": "A",
                "explanation": "Chunking splits text into manageable chunks with overlap to ensure relevant contextual context is retrieved."
            },
            {
                "question_text": "What is the difference between Fine-Tuning and RAG for enterprise LLM adoption?",
                "option_a": "Fine-Tuning updates model weights on specific style/tasks; RAG provides dynamic real-time context without retraining weights",
                "option_b": "Fine-Tuning is completely free; RAG is always proprietary",
                "option_c": "RAG updates the underlying transformer weights permanently",
                "option_d": "There is no functional difference",
                "correct_option": "A",
                "explanation": "RAG injects external factual context dynamically; fine-tuning modifies model parameters for specialized tasks."
            },
            {
                "question_text": "In embedding models, what does Cosine Similarity measure?",
                "option_a": "The Euclidean distance in physical millimeters",
                "option_b": "The cosine of the angle between two multi-dimensional vectors, measuring semantic similarity regardless of magnitude",
                "option_c": "The execution speed of the Python interpreter",
                "option_d": "The database storage size",
                "correct_option": "B",
                "explanation": "Cosine similarity measures vector directional orientation, scoring semantic similarity from -1 to 1."
            },
            {
                "question_text": "What is 'Few-Shot Prompting'?",
                "option_a": "Prompting an LLM with zero examples",
                "option_b": "Providing a few input-output demonstration examples within the prompt to guide the model's response format and reasoning",
                "option_c": "Training a model for only 3 epochs",
                "option_d": "Limiting the token response to 10 characters",
                "correct_option": "B",
                "explanation": "Few-shot prompting conditions the model by showing exemplar demonstrations before asking the target question."
            },
            {
                "question_text": "What is an 'Autonomous Agent' loop in AI architectures?",
                "option_a": "A recurring loop of Perception -> Reasoning/Planning -> Tool Execution -> Observation -> Evaluation until goal is achieved",
                "option_b": "An infinite while loop that crashes memory",
                "option_c": "A cron job that sends marketing emails",
                "option_d": "A CSS keyframe animation",
                "correct_option": "A",
                "explanation": "Autonomous agents iteratively perceive state, plan steps, call tools, observe results, and self-correct."
            },
            {
                "question_text": "What is Context Window in Large Language Models?",
                "option_a": "The physical monitor display resolution",
                "option_b": "The maximum number of tokens an LLM can process simultaneously across both input prompt and output response",
                "option_c": "The browser iframe width",
                "option_d": "The time a user spends on a web page",
                "correct_option": "B",
                "explanation": "The context window dictates how many tokens of context (prompt + history + response) the model can hold in memory."
            },
            {
                "question_text": "What is the Transformer architecture's core innovation introduced in 'Attention Is All You Need'?",
                "option_a": "Recurrent LSTM feedback loops",
                "option_b": "Multi-Head Self-Attention mechanisms enabling parallel processing of tokens across long sequences",
                "option_c": "Convolutional pooling filters",
                "option_d": "Decision tree pruning",
                "correct_option": "B",
                "explanation": "Self-attention computes dynamic weights between all tokens in a sequence simultaneously, replacing sequential RNNs."
            },
            {
                "question_text": "What is Tokenization in natural language processing?",
                "option_a": "Creating blockchain cryptocurrency tokens",
                "option_b": "Breaking down raw text strings into sub-word units or numerical IDs that the neural network can process",
                "option_c": "Generating user session cookies",
                "option_d": "Encrypting text with AES-256",
                "correct_option": "B",
                "explanation": "Tokenization converts text strings into sub-word token sequences mapped to integer vocabulary IDs."
            },
            {
                "question_text": "What is 'Chain-of-Thought' (CoT) prompting?",
                "option_a": "Instructing the model to break down its reasoning step-by-step before producing the final answer",
                "option_b": "Connecting multiple GPU servers with cables",
                "option_c": "Generating rhyming poems",
                "option_d": "Compressing prompts to zero characters",
                "correct_option": "A",
                "explanation": "Chain-of-thought prompting dramatically boosts complex reasoning by having the model output intermediate logic."
            },
            {
                "question_text": "In LangChain, what is an 'Agent Executor'?",
                "option_a": "A database administrator with root privileges",
                "option_b": "The runtime that takes an agent, calls its selected tools, passes tool outputs back to the agent, and repeats until completion",
                "option_c": "A JavaScript compiler",
                "option_d": "An operating system thread scheduler",
                "correct_option": "B",
                "explanation": "The agent executor runs the action-observation cycle, orchestrating tool calls and feeding results back."
            },
            {
                "question_text": "What is 'Prompt Injection' and how is it mitigated?",
                "option_a": "A security vulnerability where untrusted user input overrides system instructions; mitigated via input sanitization and delimiter fencing",
                "option_b": "A technique to speed up generation latency",
                "option_c": "A method to compress model weights",
                "option_d": "An SQL database error",
                "correct_option": "A",
                "explanation": "Prompt injection tricks the LLM into disregarding original instructions, mitigated with guardrails and clear separation."
            },
            {
                "question_text": "What is Reinforcement Learning from Human Feedback (RLHF)?",
                "option_a": "A training phase where human preference rankings train a reward model to align LLM outputs with human intent and safety",
                "option_b": "Manual data entry done by call center staff",
                "option_c": "Writing unit tests for Python code",
                "option_d": "A technique for speeding up GPU cooling",
                "correct_option": "A",
                "explanation": "RLHF fine-tunes base models using reward models trained on human preference comparisons to maximize helpfulness and safety."
            },
            {
                "question_text": "In vector search, what does 'Hybrid Search' refer to?",
                "option_a": "Combining dense vector semantic search with sparse keyword search (BM25) to capture both semantic meaning and exact keywords",
                "option_b": "Searching on both CPU and GPU simultaneously",
                "option_c": "Searching across both audio and video files",
                "option_d": "Using two different web browsers",
                "correct_option": "A",
                "explanation": "Hybrid search blends dense vector embeddings with sparse keyword matching (like BM25) for optimal retrieval accuracy."
            },
            {
                "question_text": "What is Quantization (e.g. 4-bit, 8-bit) in LLM deployment?",
                "option_a": "Reducing the numerical precision of model weights (from FP16/32 to INT4/8) to save VRAM and increase inference speed",
                "option_b": "Quantum computing integration",
                "option_c": "Splitting an LLM into multiple languages",
                "option_d": "Converting text to audio",
                "correct_option": "A",
                "explanation": "Quantization compresses model weights into lower-bit representations, allowing large models to run on smaller GPUs."
            },
            {
                "question_text": "What is a 'System Prompt' in LLM API requests?",
                "option_a": "Operating system terminal commands",
                "option_b": "High-priority instructional guidance that establishes the persona, behavioral boundaries, and output format of the model",
                "option_c": "Hardware diagnostics output",
                "option_d": "A database connection string",
                "correct_option": "B",
                "explanation": "The system prompt sets top-level context, constraints, and identity that persist across the entire conversation."
            }
        ]
    },
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
                "question_text": "What is the key difference between '==' and '===' in JavaScript?",
                "option_a": "'==' performs type coercion before comparison, whereas '===' strictly checks both value and type",
                "option_b": "'===' performs type coercion, while '==' does not",
                "option_c": "There is no difference in ES6",
                "option_d": "'===' only works on numbers and objects",
                "correct_option": "A",
                "explanation": "Strict equality (===) prevents unexpected type casting and strictly matches both data types and values."
            },
            {
                "question_text": "What does the CSS 'box-sizing: border-box' declaration do?",
                "option_a": "Removes borders from all block elements",
                "option_b": "Includes padding and border within the element's total calculated width and height",
                "option_c": "Excludes margin and padding from the viewport",
                "option_d": "Forces box shadow to display inside",
                "correct_option": "B",
                "explanation": "border-box ensures padding and border are contained inside the specified width/height instead of expanding outside."
            },
            {
                "question_text": "In JavaScript, what is event delegation?",
                "option_a": "Attaching a single event listener to a parent element to handle events bubbling from children",
                "option_b": "Passing functions as callbacks to setTimeout",
                "option_c": "Delegating asynchronous tasks to Web Workers",
                "option_d": "Canceling event bubbling with preventDefault()",
                "correct_option": "A",
                "explanation": "Event delegation leverages DOM event bubbling by binding a single listener to a common ancestor."
            },
            {
                "question_text": "What is the primary difference between localStorage and sessionStorage in HTML5?",
                "option_a": "localStorage persists until explicitly cleared, while sessionStorage expires when the browser tab closes",
                "option_b": "sessionStorage has a 50MB limit while localStorage has 5MB",
                "option_c": "localStorage cannot store string data",
                "option_d": "sessionStorage is transmitted automatically with every HTTP header",
                "correct_option": "A",
                "explanation": "localStorage remains saved across browser restarts, whereas sessionStorage only persists for that specific tab session."
            },
            {
                "question_text": "What does the JavaScript Array method '.reduce()' return?",
                "option_a": "Always an array of smaller length",
                "option_b": "A single accumulated value resulting from running a reducer callback over all elements",
                "option_c": "A boolean indicating match",
                "option_d": "A sorted copy of the array",
                "correct_option": "B",
                "explanation": "reduce() iterates through items and reduces them into a single target value, array, or object."
            },
            {
                "question_text": "What is the CSS Grid property to create responsive columns that automatically wrap without media queries?",
                "option_a": "grid-template-columns: repeat(auto-fit, minmax(250px, 1fr))",
                "option_b": "grid-auto-flow: dense row",
                "option_c": "display: flex; flex-wrap: wrap",
                "option_d": "grid-columns: auto-fill 100%",
                "correct_option": "A",
                "explanation": "repeat(auto-fit, minmax(250px, 1fr)) creates fluid columns that fill available width and wrap dynamically."
            },
            {
                "question_text": "What is the effect of declaring 'defer' on a <script> tag?",
                "option_a": "The script is never downloaded until user interaction",
                "option_b": "The script downloads in parallel and executes in order after the HTML document parsing is complete",
                "option_c": "The script blocks HTML parsing immediately",
                "option_d": "The script runs inside a Web Worker background thread",
                "correct_option": "B",
                "explanation": "defer scripts download asynchronously and execute sequentially after the DOM is parsed."
            },
            {
                "question_text": "What is a JavaScript Closure?",
                "option_a": "A function that has access to variables from its outer (enclosing) lexical scope even after that scope has closed",
                "option_b": "A function that terminates immediately upon execution",
                "option_c": "An object that cannot accept new properties",
                "option_d": "A syntax error that halts execution",
                "correct_option": "A",
                "explanation": "Closures allow inner functions to retain access to variables in outer enclosing scopes."
            },
            {
                "question_text": "In modern Web APIs, what is the Intersection Observer API used for?",
                "option_a": "Intercepting HTTP requests before they reach the server",
                "option_b": "Efficiently observing when an element enters or leaves the browser viewport (lazy loading, infinite scroll)",
                "option_c": "Calculating intersections between two database tables",
                "option_d": "Detecting hardware accelerations",
                "correct_option": "B",
                "explanation": "IntersectionObserver provides a high-performance way to asynchronously detect element visibility without scroll listeners."
            },
            {
                "question_text": "What is the difference between debounce and throttle in frontend development?",
                "option_a": "Debounce delays execution until a pause in events; throttle guarantees execution at most once per fixed time interval",
                "option_b": "Throttle delays execution until events stop; debounce limits execution rate",
                "option_c": "They are exact synonyms for CSS animations",
                "option_d": "Debounce works only on network requests; throttle works only on mouse clicks",
                "correct_option": "A",
                "explanation": "Debouncing waits for silence; throttling guarantees a steady execution rate during continuous events like scroll or resize."
            },
            {
                "question_text": "What does CORS (Cross-Origin Resource Sharing) protect against?",
                "option_a": "Protects servers by telling browsers which origins are allowed to read responses from cross-origin HTTP requests",
                "option_b": "Protects against SQL injection in URL parameters",
                "option_c": "Prevents client browsers from running CSS styles",
                "option_d": "Encrypts TCP payloads on local networks",
                "correct_option": "A",
                "explanation": "CORS headers instruct the browser whether frontend code running on one domain can access resources from another origin."
            },
            {
                "question_text": "What is the CSS 'z-index' property dependent on?",
                "option_a": "The element's stacking context and positioning (relative, absolute, fixed, or sticky)",
                "option_b": "The total file size of the CSS stylesheet",
                "option_c": "Only the font-size of text",
                "option_d": "The number of child div elements",
                "correct_option": "A",
                "explanation": "z-index only takes effect on positioned elements (or flex/grid items) and is scoped within stacking contexts."
            },
            {
                "question_text": "Which HTTP header is essential for preventing Cross-Site Scripting (XSS) attacks?",
                "option_a": "Content-Security-Policy (CSP)",
                "option_b": "Access-Control-Allow-Methods",
                "option_c": "X-Powered-By",
                "option_d": "Accept-Encoding",
                "correct_option": "A",
                "explanation": "Content-Security-Policy restricts origins and types of scripts, preventing malicious code injection and XSS."
            },
            {
                "question_text": "What is the purpose of React's 'key' prop when rendering lists of elements?",
                "option_a": "To cryptographically encrypt list items",
                "option_b": "To give elements a stable identity across renders so React can identify which items changed, added, or removed",
                "option_c": "To set the primary database key in backend tables",
                "option_d": "To auto-sort array elements in alphabetical order",
                "correct_option": "B",
                "explanation": "Keys enable React's reconciliation engine to efficiently diff and reorder Virtual DOM nodes."
            },
            {
                "question_text": "What does 'Promise.allSettled()' do compared to 'Promise.all()'?",
                "option_a": "Promise.allSettled waits for all promises to either resolve or reject, while Promise.all short-circuits on the first rejection",
                "option_b": "Promise.allSettled cancels pending network requests",
                "option_c": "Promise.all settles only synchronous functions",
                "option_d": "There is no difference in modern browsers",
                "correct_option": "A",
                "explanation": "Promise.allSettled() returns the status and outcome of every promise, preventing one rejection from failing the entire batch."
            },
            {
                "question_text": "In CSS Flexbox, what is the default value of 'flex-shrink'?",
                "option_a": "0",
                "option_b": "1",
                "option_c": "auto",
                "option_d": "-1",
                "correct_option": "B",
                "explanation": "The default value of flex-shrink is 1, meaning flex items will shrink proportionally when container space is insufficient."
            },
            {
                "question_text": "What is the purpose of a Service Worker in a Progressive Web App (PWA)?",
                "option_a": "To run background scripts, intercept network requests, and enable offline caching and push notifications",
                "option_b": "To manage SQL database migrations in the browser",
                "option_c": "To compile TypeScript code to WebAssembly",
                "option_d": "To render UI widgets into the DOM canvas",
                "correct_option": "A",
                "explanation": "Service Workers act as client-side proxy servers between the web app, browser, and network."
            },
            {
                "question_text": "What is a 'Pure Component' or 'Pure Function' in frontend engineering?",
                "option_a": "A component or function that always produces the exact same output for the same inputs and produces zero side effects",
                "option_b": "A function written without third-party npm packages",
                "option_c": "A function that only accepts string arguments",
                "option_d": "A function that has no return value",
                "correct_option": "A",
                "explanation": "Purity implies deterministic output without mutations or side effects, making rendering predictable and optimizable."
            },
            {
                "question_text": "Which web metric measures the visual stability of a web page as elements load?",
                "option_a": "Cumulative Layout Shift (CLS)",
                "option_b": "First Contentful Paint (FCP)",
                "option_c": "Time to Interactive (TTI)",
                "option_d": "Interaction to Next Paint (INP)",
                "correct_option": "A",
                "explanation": "CLS measures unexpected layout shifts that happen while elements and images load on the page."
            },
            {
                "question_text": "What is the difference between 'em' and 'rem' CSS units?",
                "option_a": "'em' is relative to the parent element's font-size, while 'rem' is relative to the root (<html>) font-size",
                "option_b": "'rem' is relative to the parent, while 'em' is relative to the root",
                "option_c": "'rem' only works in media queries, 'em' works everywhere",
                "option_d": "'em' stands for exact millimeters",
                "correct_option": "A",
                "explanation": "rem (root em) always scales according to the root HTML element, avoiding compounding font-size problems found in nested em units."
            }
        ]
    },
    {
        "title": "Cloud, DevOps & Docker / Kubernetes",
        "slug": "devops-cloud",
        "category": "DevOps & Cloud",
        "time_minutes": 20,
        "passing_score": 70,
        "level": "Intermediate",
        "icon_name": "Server",
        "description": "Test skills in Docker containerization, Kubernetes pods & services, CI/CD pipelines, and cloud security.",
        "questions": [
            {
                "question_text": "What is the difference between a Docker image and a Docker container?",
                "option_a": "An image is a read-only blueprint/template; a container is a running, stateful instance of that image",
                "option_b": "An image is a running process; a container is a compiled binary",
                "option_c": "There is no difference; the terms are interchangeable",
                "option_d": "Containers cannot run Linux images",
                "correct_option": "A",
                "explanation": "Docker images are immutable templates used to spawn isolated runtime container processes."
            },
            {
                "question_text": "In Dockerfile best practices, what is the advantage of Multi-Stage Builds?",
                "option_a": "Separates the build environment from the final runtime image, resulting in dramatically smaller and more secure images",
                "option_b": "Allows running multiple containers inside one Dockerfile",
                "option_c": "Enables automatic Kubernetes autoscaling",
                "option_d": "Encrypts docker push commands",
                "correct_option": "A",
                "explanation": "Multi-stage builds leave compiler tools, caches, and test artifacts out of the final lightweight production image."
            },
            {
                "question_text": "In Kubernetes, what is a 'Pod'?",
                "option_a": "The smallest deployable computing unit in Kubernetes, encapsulating one or more tightly coupled containers",
                "option_b": "A physical server located in an AWS data center",
                "option_c": "A database schema backup file",
                "option_d": "A DNS load balancer",
                "correct_option": "A",
                "explanation": "A Pod represents a single instance of a running process in your cluster and can contain one or more containers."
            },
            {
                "question_text": "What is the purpose of a Kubernetes 'Service'?",
                "option_a": "Provides an abstraction and stable IP/DNS network endpoint to route traffic across dynamic sets of ephemeral Pods",
                "option_b": "Provides persistent disk storage to nodes",
                "option_c": "Restarts crashed worker nodes",
                "option_d": "Compiles container images into YAML",
                "correct_option": "A",
                "explanation": "Because Pods are ephemeral with dynamic IPs, Services provide stable networking and internal load balancing."
            },
            {
                "question_text": "What is the primary difference between a Kubernetes Deployment and a StatefulSet?",
                "option_a": "Deployments manage stateless pods with interchangeable identities, whereas StatefulSets maintain sticky identities and ordered storage",
                "option_b": "Deployments cannot scale horizontally",
                "option_c": "StatefulSets cannot be run on cloud providers",
                "option_d": "There is no functional difference",
                "correct_option": "A",
                "explanation": "StatefulSets are designed for stateful workloads like databases (Cassandra, Postgres) requiring stable network IDs and storage."
            },
            {
                "question_text": "In CI/CD pipelines, what is 'Continuous Delivery' vs 'Continuous Deployment'?",
                "option_a": "Continuous Delivery prepares tested artifacts ready for production with manual approval; Continuous Deployment automatically deploys every passed change to production",
                "option_b": "Continuous Delivery is automated; Continuous Deployment is purely manual",
                "option_c": "Continuous Deployment only runs unit tests",
                "option_d": "They are identical processes",
                "correct_option": "A",
                "explanation": "Continuous Deployment automates the final deployment to production without human gatekeeping."
            },
            {
                "question_text": "What does Infrastructure as Code (IaC) tool Terraform use to track real-world infrastructure resources?",
                "option_a": "Terraform State File (terraform.tfstate)",
                "option_b": "A local Redis cache",
                "option_c": "Docker daemon logs",
                "option_d": "Kubernetes ConfigMap",
                "correct_option": "A",
                "explanation": "The state file maps real-world cloud resources to your configuration and tracks resource metadata."
            },
            {
                "question_text": "What is the purpose of Kubernetes Ingress?",
                "option_a": "An API object that manages external access to services in a cluster, typically HTTP/HTTPS routing, SSL termination, and host-based routing",
                "option_b": "To backup container logs to S3",
                "option_c": "To compile container images",
                "option_d": "To grant root permissions to Pods",
                "correct_option": "A",
                "explanation": "Ingress exposes HTTP and HTTPS routes from outside the cluster to services within the cluster."
            },
            {
                "question_text": "What is the role of a Reverse Proxy (such as NGINX or Envoy) in microservices?",
                "option_a": "Terminates SSL, load balances requests across backend servers, provides caching, and masks backend topology",
                "option_b": "Writes SQL queries to disk",
                "option_c": "Manages Git repository merges",
                "option_d": "Compiles backend Python code to C",
                "correct_option": "A",
                "explanation": "Reverse proxies sit in front of web servers and forward client requests, handling security, SSL, and load balancing."
            },
            {
                "question_text": "What is the difference between Docker COPY and ADD instructions?",
                "option_a": "COPY simply copies local files; ADD can also extract local tar archives and download files from remote URLs",
                "option_b": "COPY downloads URLs, ADD only copies local files",
                "option_c": "ADD is deprecated and does not exist",
                "option_d": "COPY modifies file permissions automatically",
                "correct_option": "A",
                "explanation": "Best practice recommends using COPY for straightforward file transfers and reserving ADD for auto-extracting tar files."
            },
            {
                "question_text": "In Kubernetes, what is the role of the Kubelet?",
                "option_a": "An agent that runs on each node in the cluster, ensuring that containers described in PodSpecs are running and healthy",
                "option_b": "The master cluster database storing etcd key-values",
                "option_c": "The command line interface tool used by operators",
                "option_d": "The cloud provider billing calculator",
                "correct_option": "A",
                "explanation": "Kubelet is the node agent that communicates with the API server and manages container lifecycles on the host."
            },
            {
                "question_text": "What is 'Rolling Update' deployment strategy?",
                "option_a": "Gradually replacing old instances of Pods with new instances without taking down the entire service or causing downtime",
                "option_b": "Shutting down all servers at midnight",
                "option_c": "Deploying code only when network latency is zero",
                "option_d": "Deleting the database before updating the API",
                "correct_option": "A",
                "explanation": "Rolling updates ensure high availability by incrementally updating Pod instances with zero downtime."
            },
            {
                "question_text": "What is the function of Prometheus and Grafana in a Cloud-Native observability stack?",
                "option_a": "Prometheus scrapes and stores time-series metric data; Grafana visualizes those metrics in dashboards and alerts",
                "option_b": "Prometheus is a container runtime; Grafana is an operating system",
                "option_c": "Prometheus compiles Java code; Grafana formats CSS",
                "option_d": "They manage database relational tables",
                "correct_option": "A",
                "explanation": "Prometheus collects performance metrics via pull scraping, and Grafana renders interactive dashboards and alert triggers."
            },
            {
                "question_text": "In Kubernetes, what is a 'ConfigMap' used for?",
                "option_a": "To store non-confidential configuration data in key-value pairs separate from container image code",
                "option_b": "To store encrypted SSL private keys",
                "option_c": "To compile YAML into Helm charts",
                "option_d": "To define network IP CIDR blocks",
                "correct_option": "A",
                "explanation": "ConfigMaps decouple environment-specific configuration artifacts from container image content."
            },
            {
                "question_text": "What is the 12-Factor App methodology principle regarding 'Config'?",
                "option_a": "Store configuration in the environment (environment variables), strictly separated from codebase",
                "option_b": "Hardcode configuration constants in source files",
                "option_c": "Commit database passwords to public Git repositories",
                "option_d": "Store configuration inside binary executable headers",
                "correct_option": "A",
                "explanation": "12-Factor dictates that config varies across deploys (staging, production) and must be injected via environment variables."
            },
            {
                "question_text": "What is a 'Canary Deployment'?",
                "option_a": "Routing a small percentage of user traffic (e.g. 5%) to the new release to validate stability before full rollout",
                "option_b": "Deploying exclusively on test servers",
                "option_c": "Rolling back deployments when CPU usage reaches 100%",
                "option_d": "Running multiple databases in parallel",
                "correct_option": "A",
                "explanation": "Canary releases expose a minimal subset of live traffic to the new version to detect issues before wider rollout."
            },
            {
                "question_text": "What is the purpose of Kubernetes Horizontal Pod Autoscaler (HPA)?",
                "option_a": "Automatically adjusts the number of Pod replicas based on observed CPU/memory utilization or custom metrics",
                "option_b": "Increases the RAM of the physical host computer",
                "option_c": "Restarts failed Docker daemons",
                "option_d": "Compresses container disk images",
                "correct_option": "A",
                "explanation": "HPA scales the deployment's replica count up or down dynamically depending on real-time resource utilization."
            },
            {
                "question_text": "What does 'etcd' do in a Kubernetes cluster?",
                "option_a": "A distributed, consistent key-value store used as the primary backing store for all Kubernetes cluster data and state",
                "option_b": "The frontend web dashboard",
                "option_c": "The Docker container storage driver",
                "option_d": "The DNS lookup server for external domain names",
                "correct_option": "A",
                "explanation": "etcd holds the single source of truth for all Kubernetes objects and cluster specifications."
            },
            {
                "question_text": "What is 'Blue/Green Deployment'?",
                "option_a": "Maintaining two identical production environments; one serves live traffic while the new version is tested on the other before switching the router",
                "option_b": "Color coding test and production terminals",
                "option_c": "Deploying on blue-colored Linux distributions",
                "option_d": "Running frontend on green nodes and backend on blue nodes",
                "correct_option": "A",
                "explanation": "Blue/Green deployment eliminates downtime by swapping traffic between two identical production environments after testing."
            },
            {
                "question_text": "Which security practice is vital for running containers in production?",
                "option_a": "Running container processes as non-root users and using minimal base images (e.g., Alpine or Distroless)",
                "option_b": "Granting containers full privileged root access to host network and filesystem",
                "option_c": "Disabling firewall rules on worker nodes",
                "option_d": "Including source code repository credentials inside image layers",
                "correct_option": "A",
                "explanation": "Running as non-root with minimal base images minimizes the container attack surface and protects against host escape vulnerabilities."
            }
        ]
    }
]


class Command(BaseCommand):
    help = "Seeds comprehensive 20+ questions per assessment track in Skilloria."

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
            self.stdout.write(self.style.SUCCESS(f"Seeded 20 questions for: {assessment.title}"))
