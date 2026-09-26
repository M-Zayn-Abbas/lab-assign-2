"""Sample tests showing one example of each level. Run: python -m unittest discover -s tests -v"""
import unittest

from dsa.linked_list import LinkedList
from dsa.bst import BST
from dsa.input_module import parse_numbers, parse_edges
from dsa.processing import build_bst, build_graph
from dsa.visualizer import render_tree, render_path


class UnitLinkedListInsert(unittest.TestCase):
    def test_insert_at_tail_on_empty_list(self):
        ll = LinkedList()
        ll.insert_at_tail(5)
        self.assertEqual(ll.to_list(), [5])


class ComponentTreeOperations(unittest.TestCase):
    def test_insert_search_delete_traverse(self):
        t = BST()
        for v in [50, 30, 70, 20, 40]:
            t.insert(v)
        t.delete(30)
        self.assertFalse(t.search(30))
        self.assertEqual(t.inorder(), [20, 40, 50, 70])


class IntegrationInputToOutput(unittest.TestCase):
    def test_input_processing_visualization(self):
        tree = build_bst(parse_numbers("50, 30, 70"))
        self.assertEqual(render_tree(tree), "    70\n50\n    30")

    def test_graph_input_to_shortest_path_output(self):
        g = build_graph(parse_edges("A-B:4, A-C:1, C-B:2, B-D:5"))
        self.assertEqual(render_path(*g.dijkstra("A", "D")), "A -> C -> B -> D  (total distance: 8)")


if __name__ == "__main__":
    unittest.main()
