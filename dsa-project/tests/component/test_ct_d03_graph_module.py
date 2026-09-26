from dsa.graph import Graph
from tests.recorder import suite, catch_error

EDGES = [("A", "B", 4), ("A", "C", 1), ("C", "B", 2), ("B", "D", 5), ("C", "E", 8), ("D", "E", 3)]


def sample():
    g = Graph()
    for u, v, w in EDGES:
        g.add_edge(u, v, w)
    return g


def disconnected():
    g = sample()
    g.add_edge("X", "Y", 1)
    return g


def after_remove():
    g = sample()
    before = g.dijkstra("A", "D")
    g.remove_edge("C", "B")
    return {"before": [before[0], before[1]], "after": list(g.dijkstra("A", "D"))}


def long_path_dfs():
    g = Graph()
    for i in range(1500):
        g.add_edge(i, i + 1)
    return len(g.dfs(0))


CT_D03 = suite(
    {
        "level": "component", "id": "CT-D03", "name": "Graph Processing Module",
        "uc": "UC-D05 Graph Processing", "objective": "Verify graph building, traversals and shortest path work together",
        "pre": "graph.py imported; sample graph A-B:4, A-C:1, C-B:2, B-D:5, C-E:8, D-E:3", "steps": "Build graph, run the listed algorithm",
        "meta": {
            "component": "Graph Processing Module (dsa/graph.py)",
            "units": ["add_vertex()", "add_edge()", "remove_edge()", "neighbors()", "bfs()", "dfs()", "has_path()", "dijkstra()"],
        },
    },
    [
        {"title": "BFS visits level by level", "data": "bfs('A')", "expected": ["A", "B", "C", "D", "E"], "priority": "High", "run": lambda: sample().bfs("A")},
        {"title": "DFS goes deep first", "data": "dfs('A')", "expected": ["A", "B", "C", "E", "D"], "run": lambda: sample().dfs("A")},
        {"title": "Dijkstra finds shortest weighted path", "data": "dijkstra('A','D')", "expected": [8, ["A", "C", "B", "D"]], "priority": "High",
         "run": lambda: list(sample().dijkstra("A", "D"))},
        {"title": "Unreachable vertex returns inf and empty path", "data": "add X-Y; dijkstra('A','X'); has_path('A','Y')", "expected_text": '["inf", [], false]',
         "run": lambda: [disconnected().dijkstra("A", "X")[0], disconnected().dijkstra("A", "X")[1], disconnected().has_path("A", "Y")],
         "actual_text": lambda r: f'["{r[0]}", {r[1]}, {str(r[2]).lower()}]',
         "check": lambda self, r: self.assertEqual(r, [float("inf"), [], False])},
        {"title": "Removing an edge changes the shortest path", "data": "remove_edge('C','B') then dijkstra('A','D')",
         "expected": {"before": [8, ["A", "C", "B", "D"]], "after": [9, ["A", "B", "D"]]}, "run": after_remove},
        {"title": "Negative weight is rejected", "data": "add_edge('A','Z',-2)", "expected": "throws ValueError: Negative weights are not supported",
         "run": catch_error(lambda: sample().add_edge("A", "Z", -2))},
        {"title": "DFS on a long path graph (1501 vertices)", "data": "path 0-1-2-...-1500, dfs(0)", "expected": 1501, "priority": "High", "run": long_path_dfs},
    ],
)
