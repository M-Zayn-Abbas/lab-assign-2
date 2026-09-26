from dsa.sorting import bubble_sort, insertion_sort, merge_sort, quick_sort
from tests.recorder import suite

DATA = [38, 27, 43, 3, 9, 82, 10]


def no_mutation():
    original = [3, 1, 2]
    merge_sort(original)
    quick_sort(original)
    bubble_sort(original)
    insertion_sort(original)
    return original


UT_D04 = suite(
    {
        "level": "unit", "id": "UT-D04", "name": "Sorting functions (bubble / insertion / merge / quick)",
        "uc": "UC-D04 Sort & Search", "objective": "Verify each sorting algorithm returns a correctly ordered new list",
        "pre": "sorting.py imported", "steps": "1. Call sort function with input list  2. Compare returned list with expected",
    },
    [
        {"title": "Merge sort on random list", "data": str(DATA), "expected": [3, 9, 10, 27, 38, 43, 82], "priority": "High", "run": lambda: merge_sort(DATA)},
        {"title": "Quick sort handles duplicates", "data": "[5,1,5,3,1]", "expected": [1, 1, 3, 5, 5], "priority": "High", "run": lambda: quick_sort([5, 1, 5, 3, 1])},
        {"title": "Bubble sort on already sorted list", "data": "[1,2,3,4]", "expected": [1, 2, 3, 4], "run": lambda: bubble_sort([1, 2, 3, 4])},
        {"title": "Insertion sort on reverse-sorted list", "data": "[5,4,3,2,1]", "expected": [1, 2, 3, 4, 5], "run": lambda: insertion_sort([5, 4, 3, 2, 1])},
        {"title": "Empty and single-element lists", "data": "[], [7] (all 4 algorithms)", "expected": [[], [7]], "priority": "Low",
         "run": lambda: [merge_sort([]), quick_sort([7])] if bubble_sort([]) == [] and insertion_sort([7]) == [7] else "mismatch"},
        {"title": "Negative numbers and floats", "data": "[2.5,-1,0,-3.5,2]", "expected": [-3.5, -1, 0, 2, 2.5], "run": lambda: merge_sort([2.5, -1, 0, -3.5, 2])},
        {"title": "Input list is not modified", "data": "original=[3,1,2] passed to all sorts", "expected": [3, 1, 2], "priority": "High", "run": no_mutation},
    ],
)
