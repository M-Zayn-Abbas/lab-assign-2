from dsa.stack_queue import Stack, Queue, is_balanced
from tests.recorder import suite, catch_error


def lifo():
    s = Stack()
    for x in (1, 2, 3):
        s.push(x)
    return [s.pop(), s.pop(), s.peek(), s.size()]


def overflow():
    s = Stack(capacity=2)
    s.push(1)
    s.push(2)
    s.push(3)


def fifo():
    q = Queue(5)
    for x in "ABC":
        q.enqueue(x)
    return [q.dequeue(), q.front(), q.size()]


def wraparound():
    q = Queue(3)
    for x in (1, 2, 3):
        q.enqueue(x)
    q.dequeue()
    q.enqueue(4)
    return q.to_list()


UT_D06 = suite(
    {
        "level": "unit", "id": "UT-D06", "name": "Stack / Queue operations (push, pop, peek, enqueue, dequeue)",
        "uc": "UC-D03 Stack & Queue", "objective": "Verify LIFO/FIFO behaviour, bounds errors and circular queue wrap-around",
        "pre": "stack_queue.py imported", "steps": "1. Perform operation sequence  2. Compare returned values with expected",
    },
    [
        {"title": "Stack pops in LIFO order", "data": "push 1,2,3; pop; pop; peek; size", "expected": [3, 2, 1, 1], "priority": "High", "run": lifo},
        {"title": "Pop on empty stack raises underflow", "data": "Stack(); pop()", "expected": "throws IndexError: Stack underflow", "priority": "High",
         "run": catch_error(lambda: Stack().pop())},
        {"title": "Push beyond capacity raises overflow", "data": "Stack(capacity=2); push 1,2,3", "expected": "throws OverflowError: Stack overflow", "run": catch_error(overflow)},
        {"title": "Queue dequeues in FIFO order", "data": "enqueue A,B,C; dequeue; front; size", "expected": ["A", "B", 2], "priority": "High", "run": fifo},
        {"title": "Circular queue wraps around correctly", "data": "Queue(3): enqueue 1,2,3; dequeue; enqueue 4", "expected": [2, 3, 4], "run": wraparound},
        {"title": "Dequeue on empty queue raises error", "data": "Queue(3); dequeue()", "expected": "throws IndexError: Queue is empty",
         "run": catch_error(lambda: Queue(3).dequeue())},
        {"title": "Stack application: balanced brackets", "data": "'{[()]}', '(]', '(('", "expected": [True, False, False], "priority": "Low",
         "run": lambda: [is_balanced("{[()]}"), is_balanced("(]"), is_balanced("((")]},
    ],
)
