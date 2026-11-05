-- SkillMirror AI Database Schema
-- Supabase PostgreSQL with Row Level Security (RLS)

-- 1. PROFILES (Students, Organization Leads, Admins)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'organization', 'admin')),
    college TEXT,
    education_level TEXT,
    skills TEXT[] DEFAULT '{}',
    career_interests TEXT[] DEFAULT '{}',
    preferred_domains TEXT[] DEFAULT '{}',
    availability TEXT DEFAULT 'immediate',
    github_url TEXT,
    portfolio_url TEXT,
    avatar_url TEXT,
    bio TEXT,
    profile_completed_pct INT DEFAULT 75,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ORGANIZATIONS
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    industry TEXT NOT NULL,
    description TEXT,
    website TEXT,
    contact_email TEXT NOT NULL,
    logo_url TEXT,
    verified BOOLEAN DEFAULT FALSE,
    required_skills TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CHALLENGES (Ghost-Sprints)
CREATE TABLE IF NOT EXISTS challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    domain TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    language TEXT NOT NULL DEFAULT 'python',
    estimated_minutes INT DEFAULT 10,
    calibrated_median_seconds INT DEFAULT 540,
    repo_source TEXT,
    pre_fix_commit TEXT,
    starter_code TEXT NOT NULL,
    reference_solution TEXT NOT NULL,
    evaluation_criteria JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CHALLENGE TEST CASES (Public & Hidden)
CREATE TABLE IF NOT EXISTS challenge_test_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    test_code TEXT NOT NULL,
    is_hidden BOOLEAN DEFAULT FALSE,
    weight FLOAT DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CHALLENGE SUBMISSIONS
CREATE TABLE IF NOT EXISTS challenge_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    student_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    submitted_code TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('in_progress', 'passed', 'failed')),
    passed_tests_count INT DEFAULT 0,
    total_tests_count INT DEFAULT 0,
    execution_duration_ms INT DEFAULT 0,
    time_to_green_seconds INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CHALLENGE EVENTS (Telemetry Log for Thought-X-Ray)
CREATE TABLE IF NOT EXISTS challenge_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES challenge_submissions(id) ON DELETE CASCADE,
    event_id TEXT NOT NULL,
    timestamp BIGINT NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SKILL ASSESSMENTS (Deterministic Output)
CREATE TABLE IF NOT EXISTS skill_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES challenge_submissions(id) ON DELETE CASCADE,
    student_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    debugging_speed INT NOT NULL CHECK (debugging_speed BETWEEN 0 AND 100),
    edge_case_awareness INT NOT NULL CHECK (edge_case_awareness BETWEEN 0 AND 100),
    iteration_discipline INT NOT NULL CHECK (iteration_discipline BETWEEN 0 AND 100),
    pivot_quality INT NOT NULL CHECK (pivot_quality BETWEEN 0 AND 100),
    learning_velocity INT NOT NULL CHECK (learning_velocity BETWEEN 0 AND 100),
    ai_collaboration INT NOT NULL CHECK (ai_collaboration BETWEEN 0 AND 100),
    overall_score INT NOT NULL,
    summary_evidence JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PROOF CARDS (Portable, Verifiable Credentials)
CREATE TABLE IF NOT EXISTS proof_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT UNIQUE NOT NULL,
    student_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    assessment_id UUID REFERENCES skill_assessments(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES challenge_submissions(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT TRUE,
    qr_code_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. OPPORTUNITIES (Jobs, Internships, Fellowships, Bounties)
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    opportunity_type TEXT NOT NULL CHECK (opportunity_type IN ('Internship', 'Full-time', 'Fellowship', 'Project Bounty')),
    location TEXT NOT NULL,
    is_remote BOOLEAN DEFAULT TRUE,
    duration TEXT,
    stipend TEXT,
    required_skills TEXT[] DEFAULT '{}',
    target_skill_vector JSONB DEFAULT '{}',
    fast_track_threshold INT DEFAULT 80,
    deadline TIMESTAMPTZ,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'paused')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. OPPORTUNITY MATCHES
CREATE TABLE IF NOT EXISTS opportunity_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    student_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    match_percentage INT NOT NULL CHECK (match_percentage BETWEEN 0 AND 100),
    fast_track_unlocked BOOLEAN DEFAULT FALSE,
    why_matched TEXT NOT NULL,
    missing_skills TEXT[] DEFAULT '{}',
    action_items TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. APPLICATIONS
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    student_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    proof_card_id UUID REFERENCES proof_cards(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'fast_track_screen', 'accepted', 'rejected')),
    recruiter_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. TEAMS (Squad Synthesizer)
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    project_goal TEXT NOT NULL,
    target_hackathon TEXT,
    required_roles TEXT[] DEFAULT '{}',
    is_recruiting BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. TEAM MEMBERS
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role_in_team TEXT NOT NULL,
    synergy_score INT DEFAULT 90,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, profile_id)
);

-- 14. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. AI CHAT HISTORY
CREATE TABLE IF NOT EXISTS ai_chat_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant')),
    message TEXT NOT NULL,
    suggested_actions JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Enablement
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE proof_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_history ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public challenges are viewable by everyone" ON challenges FOR SELECT USING (is_active = true);
CREATE POLICY "Public proof cards are viewable by everyone" ON proof_cards FOR SELECT USING (is_public = true);
CREATE POLICY "Public opportunities are viewable by everyone" ON opportunities FOR SELECT USING (status = 'open');
CREATE POLICY "Public teams are viewable by everyone" ON teams FOR SELECT USING (is_recruiting = true);
