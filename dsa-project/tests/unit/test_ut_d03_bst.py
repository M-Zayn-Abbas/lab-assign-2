from dsa.bst import BST
from tests.recorder import suite


def tree(*keys):
    t = BST()
    for k in keys:
        t.insert(k)
    return t


def delete(keys, k):
    t = tree(*keys)
    ok = t.delete(k)
    return {"deleted": ok, "inorder": t.inorder(), "root": t.root.key if t.root else None}


UT_D03 = suite(
    {
        "level": "unit", "id": "UT-D03", "name": "BST insert / search / delete functions",
        "uc": "UC-D02 Tree Operations", "objective": "Verify BST insertion ordering, search, and all three delete cases",
        "pre": "bst.py imported; tree built from test data",
        "steps": "1. Build BST  2. Call insert/search/delete  3. Compare result / inorder traversal",
    },
    [
        {"title": "Insert keeps inorder traversal sorted", "data": "insert 50,30,70,20,40", "expected": [20, 30, 40, 50, 70], "priority": "High",
         "run": lambda: tree(50, 30, 70, 20, 40).inorder()},
        {"title": "Duplicate insert is ignored", "data": "insert 50,30 then insert(30)", "expected": {"inserted": False, "size": 2},
         "run": lambda: (lambda t: {"inserted": t.insert(30), "size": len(t)})(tree(50, 30))},
        {"title": "Search finds existing and rejects missing key", "data": "tree 50,30,70; search(70), search(65)", "expected": [True, False], "priority": "High",
         "run": lambda: (lambda t: [t.search(70), t.search(65)])(tree(50, 30, 70))},
        {"title": "Delete leaf node", "data": "tree 50,30,70,20; delete(20)", "expected": {"deleted": True, "inorder": [30, 50, 70], "root": 50},
         "run": lambda: delete([50, 30, 70, 20], 20)},
        {"title": "Delete node with one child", "data": "tree 50,30,20; delete(30)", "expected": {"deleted": True, "inorder": [20, 50], "root": 50},
         "run": lambda: delete([50, 30, 20], 30)},
        {"title": "Delete root with two children uses inorder successor", "data": "tree 50,30,70,60,80; delete(50)", "priority": "High",
         "expected": {"deleted": True, "inorder": [30, 60, 70, 80], "root": 60},
         "run": lambda: delete([50, 30, 70, 60, 80], 50)},
        {"title": "Delete missing key returns False", "data": "tree 50,30; delete(99)", "expected": {"deleted": False, "inorder": [30, 50], "root": 50},
         "run": lambda: delete([50, 30], 99)},
    ],
)
