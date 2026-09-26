import os
import subprocess
import sys

from tests.recorder import suite

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def cli(keys):
    """Run main.py with the given keystrokes (one per line) and return its stdout."""
    p = subprocess.run([sys.executable, "main.py"], input="\n".join(keys) + "\n", capture_output=True, text=True, cwd=ROOT, timeout=30)
    return p.stdout + p.stderr


def lines_with(out, *words):
    return [l.strip() for l in out.splitlines() if any(w in l for w in words)]


IT_D03 = suite(
    {
        "level": "integration", "id": "IT-D03", "name": "CLI Menu (main.py) <-> Input <-> Processing <-> Visualization",
        "uc": "UC-D01..UC-D05", "objective": "Verify the complete program: user keystrokes flow through every module and the right output is printed",
        "pre": "Python 3 installed; run from project root", "steps": "1. Start `python main.py`  2. Send keystrokes from Test Data  3. Check printed output",
        "meta": {
            "modules": "main.py (menu)  ->  input_module.py  ->  processing.py  ->  linked_list / bst / stack_queue / sorting / graph  ->  visualizer.py",
            "strategy": "Top-Down Integration: the top-level menu (main.py) is tested end-to-end through all lower modules using real keyboard input (stdin).",
            "dataPassed": "stdin keystrokes -> menu choice + raw text -> parsed values -> data structures/algorithms -> rendered text on stdout",
        },
    },
    [
        {"title": "Sorting menu: quick sort + binary search", "data": "4 / 9 3 7 1 / quick / 7 / 0", "priority": "High",
         "expected_text": 'output contains "After (quick sort)" and "Binary search: found at index 2"',
         "run": lambda: cli(["4", "9 3 7 1", "quick", "7", "0"]),
         "actual_text": lambda o: " | ".join(lines_with(o, "After (", "Binary search")),
         "check": lambda self, o: (self.assertIn("After (quick sort)", o), self.assertIn("found at index 2", o))},
        {"title": "Graph menu: BFS, DFS and Dijkstra", "data": "5 / A-B:4, A-C:1, C-B:2, B-D:5 / A / D / 0", "priority": "High",
         "expected_text": "BFS: ['A', 'B', 'C', 'D'] and Dijkstra: A -> C -> B -> D  (total distance: 8)",
         "run": lambda: cli(["5", "A-B:4, A-C:1, C-B:2, B-D:5", "A", "D", "0"]),
         "actual_text": lambda o: " | ".join(l.split(": ", 1)[-1] if "Start vertex" in l or "Destination" in l else l for l in lines_with(o, "BFS:", "Dijkstra:")),
         "check": lambda self, o: (self.assertIn("BFS: ['A', 'B', 'C', 'D']", o), self.assertIn("A -> C -> B -> D  (total distance: 8)", o))},
        {"title": "Linked list menu: insert, delete, search", "data": "1 / 5 3 8 / i / 10 / d / 3 / s / 10 / b / 0",
         "expected_text": 'shows "HEAD -> 5 -> 8 -> 10 -> None" and "Found at index 2"',
         "run": lambda: cli(["1", "5 3 8", "i", "10", "d", "3", "s", "10", "b", "0"]),
         "actual_text": lambda o: " | ".join(dict.fromkeys(l.split(": ")[-1] for l in lines_with(o, "5 -> 8 -> 10 -> None", "Found at index"))),
         "check": lambda self, o: (self.assertIn("HEAD -> 5 -> 8 -> 10 -> None", o), self.assertIn("Found at index 2", o))},
        {"title": "BST menu: delete node and show traversals", "data": "2 / 50 30 70 20 / d / 30 / t / b / 0",
         "expected_text": "Inorder:   [20, 50, 70] after deleting 30",
         "run": lambda: cli(["2", "50 30 70 20", "d", "30", "t", "b", "0"]),
         "actual_text": lambda o: " | ".join(lines_with(o, "Inorder:", "Height:")),
         "check": lambda self, o: self.assertIn("Inorder:   [20, 50, 70]", o)},
        {"title": "Invalid numeric input shows error, program keeps running", "data": "4 / 5, abc / 0", "priority": "High",
         "expected_text": "Error: Invalid number: 'abc' then Goodbye! (no crash)",
         "run": lambda: cli(["4", "5, abc", "0"]),
         "actual_text": lambda o: " | ".join(l.split(": ", 1)[-1] if "Enter numbers" in l else l for l in lines_with(o, "Error", "Goodbye", "Traceback")),
         "check": lambda self, o: (self.assertIn("Error: Invalid number: 'abc'", o), self.assertIn("Goodbye!", o), self.assertNotIn("Traceback", o))},
        {"title": "Invalid menu choice is handled", "data": "9 / 0", "expected_text": 'prints "Invalid choice" then exits normally', "priority": "Low",
         "run": lambda: cli(["9", "0"]),
         "actual_text": lambda o: " | ".join(l.split(": ", 1)[-1] for l in lines_with(o, "Invalid choice", "Goodbye")),
         "check": lambda self, o: (self.assertIn("Invalid choice", o), self.assertIn("Goodbye!", o))},
    ],
)
