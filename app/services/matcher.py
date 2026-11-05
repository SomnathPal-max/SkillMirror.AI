from typing import Dict, List, Any

def match_student_with_opportunities(
    student_profile: Dict[str, Any],
    proof_card: Dict[str, Any],
    all_opportunities: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    signals = proof_card.get("signals", {}) if proof_card else {}
    student_skills = set(student_profile.get("skills", []))
    overall_score = proof_card.get("overall_score", 85) if proof_card else 80

    matches = []
    for opp in all_opportunities:
        req_skills = set(opp.get("required_skills", []))
        common = student_skills.intersection(req_skills)
        missing = list(req_skills - student_skills)

        # Base skill match ratio (40%) + Proof Card score ratio (60%)
        skill_ratio = (len(common) / max(1, len(req_skills)))
        score_ratio = (overall_score / 100)
        match_pct = min(98, max(50, round((skill_ratio * 0.4 + score_ratio * 0.6) * 100)))

        is_fast_track = overall_score >= opp.get("fast_track_threshold", 80)

        # Transparent explanation
        if signals.get("debugging", 0) >= 85:
            reason = f"Matched because your Proof Card demonstrates exceptional Debugging ({signals.get('debugging')}/100) and edge-case resilience on {proof_card.get('challenge_title', 'concurrency tasks')}."
        elif len(common) > 0:
            reason = f"Matched because your verified skillset directly covers core requirements: {', '.join(common)}."
        else:
            reason = f"Matched because your demonstrated analytical iteration discipline aligns with {opp.get('title')} standards."

        action_items = []
        if missing:
            action_items.append(f"Complete a trial involving: {missing[0]}")
        else:
            action_items.append("Submit your verified Proof Card directly to fast-track screen.")

        matches.append({
            "opportunity_id": opp["id"],
            "title": opp["title"],
            "org_name": opp.get("org_name", "OpenCore Foundation"),
            "opportunity_type": opp["opportunity_type"],
            "location": opp["location"],
            "is_remote": opp.get("is_remote", True),
            "stipend": opp.get("stipend", "Competitive"),
            "duration": opp.get("duration", "3-6 Months"),
            "match_percentage": match_pct,
            "fast_track_unlocked": is_fast_track,
            "why_matched": reason,
            "missing_skills": missing,
            "action_items": action_items
        })

    return sorted(matches, key=lambda x: x["match_percentage"], reverse=True)


def match_complementary_teammates(
    student_profile: Dict[str, Any],
    proof_card: Dict[str, Any],
    all_profiles: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    my_skills = set(student_profile.get("skills", []))
    my_id = student_profile.get("id")

    candidates = [p for p in all_profiles if p.get("id") != my_id and p.get("role") == "student"]
    
    # Pre-seeded complementary peers if candidates list is small
    if not candidates:
        candidates = [
            {
                "id": "prof-peer-maya",
                "full_name": "Maya Chen",
                "college": "Regional Engineering College",
                "skills": ["UI/UX Architecture", "React", "Design Systems", "Figma"],
                "role_type": "Frontend & Design Specialist",
                "complementary_reason": "Complements your backend concurrency intuition with deep design systems and high iteration discipline."
            },
            {
                "id": "prof-peer-liam",
                "full_name": "Liam O'Connor",
                "college": "Community Tech College",
                "skills": ["Fuzz Testing", "DevOps", "Docker", "Security"],
                "role_type": "Fuzzing & Reliability Engineer",
                "complementary_reason": "Top 2% edge-case probing instincts, balancing high-speed execution with exhaustive stress testing."
            },
            {
                "id": "prof-peer-zainab",
                "full_name": "Zainab Al-Mansoor",
                "college": "State Polytechnic",
                "skills": ["Data Pipelines", "PostgreSQL", "Kafka", "Data Modeling"],
                "role_type": "Data Pipeline Architect",
                "complementary_reason": "Demonstrates exceptional pivot quality (95 score); recovers gracefully from complex architectural dead-ends."
            }
        ]

    teammates = []
    for cand in candidates:
        cand_skills = set(cand.get("skills", []))
        diff = list(cand_skills - my_skills)
        synergy = min(99, 85 + len(diff) * 3)

        teammates.append({
            "id": cand["id"],
            "name": cand.get("full_name", "Teammate Candidate"),
            "college": cand.get("college", "Engineering College"),
            "role_type": cand.get("role_type", "Systems Engineer"),
            "skills": cand.get("skills", []),
            "synergy_score": synergy,
            "complementary_reason": cand.get("complementary_reason") or f"Brings complementary expertise in {', '.join(diff[:2]) if diff else 'system testing'}."
        })

    return sorted(teammates, key=lambda x: x["synergy_score"], reverse=True)
