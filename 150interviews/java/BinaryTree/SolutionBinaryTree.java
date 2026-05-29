package BinaryTree;

import java.util.HashMap;

public class SolutionBinaryTree {
    private int preorderIndex = 0;
    private int postorderIndex;
    HashMap<Integer, Integer> inorderIndexMap = new HashMap<>();

    public TreeNode buildTreeFromPreOrderAndInOrder(int[] preorder, int[] inorder) {
        for (int i = 0; i < inorder.length; i++) {
            inorderIndexMap.put(inorder[i], i);
        }

        return buildLeftThenRight(preorder, 0, preorder.length - 1);
    }

    public TreeNode buildLeftThenRight(int[] preorder, int left, int right) {
        if (left > right) {
            return null;
        }

        int rootValue = preorder[preorderIndex++];
        TreeNode root = new TreeNode(rootValue);
        int mid = inorderIndexMap.get(rootValue);

        // Build for the Left
        root.left = buildLeftThenRight(preorder, left, mid - 1);

        // Build for the right
        root.right = buildLeftThenRight(preorder, mid + 1, right);

        return root;
    }

    public TreeNode buildTreeFromInOrderAndPostOrder(int[] inorder, int[] postorder) {
        postorderIndex = postorder.length - 1;

        for (int i = 0; i < inorder.length; i++) {
            inorderIndexMap.put(inorder[i], i);
        }

        return buildRightThenLeft(postorder, 0, postorder.length - 1);
    }

    public TreeNode buildRightThenLeft(int[] postorder, int left, int right) {
        if (left > right) {
            return null;
        }

        int rootValue = postorder[postorderIndex--];
        TreeNode root = new TreeNode(rootValue);
        int mid = inorderIndexMap.get(rootValue);

        // Build for the right
        root.right = buildRightThenLeft(postorder, mid + 1, right);

        // Build for the left
        root.left = buildRightThenLeft(postorder, left, mid - 1);

        return root;
    }
}

