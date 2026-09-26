import random

from dsa.bst import BST
from tests.recorder import suite, catch_error

KEYS = [50, 30, 70, 20, 40, 60, 80]


def tree(keys):
    t = BST()
    for k in keys:
        t.insert(k)
    return t


def traversals():
    t = tree(KEYS)
    return {"inorder": t.inorder(), "preorder": t.preorder(), "postorder": t.postorder()}


def stats():
    t = tree(KEYS)
    return {"height": t.height(), "min": t.min(), "max": t.max(), "size": len(t)}


def delete_sequence():
    random.seed(1)
    keys = random.sample(range(1, 200), 60)
    t = tree(keys)
    for k in keys[::3]:
        t.delete(k)
    inorder = t.inorder()
    return {"sorted": inorder == sorted(inorder), "size": len(t), "expected_size": 60 - len(keys[::3])}


def empty_tree():
    t = BST()
    return [t.height(), t.inorder(), catch_error(t.min)()]


def degenerate_height():
    t = tree(range(1, 1501))  # sorted input -> tree becomes a 1500-node chain
    return t.height()


CT_D02 = suite(
    {
        "level": "component", "id": "CT-D02", "name": "Tree Operations Module",
        "uc": "UC-D02 Tree Operations", "objective": "Verify BST operations work together (build, traverse, measure, delete) for normal and edge inputs",
        "pre": "bst.py imported", "steps": "Build tree from Test Data and run the listed operations",
        "meta": {
            "component": "Tree Operations Module (dsa/bst.py)",
            "units": ["TreeNode", "insert()", "search()", "delete()/_delete()", "inorder()", "preorder()", "postorder()", "height()", "min()", "max()"],
        },
    },
    [
        {"title": "All three traversals of a balanced tree", "data": str(KEYS), "priority": "High",
         "expected": {"inorder": [20, 30, 40, 50, 60, 70, 80], "preorder": [50, 30, 20, 40, 70, 60, 80], "postorder": [20, 40, 30, 60, 80, 70, 50]}, "run": traversals},
        {"title": "Height, min, max and size", "data": str(KEYS), "expected": {"height": 2, "min": 20, "max": 80, "size": 7}, "run": stats},
        {"title": "Random deletes keep BST property", "data": "60 random keys (seed 1), delete every 3rd", "priority": "High",
         "expected": {"sorted": True, "size": 40, "expected_size": 40}, "run": delete_sequence},
        {"title": "Empty tree edge cases", "data": "BST() -> height, inorder, min", "expected": [-1, [], "throws ValueError: Tree is empty"], "run": empty_tree},
        {"title": "Height of degenerate tree built from sorted input", "data": "insert 1..1500 in ascending order, call height()", "priority": "High",
         "expected": 1499, "run": degenerate_height},
    ],
)
