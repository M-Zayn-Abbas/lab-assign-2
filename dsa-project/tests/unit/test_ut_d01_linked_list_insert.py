from dsa.linked_list import LinkedList
from tests.recorder import suite, catch_error


def ll(*values):
    lst = LinkedList()
    for v in values:
        lst.insert_at_tail(v)
    return lst


def after(values, op):
    lst = ll(*values)
    op(lst)
    return lst.to_list()


UT_D01 = suite(
    {
        "level": "unit", "id": "UT-D01", "name": "LinkedList insert functions (insert_at_head / insert_at_tail / insert_at)",
        "uc": "UC-D01 Manage Linked List", "objective": "Verify nodes are inserted at the correct position and size is updated",
        "pre": "linked_list.py imported; new LinkedList created per test",
        "steps": "1. Build list from test data  2. Call insert function  3. Compare to_list() with expected",
    },
    [
        {"title": "Insert at tail of empty list", "data": "[] + insert_at_tail(5)", "expected": [5], "priority": "High",
         "run": lambda: after([], lambda l: l.insert_at_tail(5))},
        {"title": "Insert at tail keeps order", "data": "[1,2] + insert_at_tail(3)", "expected": [1, 2, 3], "priority": "High",
         "run": lambda: after([1, 2], lambda l: l.insert_at_tail(3))},
        {"title": "Insert at head becomes first element", "data": "[1,2] + insert_at_head(0)", "expected": [0, 1, 2], "priority": "High",
         "run": lambda: after([1, 2], lambda l: l.insert_at_head(0))},
        {"title": "Insert at middle index", "data": "[1,2] + insert_at(1, 9)", "expected": [1, 9, 2],
         "run": lambda: after([1, 2], lambda l: l.insert_at(1, 9))},
        {"title": "Insert at index == size appends", "data": "[1,2] + insert_at(2, 9)", "expected": [1, 2, 9],
         "run": lambda: after([1, 2], lambda l: l.insert_at(2, 9))},
        {"title": "Insert at invalid index raises IndexError", "data": "[1,2] + insert_at(5, 9)", "expected": "throws IndexError: Index out of range",
         "run": catch_error(lambda: ll(1, 2).insert_at(5, 9))},
        {"title": "Size is updated after inserts", "data": "insert_at_tail x3", "expected": 3, "priority": "Low",
         "run": lambda: len(ll(1, 2, 3))},
    ],
)
