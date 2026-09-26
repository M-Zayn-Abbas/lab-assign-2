"""Output Visualization Module: renders data structures as text."""


def render_linked_list(ll):
    items = ll.to_list()
    if not items:
        return "HEAD -> None"
    return "HEAD -> " + " -> ".join(str(x) for x in items) + " -> None"


def render_tree(bst):
    """Sideways tree (root on the left, right subtree on top)."""
    if bst.root is None:
        return "(empty tree)"
    lines = []

    def walk(node, depth):
        if node is None:
            return
        walk(node.right, depth + 1)
        lines.append("    " * depth + str(node.key))
        walk(node.left, depth + 1)

    walk(bst.root, 0)
    return "\n".join(lines)


def render_graph(graph):
    if not graph.adj:
        return "(empty graph)"
    lines = []
    for v in sorted(graph.adj):
        nbrs = ", ".join(f"{n}({graph.adj[v][n]})" for n in sorted(graph.adj[v]))
        lines.append(f"{v}: {nbrs if nbrs else '-'}")
    return "\n".join(lines)


def render_bars(values, char="#"):
    """Bar chart of numbers, e.g. to show an array before/after sorting."""
    if not values:
        return "(empty array)"
    return "\n".join(f"{str(v):>5} | {char * max(0, int(v))}" for v in values)


def render_path(distance, path):
    if not path:
        return "No path found"
    return " -> ".join(path) + f"  (total distance: {distance})"
