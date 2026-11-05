import uuid
import time
from typing import Dict, List, Any, Optional

class DatabaseStore:
    def __init__(self):
        self.profiles: Dict[str, Dict[str, Any]] = {}
        self.organizations: Dict[str, Dict[str, Any]] = {}
        self.challenges: Dict[str, Dict[str, Any]] = {}
        self.submissions: Dict[str, Dict[str, Any]] = {}
        self.events: Dict[str, List[Dict[str, Any]]] = {}
        self.assessments: Dict[str, Dict[str, Any]] = {}
        self.proof_cards: Dict[str, Dict[str, Any]] = {}
        self.opportunities: Dict[str, Dict[str, Any]] = {}
        self.applications: Dict[str, Dict[str, Any]] = {}
        self.teams: Dict[str, Dict[str, Any]] = {}
        self.team_members: Dict[str, List[Dict[str, Any]]] = {}
        self.notifications: Dict[str, List[Dict[str, Any]]] = {}
        self.chat_history: Dict[str, List[Dict[str, Any]]] = {}

        self._seed_data()

    def _seed_data(self):
        # 1. Seed Profiles
        student_id = "prof-student-alex"
        org_user_id = "prof-org-sarah"
        admin_id = "prof-admin-core"

        self.profiles[student_id] = {
            "id": student_id,
            "full_name": "Alex Rivera",
            "email": "alex@skillmirror.ai",
            "role": "student",
            "college": "State Technical Institute",
            "education_level": "B.Tech Computer Science (3rd Year)",
            "skills": ["Python", "AsyncIO", "Concurrency", "FastAPI", "Testing"],
            "career_interests": ["Backend Engineering", "Distributed Systems"],
            "preferred_domains": ["Cloud Infrastructure", "Fintech"],
            "availability": "Immediate (20 hrs/week)",
            "github_url": "https://github.com/alexrivera-demo",
            "portfolio_url": "https://alexrivera.dev",
            "bio": "Self-taught systems enthusiast focused on asynchronous runtimes, error propagation, and edge-case testing.",
            "profile_completed_pct": 92
        }

        self.profiles[org_user_id] = {
            "id": org_user_id,
            "full_name": "Sarah Jenkins",
            "email": "sarah@opencore.io",
            "role": "organization",
            "college": "Stanford University",
            "education_level": "M.S. Software Engineering",
            "skills": ["Team Lead", "Distributed Systems"],
            "career_interests": ["Engineering Leadership"],
            "preferred_domains": ["Open Source"],
            "availability": "Full-time",
            "bio": "Staff Infrastructure Engineer at OpenCore Foundation.",
            "profile_completed_pct": 100
        }

        self.profiles[admin_id] = {
            "id": admin_id,
            "full_name": "SkillMirror AI Admin",
            "email": "admin@skillmirror.ai",
            "role": "admin",
            "college": "SkillMirror Core",
            "skills": ["Administration", "Security"],
            "profile_completed_pct": 100
        }

        # 2. Seed Organizations
        org_id = "org-opencore"
        org_id_2 = "org-statecraft"
        self.organizations[org_id] = {
            "id": org_id,
            "name": "OpenCore Foundation",
            "industry": "Developer Infrastructure",
            "description": "Building high-performance asynchronous concurrency runtimes and task queues for distributed systems.",
            "website": "https://opencore.io",
            "contact_email": "talent@opencore.io",
            "verified": True,
            "required_skills": ["Python", "AsyncIO", "Concurrency", "Unit Testing"]
        }

        self.organizations[org_id_2] = {
            "id": org_id_2,
            "name": "StateCraft AI",
            "industry": "Data & Memory Safety",
            "description": "Zero-overhead state management with immutable mutation guarantees and memory leak protection.",
            "website": "https://statecraft.ai",
            "contact_email": "careers@statecraft.ai",
            "verified": True,
            "required_skills": ["Object Immutability", "Defensive Programming", "TypeScript"]
        }

        # 3. Seed Ghost-Sprint Challenges
        c1_id = "chal-async-queue"
        self.challenges[c1_id] = {
            "id": c1_id,
            "title": "Fix Concurrency Slot Leak in AsyncQueue (Python)",
            "slug": "async-queue-concurrency-leak",
            "organization": "OpenCore Foundation (PR #412)",
            "domain": "Distributed Systems",
            "difficulty": "Intermediate",
            "language": "python",
            "estimated_minutes": 10,
            "calibrated_median_seconds": 510,
            "description": "The AsyncQueue concurrency limiter stalls when a worker task raises an exception. Worker slots are never decremented on error, starving subsequent queued tasks indefinitely. Ensure failed tasks decrement active count, trigger subsequent queued items, and propagate the error without hanging.",
            "starter_code": '''import asyncio

class AsyncQueue:
    def __init__(self, concurrency: int = 2):
        self.concurrency = concurrency
        self.running = 0
        self.queue = []

    async def push(self, task_func):
        loop = asyncio.get_running_loop()
        future = loop.create_future()
        self.queue.append((task_func, future))
        self._process()
        return await future

    def _process(self):
        if self.running >= self.concurrency or not self.queue:
            return
        task_func, future = self.queue.pop(0)
        self.running += 1

        async def _runner():
            try:
                res = await task_func()
                # BUG: In the original codebase, exceptions bypass slot decrement!
                self.running -= 1
                future.set_result(res)
                self._process()
            except Exception as e:
                # Slot is leaked and next item is not triggered!
                future.set_exception(e)

        asyncio.create_task(_runner())
''',
            "reference_solution": '''import asyncio

class AsyncQueue:
    def __init__(self, concurrency: int = 2):
        self.concurrency = concurrency
        self.running = 0
        self.queue = []

    async def push(self, task_func):
        loop = asyncio.get_running_loop()
        future = loop.create_future()
        self.queue.append((task_func, future))
        self._process()
        return await future

    def _process(self):
        if self.running >= self.concurrency or not self.queue:
            return
        task_func, future = self.queue.pop(0)
        self.running += 1

        async def _runner():
            try:
                res = await task_func()
                future.set_result(res)
            except Exception as e:
                future.set_exception(e)
            finally:
                self.running -= 1
                self._process()

        asyncio.create_task(_runner())
''',
            "public_tests": [
                {
                    "id": "pub-1",
                    "name": "Sequential tasks resolve with concurrency 2",
                    "test_code": '''
async def run_test(AsyncQueue):
    q = AsyncQueue(concurrency=2)
    res = []
    async def task_1():
        res.append(1)
        return "a"
    async def task_2():
        res.append(2)
        return "b"
    out1, out2 = await asyncio.gather(q.push(task_1), q.push(task_2))
    assert len(res) == 2, f"Expected 2 tasks, got {len(res)}"
    return True
'''
                }
            ],
            "hidden_tests": [
                {
                    "id": "hid-1",
                    "name": "Releasing worker slot upon task error and continuing subsequent tasks",
                    "test_code": '''
async def run_test(AsyncQueue):
    q = AsyncQueue(concurrency=1)
    failed = False
    async def failing_task():
        raise RuntimeError("Worker crash")
    try:
        await q.push(failing_task)
    except RuntimeError:
        failed = True
    assert failed, "Worker exception was not propagated to caller"

    # Next task MUST NOT hang!
    recovered = False
    async def recovery_task():
        return "recovered"
    try:
        res = await asyncio.wait_for(q.push(recovery_task), timeout=2.0)
        recovered = (res == "recovered")
    except asyncio.TimeoutError:
        recovered = False
    assert recovered, "Queue hung after failed task: concurrency slot was leaked"
    assert q.running == 0, f"Expected 0 active running, got {q.running}"
    return True
'''
                },
                {
                    "id": "hid-2",
                    "name": "Rapid burst rejection drain with concurrency 2",
                    "test_code": '''
async def run_test(AsyncQueue):
    q = AsyncQueue(concurrency=2)
    errors = []
    async def make_fail(i):
        raise ValueError(f"err-{i}")
    for i in range(4):
        try:
            await asyncio.wait_for(q.push(lambda i=i: make_fail(i)), timeout=1.5)
        except ValueError as e:
            errors.append(str(e))
    assert len(errors) == 4, f"Expected 4 errors caught, got {len(errors)}"
    assert q.running == 0, f"Leaked running count: {q.running}"
    return True
'''
                }
            ],
            "tags": ["AsyncIO", "Concurrency", "Error Handling"]
        }

        # 4. Seed Proof Card (Alex Rivera)
        proof_id = "proof-alex-rivera-01"
        self.proof_cards[proof_id] = {
            "id": proof_id,
            "token": "sm-card-9812-verified",
            "student_profile_id": student_id,
            "student_name": "Alex Rivera",
            "challenge_id": c1_id,
            "challenge_title": "Fix Concurrency Slot Leak in AsyncQueue (Python)",
            "repo_source": "open-core/async-flow",
            "created_at": "2026-11-05T12:00:00Z",
            "signals": {
                "problem_solving": 88,
                "debugging": 92,
                "logical_reasoning": 86,
                "edge_case_awareness": 94,
                "iteration_discipline": 86,
                "pivot_quality": 92,
                "learning_velocity": 85,
                "ai_collaboration": 89
            },
            "overall_score": 89,
            "stats": {
                "time_formatted": "06:22",
                "calibrated_median": "08:30",
                "test_runs_count": 5,
                "custom_tests_count": 2,
                "hidden_tests_passed": 2,
                "total_hidden_tests": 2,
                "learning_slope": -1.45
            },
            "thought_xray": {
                "total_duration": "06:22",
                "phases": [
                    {"name": "Read & Contextualize", "start": 0, "end": 18, "color": "#38bdf8"},
                    {"name": "Hypothesize & Diagnostic", "start": 18, "end": 38, "color": "#a855f7"},
                    {"name": "Iterative Implementation", "start": 38, "end": 64, "color": "#f59e0b"},
                    {"name": "Pivot & Refactor", "start": 64, "end": 82, "color": "#ec4899"},
                    {"name": "Edge Case Verification", "start": 82, "end": 100, "color": "#10b981"}
                ],
                "moments": [
                    {"id": "ev-101", "time": "00:15", "title": "Contextualization", "description": "Student analyzed AsyncQueue concurrency loop and identified error starvation risk."},
                    {"id": "ev-102", "time": "01:45", "title": "Diagnostic Run", "description": "Executed initial run; caught unhandled rejection hang in task future."},
                    {"id": "ev-118", "time": "03:10", "title": "AI Copilot Consultation", "description": "Queried MirrorCopilot for asyncio finally semantics; vetted the suggested snippet."},
                    {"id": "ev-129", "time": "04:15", "title": "Strategic Pivot", "description": "Reverted manual try/except attempt; migrated slot cleanup into unified finally block."},
                    {"id": "ev-142", "time": "05:30", "title": "Custom Test Probing", "description": "Authored custom boundary test with 10 rapid concurrent worker crashes."},
                    {"id": "ev-155", "time": "06:22", "title": "All Tests Green", "description": "Passed 100% of public and hidden regression test fixtures in 6m 22s."}
                ],
                "narrative": [
                    {"eventId": "ev-101", "time": "00:15", "phase": "READ", "text": "Student inspected the problem brief for AsyncQueue and loaded the baseline commit."},
                    {"eventId": "ev-102", "time": "01:45", "phase": "HYPOTHESIZE", "text": "First diagnostic run isolated the stalled concurrency slot on worker rejection."},
                    {"eventId": "ev-118", "time": "03:10", "phase": "AI_COLLABORATION", "text": "Consulted in-sandbox AI; critically adapted the code to avoid duplicate dequeuing."},
                    {"eventId": "ev-129", "time": "04:15", "phase": "PIVOT", "text": "Recognized anti-pattern; executed clean revert and structured a unified finally block."},
                    {"eventId": "ev-142", "time": "05:30", "phase": "VERIFY", "text": "Authored custom boundary assertions confirming rapid burst recovery."},
                    {"eventId": "ev-155", "time": "06:22", "phase": "RESOLVE", "text": "Achieved 100% test green status in 6m 22s, beating calibrated median (08:30)."}
                ]
            }
        }

        # 5. Seed Opportunities
        op1_id = "op-dist-fellow"
        op2_id = "op-backend-eng"
        self.opportunities[op1_id] = {
            "id": op1_id,
            "organization_id": org_id,
            "org_name": "OpenCore Foundation",
            "title": "Distributed Systems Fellow",
            "description": "Join the OpenCore core runtime team to build high-concurrency event loops, task dispatchers, and automated boundary fuzzing.",
            "opportunity_type": "Fellowship",
            "location": "Remote (Global)",
            "is_remote": True,
            "duration": "6 Months",
            "stipend": "$1,500/month",
            "required_skills": ["Python", "AsyncIO", "Concurrency", "Testing"],
            "fast_track_threshold": 82,
            "status": "open"
        }

        self.opportunities[op2_id] = {
            "id": op2_id,
            "organization_id": org_id_2,
            "org_name": "StateCraft AI",
            "title": "Backend Reliability Engineer",
            "description": "Work on zero-downtime microservices and state synchronization pipelines.",
            "opportunity_type": "Internship",
            "location": "Bangalore / Remote",
            "is_remote": True,
            "duration": "3 Months",
            "stipend": "₹45,000/month",
            "required_skills": ["Python", "FastAPI", "Testing", "PostgreSQL"],
            "fast_track_threshold": 80,
            "status": "open"
        }

        # 6. Seed Teams (Squad Synthesizer)
        team_id = "team-hack-01"
        self.teams[team_id] = {
            "id": team_id,
            "name": "Distributed Mesh Guild",
            "project_goal": "Autonomous edge service mesh with self-healing task queues for multi-region edge nodes.",
            "target_hackathon": "AI & Cloud Systems Innovation Sprint",
            "required_roles": ["Backend Systems Engineer", "UI/UX Designer", "DevOps & Fuzz Testing"],
            "creator_profile_id": student_id,
            "is_recruiting": True,
            "members": [
                {"profile_id": student_id, "name": "Alex Rivera", "role": "Backend Lead", "skills": ["Python", "AsyncIO"]}
            ]
        }

db = DatabaseStore()
