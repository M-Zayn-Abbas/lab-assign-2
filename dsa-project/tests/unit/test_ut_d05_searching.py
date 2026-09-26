from dsa.sorting import binary_search, linear_search
from tests.recorder import suite

ARR = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]

UT_D05 = suite(
    {
        "level": "unit", "id": "UT-D05", "name": "Search functions (binary_search / linear_search)",
        "uc": "UC-D04 Sort & Search", "objective": "Verify search returns the correct index or -1",
        "pre": "sorting.py imported; sorted array " + str(ARR), "steps": "1. Call search(arr, target)  2. Compare index with expected",
    },
    [
        {"title": "Binary search finds middle element", "data": "target=23", "expected": 5, "priority": "High", "run": lambda: binary_search(ARR, 23)},
        {"title": "Binary search finds first and last elements", "data": "target=2, target=91", "expected": [0, 9], "priority": "High",
         "run": lambda: [binary_search(ARR, 2), binary_search(ARR, 91)]},
        {"title": "Binary search returns -1 for missing value", "data": "target=50", "expected": -1, "run": lambda: binary_search(ARR, 50)},
        {"title": "Binary search on empty list returns -1", "data": "arr=[], target=1", "expected": -1, "run": lambda: binary_search([], 1)},
        {"title": "Linear search returns first occurrence", "data": "arr=[4,7,7,1], target=7", "expected": 1, "run": lambda: linear_search([4, 7, 7, 1], 7)},
        {"title": "Linear search works on unsorted list", "data": "arr=[9,3,6], target=6 / 5", "expected": [2, -1], "priority": "Low",
         "run": lambda: [linear_search([9, 3, 6], 6), linear_search([9, 3, 6], 5)]},
    ],
)
