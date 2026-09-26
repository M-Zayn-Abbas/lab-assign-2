from dsa.processing import build_bst, build_graph, build_linked_list, sort_values
from dsa import visualizer as viz
from tests.recorder import suite

EDGES = [("A", "B", 4), ("A", "C", 1), ("C", "B", 2), ("B", "D", 5)]

IT_D02 = suite(
    {
        "level": "integration", "id": "IT-D02", "name": "Algorithm Module <-> Output Visualization",
        "uc": "UC-D01..UC-D05", "objective": "Verify algorithm/data-structure outputs are rendered correctly by the visualizer",
        "pre": "processing.py and visualizer.py imported", "steps": "1. Run algorithm on Test Data  2. Pass result to visualizer  3. Compare rendered text",
        "meta": {
            "modules": "linked_list / bst / graph / sorting (via processing.py)  ->  visualizer.py (render_linked_list, render_tree, render_graph, render_path, render_bars)",
            "strategy": "Incremental Integration: each algorithm module was connected to its renderer one at a time (list, tree, graph, path, bars) and re-tested after each addition.",
            "dataPassed": "LinkedList / BST / Graph objects, (distance, path) tuples and sorted lists  ->  multi-line text strings",
        },
    },
    [
        {"title": "Linked list rendered with arrows", "data": "[1,2,3]", "expected": "HEAD -> 1 -> 2 -> 3 -> None", "priority": "High",
         "run": lambda: viz.render_linked_list(build_linked_list([1, 2, 3]))},
        {"title": "BST rendered sideways", "data": "[50,30,70]", "expected": "    70\n50\n    30", "run": lambda: viz.render_tree(build_bst([50, 30, 70]))},
        {"title": "Graph rendered as adjacency list", "data": "A-B:4, A-C:1, C-B:2, B-D:5", "priority": "High",
         "expected": "A: B(4), C(1)\nB: A(4), C(2), D(5)\nC: A(1), B(2)\nD: B(5)", "run": lambda: viz.render_graph(build_graph(EDGES))},
        {"title": "Dijkstra result rendered as path", "data": "dijkstra('A','D') on graph above", "expected": "A -> C -> B -> D  (total distance: 8)", "priority": "High",
         "run": lambda: viz.render_path(*build_graph(EDGES).dijkstra("A", "D"))},
        {"title": "Sorted array rendered as bar chart", "data": "merge sort [3,1,2]", "expected": "    1 | #\n    2 | ##\n    3 | ###",
         "run": lambda: viz.render_bars(sort_values([3, 1, 2], "merge"))},
        {"title": "Empty structures show placeholder text", "data": "empty list, empty tree, empty graph", "expected": ["HEAD -> None", "(empty tree)", "(empty graph)"], "priority": "Low",
         "run": lambda: [viz.render_linked_list(build_linked_list([])), viz.render_tree(build_bst([])), viz.render_graph(build_graph([]))]},
        {"title": "Large values fit the terminal width (<= 80 cols)", "data": "render_bars([5, 1000])", "expected_text": "every line <= 80 characters (bars scaled)",
         "run": lambda: max(len(line) for line in viz.render_bars([5, 1000]).splitlines()),
         "actual_text": lambda n: f"longest line = {n} characters",
         "check": lambda self, n: self.assertLessEqual(n, 80)},
    ],
)
