from dsa.input_module import parse_numbers, parse_edges
from dsa.processing import build_bst, build_graph, build_linked_list, sort_and_search
from tests.recorder import suite, catch_error


def graph_summary(text):
    g = build_graph(parse_edges(text))
    return {"vertices": sorted(g.vertices()), "edges": g.edge_count(), "weight_A_B": g.adj["A"]["B"]}


IT_D01 = suite(
    {
        "level": "integration", "id": "IT-D01", "name": "Data Input Module <-> Processing Module",
        "uc": "UC-D01..UC-D05", "objective": "Verify raw text input is parsed and correctly handed to the data-structure builders",
        "pre": "input_module.py and processing.py imported", "steps": "1. Parse raw text  2. Pass parsed data to processing function  3. Check built structure",
        "meta": {
            "modules": "input_module.py (parse_numbers, parse_edges)  ->  processing.py (build_linked_list, build_bst, build_graph, sort_and_search)  ->  linked_list / bst / graph / sorting",
            "strategy": "Bottom-Up Integration: the data-structure modules (already unit/component tested) are driven by processing.py, and then by the input parser on top.",
            "dataPassed": 'Raw string "50, 30, 70" -> list[int] [50,30,70] -> BST/LinkedList;  "A-B:4, ..." -> list[(u, v, w)] -> Graph adjacency dict',
        },
    },
    [
        {"title": "Comma/space separated numbers build a BST", "data": '"50, 30 70,20"', "expected": [20, 30, 50, 70], "priority": "High",
         "run": lambda: build_bst(parse_numbers("50, 30 70,20")).inorder()},
        {"title": "Parsed numbers build a linked list in order", "data": '"3 1 2"', "expected": [3, 1, 2], "run": lambda: build_linked_list(parse_numbers("3 1 2")).to_list()},
        {"title": "Invalid token is rejected before processing", "data": '"5, x, 3"', "expected": "throws ValueError: Invalid number: 'x'", "priority": "High",
         "run": catch_error(lambda: build_bst(parse_numbers("5, x, 3")))},
        {"title": "Edge list input builds weighted graph", "data": '"A-B:4, A-C:1, C-D"', "expected": {"vertices": ["A", "B", "C", "D"], "edges": 3, "weight_A_B": 4},
         "run": lambda: graph_summary("A-B:4, A-C:1, C-D")},
        {"title": "Sort + binary search pipeline", "data": '"9 3 7 1", target 7, quick sort', "expected": [[1, 3, 7, 9], 2], "priority": "High",
         "run": lambda: list(sort_and_search(parse_numbers("9 3 7 1"), 7, "quick"))},
        {"title": "Negative edge weight is stopped by graph module", "data": '"A-B:-3"', "expected": "throws ValueError: Negative weights are not supported",
         "run": catch_error(lambda: build_graph(parse_edges("A-B:-3")))},
        {"title": "Malformed edge with extra vertex is rejected", "data": '"A-B-C:2"', "expected": "throws ValueError: Invalid edge: 'A-B-C'", "priority": "Medium",
         "run": catch_error(lambda: graph_summary("A-B-C:2, A-B:1"))},
    ],
)
