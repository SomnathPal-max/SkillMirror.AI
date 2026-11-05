-- SkillMirror AI Demo Seed Data

-- Insert Demo Profiles
INSERT INTO profiles (id, full_name, email, role, college, education_level, skills, career_interests, preferred_domains, profile_completed_pct, bio)
VALUES
('00000000-0000-0000-0000-000000000001', 'Alex Rivera', 'alex@skillmirror.ai', 'student', 'State Technical Institute', 'B.Tech Computer Science (3rd Year)', ARRAY['Python', 'FastAPI', 'Concurrency', 'PostgreSQL', 'Docker'], ARRAY['Backend Engineering', 'Distributed Systems'], ARRAY['Cloud Infrastructure', 'Fintech'], 92, 'Self-taught systems enthusiast focused on asynchronous runtimes and edge-case testing.'),
('00000000-0000-0000-0000-000000000002', 'Sarah Jenkins', 'sarah@opencore.io', 'organization', 'Stanford University', 'M.S. Software Engineering', ARRAY['Team Lead', 'Distributed Systems'], ARRAY['Engineering Management'], ARRAY['Open Source'], 100, 'Staff Infrastructure Engineer and OSS Maintainer at OpenCore.'),
('00000000-0000-0000-0000-000000000003', 'Admin Supervisor', 'admin@skillmirror.ai', 'admin', 'SkillMirror AI Core', 'Platform Administrator', ARRAY['Administration', 'Security'], ARRAY['Platform Integrity'], ARRAY['Talent Systems'], 100, 'SkillMirror AI Lead Auditor & Community Moderator.')
ON CONFLICT (id) DO NOTHING;

-- Insert Organizations
INSERT INTO organizations (id, owner_profile_id, name, industry, description, website, contact_email, verified, required_skills)
VALUES
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'OpenCore Foundation', 'Developer Infrastructure', 'Maintaining high-throughput asynchronous runtimes and distributed task queues.', 'https://opencore.io', 'talent@opencore.io', TRUE, ARRAY['Python', 'AsyncIO', 'Unit Testing']),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'StateCraft AI', 'Data & Memory Reliability', 'Building zero-copy data streaming and memory mutation safeguards for modern web scale.', 'https://statecraft.ai', 'careers@statecraft.ai', TRUE, ARRAY['Object Immutability', 'Security', 'Performance'])
ON CONFLICT (id) DO NOTHING;

-- Insert Challenges (Ghost-Sprints)
INSERT INTO challenges (id, organization_id, title, slug, description, domain, difficulty, language, estimated_minutes, calibrated_median_seconds, repo_source, starter_code, reference_solution, tags)
VALUES
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
'Fix Concurrency Slot Leak in AsyncQueue (Python)',
'async-queue-concurrency-leak',
'The AsyncQueue limiter stalls when an asynchronous worker task raises an exception. Worker slots are never decremented on error, starving subsequent queued tasks indefinitely. Your goal is to ensure failed tasks decrement the active concurrency count, trigger subsequent queued items, and propagate the error without hanging.',
'Distributed Systems', 'Intermediate', 'python', 10, 510, 'open-core/async-flow (PR #412)',
'import asyncio

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
                # Missing proper self.running decrement and next item trigger!
                future.set_exception(e)

        asyncio.create_task(_runner())
',
'import asyncio

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
',
ARRAY['AsyncIO', 'Concurrency', 'Error Handling'])
ON CONFLICT (id) DO NOTHING;

-- Insert Opportunities
INSERT INTO opportunities (id, organization_id, title, description, opportunity_type, location, is_remote, duration, stipend, required_skills, fast_track_threshold)
VALUES
('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
'Distributed Systems Fellow',
'Join the OpenCore core runtime team to build high-concurrency event loops and automated boundary fuzzing.',
'Fellowship', 'Remote (Global)', TRUE, '6 Months', '$1,500/month stipend', ARRAY['Python', 'AsyncIO', 'Testing'], 82),
('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002',
'Backend Reliability Engineer',
'Work on zero-downtime microservices and state synchronization pipelines.',
'Internship', 'Bangalore / Remote', TRUE, '3 Months', '₹45,000/month', ARRAY['Python', 'FastAPI', 'PostgreSQL'], 80)
ON CONFLICT (id) DO NOTHING;
