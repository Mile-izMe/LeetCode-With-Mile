/**
 * Definition for singly-linked list.
 * class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode(int x) {
 *         val = x;
 *         next = null;
 *     }
 * }
 */
public class LinkedListCycle {
    /**
    * Input: head = [3,2,0,-4], pos = 1
    * Output: true
    */
    class ListNode {
      int val;
      ListNode next;
      ListNode(int x) {
        val = x;
        next = null;
      }
    }

    public boolean hasCycle(ListNode head) {
        if (head == null || head.next == null) {
            return false;
        }

        ListNode slow = head;
        ListNode fast = head;

        while (fast != null && slow != null) {
            slow = head.next;
            fast = head.next.next;

            if (slow == fast) {
                return true;
            }
        }

        return false;
    }
}
