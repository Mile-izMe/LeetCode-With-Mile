/**
 * Interweaving
 * A linked list of length n is given such that each node contains an additional random pointer
 * which could point to any node in the list, or null.
 * 
 * Construct a deep copy of the list. The deep copy should consist of exactly n brand new nodes
 * where each new node has its value set to the value of its corresponding original node. 
 * Both the next and random pointer of the new nodes should point to new nodes in the copied list such that 
 * the pointers in the original list and copied list represent the same list state. 
 * None of the pointers in the new list should point to nodes in the original list.
 */

/**
 * SOLUTION:
 * EX: head = [[7,null],[13,0],[11,4],[10,2],[1,0]]

 * 3-rounds:
 * * Round 1: Iterate through the list and add a copy of each val called val' right after the original val
 * Use node iter
 * 7 -> 13 -> 11 -> 10 -> 1 => 7 -> 7' -> 13 -> 13' -> 11 -> 11' -> 1 -> 1'

 * * Round 2: Attach random for val' by formula: iter.next.random = iter.random.next
 * iter = 13
 * 13.random = 0 (first Node) -> Point to Node 7
 * 13'.random = 13.random.next = 7.next
 * 7.next = 7'. (So 13' point exactly to 7')
 * iter turn to next = 11

 * * Round 3: Detangling
 * Use pseudoHead to keep the copy list
 * copyIter stands at pseudoHead, iter starts from 7
 * iter = 7
 * copyIter.next = 7', move copyIter to 7'
 * Recover Root: 7.next into 13
 * Move iter to 13
 */
class CopyRandomList {
    class Node {
        int val;
        Node next;
        Node random;

        public Node(int val) {
            this.val = val;
            this.next = null;
            this.random = null;
        }
    }

    public Node copyRandomList(Node head) {
        if (head == null) {
            return null;
        }
        
        // Round 1: Interweaing
        // Create new Node and copy A -> A' -> B -> B'
        Node iter = head;
        while (iter != null) {
            Node copy = new Node(iter.val); // A'
            copy.next = iter.next; // A'.next = B
            iter.next = copy; // A.next -> A'

            iter = copy.next; // iter = B
        }

        // Round 2: Attach value by formula: iter.next.random = iter.random.next
        iter = head;
        while (iter != null) {
            if (iter.random != null) {
                iter.next.random = iter.random.next;
            }
            iter = iter.next.next;
        }

        // Round 3: Detagling
        iter = head;
        Node pseudoHead = new Node(0);
        Node copyIter = pseudoHead;

        while (iter != null) {
            copyIter.next = iter.next;
            copyIter = copyIter.next;

            iter.next = iter.next.next;
            iter = iter.next;
        }
        
        return pseudoHead.next;
    } 
}