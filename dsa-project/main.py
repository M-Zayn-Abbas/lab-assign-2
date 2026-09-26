"""DSA Toolkit - interactive CLI (Input -> Processing -> Visualization)."""
from dsa.input_module import parse_numbers, parse_edges
from dsa.processing import build_linked_list, build_bst, build_graph, sort_values, sort_and_search
from dsa.stack_queue import Stack, Queue, is_balanced
from dsa import visualizer as viz

MENU = """
========== DSA Toolkit ==========
1. Linked List operations
2. Binary Search Tree operations
3. Stack / Queue operations
4. Sorting & Searching
5. Graph processing (BFS / DFS / Dijkstra)
0. Exit
"""


def ask(prompt):
    return input(prompt).strip()


def linked_list_menu():
    ll = build_linked_list(parse_numbers(ask("Enter numbers (e.g. 5 3 8 1): ")))
    print(viz.render_linked_list(ll))
    while True:
        c = ask("\n[i]nsert tail  [h]ead insert  [d]elete  [s]earch  [r]everse  [b]ack: ").lower()
        if c == "b":
            return
        try:
            if c == "i":
                ll.insert_at_tail(parse_numbers(ask("Value: "))[0])
            elif c == "h":
                ll.insert_at_head(parse_numbers(ask("Value: "))[0])
            elif c == "d":
                v = parse_numbers(ask("Value to delete: "))[0]
                print("Deleted" if ll.delete(v) else "Value not found")
            elif c == "s":
                v = parse_numbers(ask("Value to search: "))[0]
                idx = ll.search(v)
                print(f"Found at index {idx}" if idx != -1 else "Not found")
            elif c == "r":
                ll.reverse()
            print(viz.render_linked_list(ll), f"(size={len(ll)})")
        except ValueError as e:
            print("Error:", e)


def bst_menu():
    tree = build_bst(parse_numbers(ask("Enter numbers (e.g. 50 30 70 20 40): ")))
    print(viz.render_tree(tree))
    while True:
        c = ask("\n[i]nsert  [d]elete  [s]earch  [t]raversals  [b]ack: ").lower()
        if c == "b":
            return
        try:
            if c == "i":
                print("Inserted" if tree.insert(parse_numbers(ask("Value: "))[0]) else "Duplicate ignored")
            elif c == "d":
                print("Deleted" if tree.delete(parse_numbers(ask("Value: "))[0]) else "Value not found")
            elif c == "s":
                print("Found" if tree.search(parse_numbers(ask("Value: "))[0]) else "Not found")
            elif c == "t":
                print("Inorder:  ", tree.inorder())
                print("Preorder: ", tree.preorder())
                print("Postorder:", tree.postorder())
                print("Height:", tree.height(), "| Min:", tree.min(), "| Max:", tree.max())
            print(viz.render_tree(tree))
        except ValueError as e:
            print("Error:", e)


def stack_queue_menu():
    s, q = Stack(), Queue(capacity=5)
    while True:
        c = ask("\n[1]push [2]pop [3]enqueue [4]dequeue [5]check brackets [b]ack: ").lower()
        if c == "b":
            return
        try:
            if c == "1":
                s.push(ask("Value: "))
            elif c == "2":
                print("Popped:", s.pop())
            elif c == "3":
                q.enqueue(ask("Value: "))
            elif c == "4":
                print("Dequeued:", q.dequeue())
            elif c == "5":
                print("Balanced" if is_balanced(ask("Expression: ")) else "NOT balanced")
            print(f"Stack (top last): {s._items}   Queue (front first): {q.to_list()}")
        except (IndexError, OverflowError) as e:
            print("Error:", e)


def sorting_menu():
    try:
        values = parse_numbers(ask("Enter numbers: "))
        algo = ask("Algorithm (bubble/insertion/merge/quick) [merge]: ") or "merge"
        print("Before:\n" + viz.render_bars(values))
        result = sort_values(values, algo)
        print(f"After ({algo} sort):\n" + viz.render_bars(result))
        t = ask("Search for a value (blank to skip): ")
        if t:
            _, idx = sort_and_search(values, parse_numbers(t)[0], algo)
            print(f"Binary search: found at index {idx}" if idx != -1 else "Binary search: not found")
    except ValueError as e:
        print("Error:", e)


def graph_menu():
    try:
        g = build_graph(parse_edges(ask("Enter edges (e.g. A-B:4, A-C:1, C-B:2, B-D:5): ")))
        print(viz.render_graph(g))
        start = ask("Start vertex: ")
        print("BFS:", g.bfs(start))
        print("DFS:", g.dfs(start))
        end = ask("Destination vertex for shortest path: ")
        print("Dijkstra:", viz.render_path(*g.dijkstra(start, end)))
    except (ValueError, KeyError) as e:
        print("Error:", e)


def main():
    actions = {"1": linked_list_menu, "2": bst_menu, "3": stack_queue_menu, "4": sorting_menu, "5": graph_menu}
    while True:
        print(MENU)
        c = ask("Choose: ")
        if c == "0":
            print("Goodbye!")
            break
        try:
            actions.get(c, lambda: print("Invalid choice"))()
        except ValueError as e:
            print("Error:", e)


if __name__ == "__main__":
    main()
