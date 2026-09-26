"""Singly Linked List module."""


class Node:
    def __init__(self, data):
        self.data = data
        self.next = None


class LinkedList:
    def __init__(self):
        self.head = None
        self._size = 0

    def __len__(self):
        return self._size

    def is_empty(self):
        return self.head is None

    # ---------- Insert ----------
    def insert_at_head(self, data):
        node = Node(data)
        node.next = self.head
        self.head = node
        self._size += 1

    def insert_at_tail(self, data):
        node = Node(data)
        if self.head is None:
            self.head = node
        else:
            cur = self.head
            while cur.next:
                cur = cur.next
            cur.next = node
        self._size += 1

    def insert_at(self, index, data):
        if index < 0 or index > self._size:
            raise IndexError("Index out of range")
        if index == 0:
            return self.insert_at_head(data)
        cur = self.head
        for _ in range(index - 1):
            cur = cur.next
        node = Node(data)
        node.next = cur.next
        cur.next = node
        self._size += 1

    # ---------- Delete ----------
    def delete(self, data):
        """Delete first occurrence of data. Returns True if deleted."""
        prev, cur = None, self.head
        while cur:
            if cur.data == data:
                if prev is None:
                    self.head = cur.next
                else:
                    prev.next = cur.next
                self._size -= 1
                return True
            prev, cur = cur, cur.next
        return False

    def delete_at(self, index):
        if index < 0 or index >= self._size:
            raise IndexError("Index out of range")
        if index == 0:
            data = self.head.data
            self.head = self.head.next
        else:
            cur = self.head
            for _ in range(index - 1):
                cur = cur.next
            data = cur.next.data
            cur.next = cur.next.next
        self._size -= 1
        return data

    # ---------- Search / Utility ----------
    def search(self, data):
        """Return index of data, or -1 if not found."""
        cur, i = self.head, 0
        while cur:
            if cur.data == data:
                return i
            cur, i = cur.next, i + 1
        return -1

    def reverse(self):
        prev, cur = None, self.head
        while cur:
            nxt = cur.next
            cur.next = prev
            prev, cur = cur, nxt
        self.head = prev

    def to_list(self):
        out, cur = [], self.head
        while cur:
            out.append(cur.data)
            cur = cur.next
        return out
