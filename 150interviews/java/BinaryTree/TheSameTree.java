package BinaryTree;

/**
 * Given the roots of two binary trees p and q, 
 * Write a function to check if they are the same or not.
 * Two binary trees are considered the same if they are structurally identical. 
 * And the nodes have the same value.
 */

public class TheSameTree {
    public boolean isSameTree(TreeNode p, TreeNode q) {
        if (p == null && q == null) {
            return true;
        }

        if (p == null || q == null) {
            return false;
        }

        if (p.val != q.val) {
            return false;
        }

        boolean isSameLeft = isSameTree(p.left, q.left);
        boolean isSameRight = isSameTree(p.right, q.right);

        return isSameLeft && isSameRight;
    }
}
