import unittest
import asyncio
from app.services.evaluator import run_python_tests
from app.services.scoring_engine import compute_deterministic_scores
from app.services.thought_xray import generate_thought_xray
from app.services.matcher import match_student_with_opportunities, match_complementary_teammates
from app.core.database import db

class TestSkillMirrorEngine(unittest.TestCase):

    def test_evaluator_starter_fails_and_solution_passes(self):
        challenge = db.challenges["chal-async-queue"]
        starter_code = challenge["starter_code"]
        reference_solution = challenge["reference_solution"]
        test_cases = challenge["public_tests"] + challenge["hidden_tests"]

        # Run starter code: should fail the hidden recovery test
        loop = asyncio.new_event_loop()
        starter_results = loop.run_until_complete(run_python_tests(starter_code, test_cases))
        self.assertFalse(starter_results["passed"], "Starter code should fail hidden test")

        # Run reference solution: should pass all tests
        solution_results = loop.run_until_complete(run_python_tests(reference_solution, test_cases))
        loop.close()
        self.assertTrue(solution_results["passed"], f"Reference solution should pass: {solution_results}")
        self.assertEqual(solution_results["passed_count"], len(test_cases))

    def test_deterministic_scoring(self):
        mock_events = [
            {"id": "ev-1", "timestamp": 1000, "type": "sandbox_init"},
            {"id": "ev-2", "timestamp": 60000, "type": "code_edit"},
            {"id": "ev-3", "timestamp": 120000, "type": "test_run", "payload": {"passed": False}},
            {"id": "ev-4", "timestamp": 240000, "type": "revert_to_checkpoint"},
            {"id": "ev-5", "timestamp": 320000, "type": "custom_test_added"},
            {"id": "ev-6", "timestamp": 382000, "type": "test_run", "payload": {"passed": True}}
        ]
        test_results = {
            "passed": True,
            "total_tests": 3,
            "passed_count": 3,
            "tests": [{"is_hidden": True, "passed": True}, {"is_hidden": True, "passed": True}]
        }

        scores = compute_deterministic_scores(mock_events, test_results, calibrated_median_sec=510)
        self.assertGreaterEqual(scores["debugging"], 80)
        self.assertGreaterEqual(scores["edge_case_awareness"], 85)
        self.assertGreaterEqual(scores["pivot_quality"], 80)
        self.assertGreaterEqual(scores["overall_score"], 80)

    def test_thought_xray_citations(self):
        mock_events = [
            {"id": "ev-101", "timestamp": 1000, "type": "sandbox_init"},
            {"id": "ev-102", "timestamp": 60000, "type": "test_run", "payload": {"passed": False}},
            {"id": "ev-103", "timestamp": 180000, "type": "revert_to_checkpoint"},
            {"id": "ev-104", "timestamp": 300000, "type": "test_run", "payload": {"passed": True}}
        ]
        tx = generate_thought_xray(mock_events, "AsyncQueue")
        self.assertEqual(len(tx["phases"]), 5)
        self.assertGreaterEqual(len(tx["narrative"]), 3)
        for n in tx["narrative"]:
            self.assertTrue(n["eventId"].startswith("ev-"))

    def test_explainable_matching(self):
        student = db.profiles["prof-student-alex"]
        proof = list(db.proof_cards.values())[0]
        opps = list(db.opportunities.values())

        matches = match_student_with_opportunities(student, proof, opps)
        self.assertGreater(len(matches), 0)
        for m in matches:
            self.assertIn("why_matched", m)
            self.assertIn("match_percentage", m)
            self.assertGreater(m["match_percentage"], 50)

if __name__ == "__main__":
    unittest.main()
