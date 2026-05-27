package BinaryTree;

/**
 * Given the root of a binary tree
 * Check whether it is a mirror of itself (i.e., symmetric around its center).
 */
public class SymetricTree {
    public boolean isSymmetric(TreeNode root) {
        if (root == null) {
            return false;
        }

        return isMirror(root.left, root.right);
    }

    public boolean isMirror(TreeNode t1, TreeNode t2) {
        if (t1 == null && t2 == null) {
            return true;
        }

        if (t1 == null || t2 == null) {
            return false;
        }

        if (t1.val != t2.val) {
            return false;
        }

        return isMirror(t1.left, t2.right) && isMirror(t1.right, t2.left);
    }
}
