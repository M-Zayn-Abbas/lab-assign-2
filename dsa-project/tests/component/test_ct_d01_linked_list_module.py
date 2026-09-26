from dsa.linked_list import LinkedList
from tests.recorder import suite


def scenario_mixed():
    ll = LinkedList()
    for v in (10, 20, 30):
        ll.insert_at_tail(v)
    ll.insert_at_head(5)
    ll.insert_at(2, 15)
    ll.delete(20)
    return {"list": ll.to_list(), "size": len(ll), "index_of_30": ll.search(30)}


def scenario_reverse_then_search():
    ll = LinkedList()
    for v in (1, 2, 3, 4):
        ll.insert_at_tail(v)
    ll.reverse()
    return {"list": ll.to_list(), "index_of_1": ll.search(1)}


def scenario_reverse_small():
    empty, single = LinkedList(), LinkedList()
    single.insert_at_tail(7)
    empty.reverse()
    single.reverse()
    return [empty.to_list(), single.to_list()]


def scenario_bulk():
    ll = LinkedList()
    for i in range(1000):
        ll.insert_at_tail(i)
    for i in range(0, 1000, 2):
        ll.delete(i)
    return {"size": len(ll), "to_list_len": len(ll.to_list()), "first": ll.to_list()[0], "last": ll.to_list()[-1]}


def scenario_delete_all_then_reuse():
    ll = LinkedList()
    for v in (1, 2, 3):
        ll.insert_at_tail(v)
    for v in (1, 2, 3):
        ll.delete(v)
    state = [ll.to_list(), ll.is_empty()]
    ll.insert_at_tail(9)
    return state + [ll.to_list()]


CT_D01 = suite(
    {
        "level": "component", "id": "CT-D01", "name": "Complete Linked List Module",
        "uc": "UC-D01 Manage Linked List", "objective": "Verify all linked-list operations work together and keep size/links consistent",
        "pre": "linked_list.py imported", "steps": "Execute the operation sequence given in Test Data",
        "meta": {
            "component": "Linked List Module (dsa/linked_list.py)",
            "units": ["Node", "insert_at_head()", "insert_at_tail()", "insert_at()", "delete()", "delete_at()", "search()", "reverse()", "to_list()", "__len__()"],
        },
    },
    [
        {"title": "Mixed insert/delete/search sequence", "data": "tail 10,20,30; head 5; insert_at(2,15); delete(20); search(30)", "priority": "High",
         "expected": {"list": [5, 10, 15, 30], "size": 4, "index_of_30": 3}, "run": scenario_mixed},
        {"title": "Reverse then search uses new positions", "data": "[1,2,3,4] reverse(); search(1)", "expected": {"list": [4, 3, 2, 1], "index_of_1": 3}, "run": scenario_reverse_then_search},
        {"title": "Reverse on empty and single-node lists", "data": "[] reverse, [7] reverse", "expected": [[], [7]], "run": scenario_reverse_small},
        {"title": "Bulk 1000 inserts + 500 deletes keeps size consistent", "data": "insert 0..999, delete even numbers", "priority": "High",
         "expected": {"size": 500, "to_list_len": 500, "first": 1, "last": 999}, "run": scenario_bulk},
        {"title": "List can be emptied and reused", "data": "[1,2,3] delete all, then insert 9", "expected": [[], True, [9]], "run": scenario_delete_all_then_reuse},
    ],
)
