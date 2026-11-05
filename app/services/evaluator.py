import asyncio
import sys
import time
import traceback
import io
from typing import Dict, List, Any

async def run_python_tests(code: str, test_cases: List[Dict[str, Any]], timeout_sec: float = 3.0) -> Dict[str, Any]:
    start_time = time.time()
    results = {
        "passed": True,
        "total_tests": len(test_cases),
        "passed_count": 0,
        "failed_count": 0,
        "tests": [],
        "stdout": "",
        "stderr": "",
        "duration_ms": 0
    }

    # Redirect stdout
    captured_stdout = io.StringIO()
    old_stdout = sys.stdout
    sys.stdout = captured_stdout

    # Local namespace
    user_namespace = {}
    try:
        # Execute user code
        exec(code, user_namespace)
    except Exception as e:
        sys.stdout = old_stdout
        results["passed"] = False
        results["stderr"] = f"Syntax / Execution Error: {str(e)}\n{traceback.format_exc()}"
        results["duration_ms"] = int((time.time() - start_time) * 1000)
        return results

    sys.stdout = old_stdout

    # Now execute test cases
    for tc in test_cases:
        tc_name = tc.get("name", "Unnamed Test")
        tc_code = tc.get("test_code", "")
        is_hidden = tc.get("is_hidden", False)

        test_item = {
            "id": tc.get("id", str(len(results["tests"]) + 1)),
            "name": tc_name,
            "is_hidden": is_hidden,
            "passed": False,
            "duration_ms": 0,
            "error": None
        }

        test_start = time.time()
        test_namespace = {**user_namespace}

        try:
            # Execute test case definition
            exec(tc_code, test_namespace)
            run_fn = test_namespace.get("run_test")
            
            if asyncio.iscoroutinefunction(run_fn):
                # Run with timeout
                target_class = test_namespace.get("AsyncQueue") or test_namespace.get("TokenBucket") or test_namespace
                await asyncio.wait_for(run_fn(target_class), timeout=timeout_sec)
            elif callable(run_fn):
                run_fn()
            
            test_item["passed"] = True
            test_item["duration_ms"] = int((time.time() - test_start) * 1000)
            results["passed_count"] += 1
        except asyncio.TimeoutError:
            test_item["passed"] = False
            test_item["error"] = "Test execution timed out (potential deadlock / infinite loop)"
            test_item["duration_ms"] = int((time.time() - test_start) * 1000)
            results["failed_count"] += 1
            results["passed"] = False
        except Exception as err:
            test_item["passed"] = False
            test_item["error"] = str(err)
            test_item["duration_ms"] = int((time.time() - test_start) * 1000)
            results["failed_count"] += 1
            results["passed"] = False

        results["tests"].append(test_item)

    results["stdout"] = captured_stdout.getvalue()
    results["duration_ms"] = int((time.time() - start_time) * 1000)
    return results
