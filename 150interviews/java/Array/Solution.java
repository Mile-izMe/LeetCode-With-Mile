package Array;

import java.util.Arrays;

public class Solution {
    
    // Merge Sorted Array
    public void mergeSortedArray(int[] nums1, int m, int[] nums2, int n) {
        int i = m - 1;
        int j = n - 1;
        int k = m + n - 1;

        while (j >= 0) {
            if (i >= 0 && nums1[i] > nums2[j]) {
                nums1[k--] = nums1[i--];
            } else {
                nums1[k--] = nums2[j--];
            }
        }
    }

    // Remove Element
    public int removeElement(int[] nums, int val) {
        int k = 0;

        for (int i = 0; i < nums.length; i++) {
            if (nums[i] != val) {
                nums[k] = nums[i];
                k++;
            }
        }
        return k;
    }

    // Remove Duplicate
    public int removeDuplicates(int[] nums) {
        int k = 1;
        
        for (int i = 1; i < nums.length; i++) {
            if (nums[i] != nums[i - 1]) {
                nums[k] = nums[i];
                k++;
            }
        }

        return k;
    }

    // Remove Duplicate II
    public int removeDuplicateII(int[] nums) {
        int k = 2;

        for (int i = 2; i < nums.length; i++) {
            if (nums[i] != nums[i - 2]) {
                nums[k] = nums[i];
                k++;
            }
        }

        return k;
    }

    // Major Element
    public int majorityElement(int[] nums) {
        int count = 0;
        int candidate = nums[0];

        for (int num : nums) {
            if (count == 0) {
                candidate = num;
            }

            if (candidate == num) {
                count++;
            } else {
                count--;
            }
        }

        return candidate;
    }

    // Rotate Array
    public void rotate(int[] nums, int k) {
        k = k % nums.length;

        reverse(nums, 0, nums.length - 1);
        reverse(nums, 0, k - 1);
        reverse(nums, k, nums.length - 1);

    }

    private void reverse(int[] nums, int start, int end) {
        while (start < end) {
            int temp = nums[start];
            nums[start] = nums[end];
            nums[end] = temp;

            start++;
            end--;
        }
    }

    // Best Time To Buy and Sell Stock
    public int maxProfit(int[] prices) {
        int profit = 0;
        int buy = prices[0];

        for (int i = 1; i < prices.length; i++) {
            if (prices[i] < buy) {
                buy = prices[i];
            } else if (prices[i] - buy > profit) {
                profit = prices[i] - buy;
            }
        }

        return profit;
    }

    // Best Time To Buy and Sell Stock II
    public int maxProfitII(int[] prices) {
        int profit = 0;
        int buy = prices[0];
        int sell = 0;

        for (int i = 1; i < prices.length; i++) {
            if (prices[i] < buy) {
                buy = prices[i];
            } else if (prices[i] > prices[i - 1]) {
                sell = prices[i] - prices[i - 1];
                profit += sell;
            }
        }

        return profit;
    }

    // Jump Game
    public boolean canJump(int[] nums) {
        int current = nums.length - 1;
        for (int i = nums.length - 2; i >= 0; i--) {
            if (nums[i] + i >= current) {
                current = i;
            }
        }

        return current == 0;
    }

    // Citations
    // Input: citations = [3,0,6,1,5] =>< [0, 1, 3, 5, 6]
    public int hIndex(int[] citations) {
        Arrays.sort(citations);
        int hIndex = 0;
        int n = citations.length;

        for (int i = n - 1; i >= 0; i--) {
            int count = n - 1;
            if (citations[i] >= count) {
                hIndex = count;
            } else {
                break;
            }
        }

        return hIndex;
    }
}
