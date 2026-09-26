"""Stack and Queue module."""


class Stack:
    def __init__(self, capacity=None):
        self._items = []
        self.capacity = capacity

    def push(self, item):
        if self.capacity is not None and len(self._items) >= self.capacity:
            raise OverflowError("Stack overflow")
        self._items.append(item)

    def pop(self):
        if self.is_empty():
            raise IndexError("Stack underflow")
        return self._items.pop()

    def peek(self):
        if self.is_empty():
            raise IndexError("Stack is empty")
        return self._items[-1]

    def is_empty(self):
        return len(self._items) == 0

    def size(self):
        return len(self._items)


class Queue:
    """Circular-array queue."""

    def __init__(self, capacity=10):
        if capacity <= 0:
            raise ValueError("Capacity must be positive")
        self._data = [None] * capacity
        self.capacity = capacity
        self._front = 0
        self._count = 0

    def enqueue(self, item):
        if self.is_full():
            raise OverflowError("Queue is full")
        rear = (self._front + self._count) % self.capacity
        self._data[rear] = item
        self._count += 1

    def dequeue(self):
        if self.is_empty():
            raise IndexError("Queue is empty")
        item = self._data[self._front]
        self._data[self._front] = None
        self._front = (self._front + 1) % self.capacity
        self._count -= 1
        return item

    def front(self):
        if self.is_empty():
            raise IndexError("Queue is empty")
        return self._data[self._front]

    def is_empty(self):
        return self._count == 0

    def is_full(self):
        return self._count == self.capacity

    def size(self):
        return self._count

    def to_list(self):
        return [self._data[(self._front + i) % self.capacity] for i in range(self._count)]


def is_balanced(expression):
    """Stack application: check balanced brackets."""
    pairs = {")": "(", "]": "[", "}": "{"}
    s = Stack()
    for ch in expression:
        if ch in "([{":
            s.push(ch)
        elif ch in pairs:
            if s.is_empty() or s.pop() != pairs[ch]:
                return False
    return s.is_empty()
