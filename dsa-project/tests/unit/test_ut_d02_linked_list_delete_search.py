from dsa.linked_list import LinkedList
from tests.recorder import suite, catch_error


def ll(*values):
    lst = LinkedList()
    for v in values:
        lst.insert_at_tail(v)
    return lst


def delete(values, v):
    lst = ll(*values)
    ok = lst.delete(v)
    return {"deleted": ok, "list": lst.to_list(), "size": len(lst)}


UT_D02 = suite(
    {
        "level": "unit", "id": "UT-D02", "name": "LinkedList delete / search functions",
        "uc": "UC-D01 Manage Linked List", "objective": "Verify delete removes the right node and search returns the correct index",
        "pre": "linked_list.py imported; list built from test data",
        "steps": "1. Build list  2. Call delete(value)/delete_at(i)/search(value)  3. Compare result and list contents",
    },
    [
        {"title": "Delete head node", "data": "[1,2,3] delete(1)", "expected": {"deleted": True, "list": [2, 3], "size": 2}, "priority": "High",
         "run": lambda: delete([1, 2, 3], 1)},
        {"title": "Delete middle node", "data": "[1,2,3] delete(2)", "expected": {"deleted": True, "list": [1, 3], "size": 2}, "priority": "High",
         "run": lambda: delete([1, 2, 3], 2)},
        {"title": "Delete value not present leaves list unchanged", "data": "[1,2,3] delete(7)", "expected": {"deleted": False, "list": [1, 2, 3], "size": 3},
         "run": lambda: delete([1, 2, 3], 7)},
        {"title": "Delete removes only first duplicate", "data": "[4,5,4] delete(4)", "expected": {"deleted": True, "list": [5, 4], "size": 2},
         "run": lambda: delete([4, 5, 4], 4)},
        {"title": "delete_at on empty list raises IndexError", "data": "[] delete_at(0)", "expected": "throws IndexError: Index out of range",
         "run": catch_error(lambda: ll().delete_at(0))},
        {"title": "Search returns index of existing value", "data": "[10,20,30] search(30)", "expected": 2, "priority": "High",
         "run": lambda: ll(10, 20, 30).search(30)},
        {"title": "Search for missing value returns -1", "data": "[10,20,30] search(99)", "expected": -1,
         "run": lambda: ll(10, 20, 30).search(99)},
    ],
)
