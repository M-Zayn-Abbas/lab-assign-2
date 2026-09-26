"""Processing Module: builds data structures / runs algorithms on parsed input."""
from .linked_list import LinkedList
from .bst import BST
from .graph import Graph
from .sorting import SORTS, binary_search


def build_linked_list(values):
    ll = LinkedList()
    for v in values:
        ll.insert_at_tail(v)
    return ll


def build_bst(values):
    tree = BST()
    for v in values:
        tree.insert(v)
    return tree


def build_graph(edges, directed=False):
    g = Graph(directed=directed)
    for u, v, w in edges:
        g.add_edge(u, v, w)
    return g


def sort_values(values, algorithm="merge"):
    if algorithm not in SORTS:
        raise ValueError(f"Unknown algorithm '{algorithm}'. Choose from {list(SORTS)}")
    return SORTS[algorithm](values)


def sort_and_search(values, target, algorithm="merge"):
    """Sorts values and binary-searches target. Returns (sorted_list, index)."""
    s = sort_values(values, algorithm)
    return s, binary_search(s, target)
