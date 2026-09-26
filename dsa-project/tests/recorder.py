"""
Table-driven unittest helper. Each case becomes a real unittest test method; its
metadata, actual result and status are also written to test-results/<group>.json
so the lab report tables are generated from the real execution.
"""
import atexit
import datetime
import json
import math
import os
import sys
import unittest

RESULTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "test-results")
TEST_DATE = datetime.date.today().isoformat()
_groups = {}


def fmt(v):
    if isinstance(v, float) and math.isinf(v):
        return "inf"
    if isinstance(v, str):
        return json.dumps(v)
    try:
        return json.dumps(v, default=lambda o: list(o) if isinstance(o, (set, tuple)) else repr(o))
    except (TypeError, ValueError):
        return repr(v)


def catch_error(fn):
    """Wrap fn so an exception becomes the value 'throws <Type>: <message>'."""

    def run():
        try:
            return {"no_error": True, "value": fn()}
        except Exception as e:  # noqa: BLE001 - we want to record any exception
            return f"throws {type(e).__name__}: {e}"

    return run


def suite(group, cases):
    """group: dict(level, id, name, uc, objective, pre, steps, meta, set_up)
    cases: list of dict(title, run, expected | check+expected_text, data, actual_text, priority, pre)"""
    info = {"level": group["level"], "id": group["id"], "name": group["name"], **group.get("meta", {})}
    _groups[group["id"]] = {"project": "dsa", "group": info, "testDate": TEST_DATE, "cases": []}
    records = _groups[group["id"]]["cases"]

    def make_test(i, c):
        tc_id = f"{group['id']}-{i + 1:02d}"

        def test(self):
            rec = {
                "id": tc_id,
                "uc": c.get("uc", group["uc"]),
                "title": c["title"],
                "objective": c.get("objective", group["objective"]),
                "pre": c.get("pre", group.get("pre", "None")),
                "steps": c.get("steps", group["steps"]),
                "data": c.get("data", ""),
                "expected": c.get("expected_text", fmt(c.get("expected"))),
                "actual": "",
                "status": "Fail",
                "priority": c.get("priority", "Medium"),
            }
            records.append(rec)
            try:
                actual = c["run"]()
            except Exception as e:
                rec["actual"] = f"Threw error: {type(e).__name__}: {str(e).splitlines()[0] if str(e) else ''}"
                raise
            rec["actual"] = c["actual_text"](actual) if "actual_text" in c else fmt(actual)
            if "check" in c:
                c["check"](self, actual)
            else:
                self.assertEqual(actual, c["expected"])
            rec["status"] = "Pass"

        test.__doc__ = f"{tc_id}: {c['title']}"
        return test

    attrs = {f"test_{i + 1:02d}": make_test(i, c) for i, c in enumerate(cases)}
    if "set_up" in group:
        attrs["setUp"] = lambda self: group["set_up"]()
    attrs["__module__"] = sys._getframe(1).f_globals["__name__"]  # show the real test module in runner output
    return type(group["id"].replace("-", "_"), (unittest.TestCase,), attrs)


@atexit.register
def _write_results():
    if not _groups:
        return
    os.makedirs(RESULTS_DIR, exist_ok=True)
    for gid, data in _groups.items():
        if data["cases"]:
            with open(os.path.join(RESULTS_DIR, f"{gid}.json"), "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
