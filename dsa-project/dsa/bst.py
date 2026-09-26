"""Binary Search Tree module."""


class TreeNode:
    def __init__(self, key):
        self.key = key
        self.left = None
        self.right = None


class BST:
    def __init__(self):
        self.root = None
        self._size = 0

    def __len__(self):
        return self._size

    # ---------- Insert ----------
    def insert(self, key):
        """Insert key. Duplicates are ignored. Returns True if inserted."""
        if self.root is None:
            self.root = TreeNode(key)
            self._size += 1
            return True
        cur = self.root
        while True:
            if key == cur.key:
                return False
            if key < cur.key:
                if cur.left is None:
                    cur.left = TreeNode(key)
                    break
                cur = cur.left
            else:
                if cur.right is None:
                    cur.right = TreeNode(key)
                    break
                cur = cur.right
        self._size += 1
        return True

    # ---------- Search ----------
    def search(self, key):
        cur = self.root
        while cur:
            if key == cur.key:
                return True
            cur = cur.left if key < cur.key else cur.right
        return False

    # ---------- Delete ----------
    def delete(self, key):
        """Delete key. Returns True if deleted."""
        found = self.search(key)
        if found:
            self.root = self._delete(self.root, key)
            self._size -= 1
        return found

    def _delete(self, node, key):
        if node is None:
            return None
        if key < node.key:
            node.left = self._delete(node.left, key)
        elif key > node.key:
            node.right = self._delete(node.right, key)
        else:
            if node.left is None:
                return node.right
            if node.right is None:
                return node.left
            successor = node.right
            while successor.left:
                successor = successor.left
            node.key = successor.key
            node.right = self._delete(node.right, successor.key)
        return node

    # ---------- Traversals ----------
    def inorder(self):
        out = []
        self._inorder(self.root, out)
        return out

    def _inorder(self, node, out):
        if node:
            self._inorder(node.left, out)
            out.append(node.key)
            self._inorder(node.right, out)

    def preorder(self):
        out = []

        def walk(n):
            if n:
                out.append(n.key)
                walk(n.left)
                walk(n.right)

        walk(self.root)
        return out

    def postorder(self):
        out = []

        def walk(n):
            if n:
                walk(n.left)
                walk(n.right)
                out.append(n.key)

        walk(self.root)
        return out

    # ---------- Utility ----------
    def height(self):
        """Height in edges; empty tree = -1, single node = 0."""

        def h(n):
            return -1 if n is None else 1 + max(h(n.left), h(n.right))

        return h(self.root)

    def min(self):
        if self.root is None:
            raise ValueError("Tree is empty")
        cur = self.root
        while cur.left:
            cur = cur.left
        return cur.key

    def max(self):
        if self.root is None:
            raise ValueError("Tree is empty")
        cur = self.root
        while cur.right:
            cur = cur.right
        return cur.key
