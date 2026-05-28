package BinaryTree;

/**
 * Given the root of a binary tree and an integer targetSum
 * Return true if the tree has a root-to-leaf path such that 
 * adding up all the values along the path equals targetSum.
 */

public class PathSum {
    public boolean hasPathSum(TreeNode root, int targetSum) {
        if (root == null) {
            return false;
        };

        if (root.left == null && root.right == null) {
            return targetSum == root.val;
        }

        int newTarget = targetSum - root.val;
        return hasPathSum(root.left, newTarget) || hasPathSum(root.right, newTarget);
    }
}
