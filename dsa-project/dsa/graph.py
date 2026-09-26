"""Weighted undirected Graph module (adjacency list)."""
import heapq
from collections import deque


class Graph:
    def __init__(self, directed=False):
        self.adj = {}
        self.directed = directed

    def add_vertex(self, v):
        if v not in self.adj:
            self.adj[v] = {}

    def add_edge(self, u, v, weight=1):
        if weight < 0:
            raise ValueError("Negative weights are not supported")
        self.add_vertex(u)
        self.add_vertex(v)
        self.adj[u][v] = weight
        if not self.directed:
            self.adj[v][u] = weight

    def remove_edge(self, u, v):
        if u not in self.adj or v not in self.adj[u]:
            return False
        del self.adj[u][v]
        if not self.directed:
            self.adj[v].pop(u, None)
        return True

    def vertices(self):
        return list(self.adj.keys())

    def neighbors(self, v):
        if v not in self.adj:
            raise KeyError(f"Vertex {v} not found")
        return sorted(self.adj[v].keys())

    def edge_count(self):
        total = sum(len(n) for n in self.adj.values())
        return total if self.directed else total // 2

    # ---------- Traversals ----------
    def bfs(self, start):
        if start not in self.adj:
            raise KeyError(f"Vertex {start} not found")
        visited, order, q = {start}, [], deque([start])
        while q:
            v = q.popleft()
            order.append(v)
            for n in self.neighbors(v):
                if n not in visited:
                    visited.add(n)
                    q.append(n)
        return order

    def dfs(self, start):
        if start not in self.adj:
            raise KeyError(f"Vertex {start} not found")
        visited, order = set(), []

        def visit(v):
            visited.add(v)
            order.append(v)
            for n in self.neighbors(v):
                if n not in visited:
                    visit(n)

        visit(start)
        return order

    def has_path(self, u, v):
        if u not in self.adj or v not in self.adj:
            return False
        return v in self.bfs(u)

    # ---------- Shortest path ----------
    def dijkstra(self, start, end):
        """Returns (distance, path). distance = inf and path = [] if unreachable."""
        if start not in self.adj or end not in self.adj:
            raise KeyError("Vertex not found")
        dist = {v: float("inf") for v in self.adj}
        prev = {}
        dist[start] = 0
        pq = [(0, start)]
        while pq:
            d, v = heapq.heappop(pq)
            if d > dist[v]:
                continue
            if v == end:
                break
            for n, w in self.adj[v].items():
                nd = d + w
                if nd < dist[n]:
                    dist[n] = nd
                    prev[n] = v
                    heapq.heappush(pq, (nd, n))
        if dist[end] == float("inf"):
            return float("inf"), []
        path, cur = [end], end
        while cur != start:
            cur = prev[cur]
            path.append(cur)
        return dist[end], path[::-1]
