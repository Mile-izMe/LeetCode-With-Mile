/**
 * Problem 1: Merge Two Sorted Arrays
 * * The Core Idea: Combine two already-sorted arrays into one, keeping it sorted, without using a brand-new array.
 * * Plain English Breakdown:
 * - The Setup: You are given two arrays of numbers, `nums1` and `nums2`. Both are
 * already sorted from smallest to largest.
 * - The Catch: `nums1` has been artificially lengthened to fit everything. Its total
 * length is `m + n`. The first `m` spots hold the actual numbers, and the last `n`
 * spots are just filled with `0`s to act as empty placeholders.
 * - Your Job: Take all the numbers from `nums2` and merge them into `nums1`. By the
 * end, `nums1` should contain all the numbers from both arrays, fully sorted.
 * You must modify `nums1` directly (in-place) instead of creating a new array.
 */

function merge(nums1: number[], m: number, nums2: number[], n: number): void {
  let i = m - 1; // Pointer for nums1
  let j = n - 1; // Pointer for nums2
  let k = m + n - 1; // Pointer for merged array

  while (j >= 0) {
    if (i >= 0 && nums1[i] > nums2[j]) {
      nums1[k--] = nums1[i--];
    } else {
      nums1[k--] = nums2[j--];
    }
  }
}

/**
 * Problem 2: Remove a Specific Value
 * * The Core Idea: Filter out a specific "bad" number and push all the "good" numbers to the front of the array.
 * * Plain English Breakdown:
 * - The Setup: You have an array `nums` and a specific target number `val`.
 * - Your Job: Delete every occurrence of `val` from the array. 
 * - How to do it: Since you can't physically shrink the array's size in memory, you 
 * just grab every number that is NOT `val` and pack them neatly at the very front 
 * of the array.
 * - The Result: Return the total count of the "good" numbers you saved (let's call it `k`). 
 * The system will only look at the first `k` slots of your array. It completely ignores 
 * whatever garbage numbers are left in the remaining slots at the back.

 * Input: nums = [3,2,2,3], val = 3
 * Output: 2, nums = [2,2,_,_]
 */
function removeElement(nums: number[], val: number): number {
  let index = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== val) {
      nums[index] = nums[i];
      index++;
    }
  }
  return index;
}

/**
 * Problem 3: Remove Duplicates - Keep Exactly One
 * * The Core Idea: Clean up the array so every number shows up exactly once.
 * * Plain English Breakdown:
 * - The Setup: You have an array `nums` that is sorted. Because it's sorted, any
 * duplicate numbers will be grouped right next to each other.
 * - Your Job: Get rid of the extras so that each unique number only appears one time.
 * - How to do it: Similar to Problem 2, you pick out the unique numbers and pack them
 * at the beginning of the array in order.
 * - The Result: Return the total count of unique numbers (`k`). Again, the system only
 * cares about the first `k` elements. You don't have to clean up the leftover numbers
 * at the end of the array.
 * Input: nums = [1,1,2]
 * Output: 2, nums = [1,2,_]
 */
function removeDuplicates(nums: number[]): number {
  let i = 1;
  for (let j = 1; j < nums.length; j++) {
    if (nums[j] !== nums[i - 1]) {
      nums[i] = nums[j];
      i++;
    }
  }
  return i;
}

/**
 * Problem 4: Remove Duplicates - Keep At Most Two
 * * The Core Idea: A slightly more relaxed version of Problem 3. This time, it's okay
 * for a number to appear twice, but no more than that.
 * * Plain English Breakdown:
 * - The Setup: You have a sorted array `nums`.
 * - Your Job: Clean it up so that you keep duplicates, but cap them at 2 appearances
 * per number. For example, if you have three `1`s (`[1, 1, 1, 2]`), you keep two
 * and throw the third away (`[1, 1, 2]`).
 * - How to do it: Filter the array to keep only the valid numbers (the 1st and 2nd
 * times a number appears) and pack them tightly at the front of the array.
 * - The Result: Return the total count of the valid numbers you kept (`k`). Just like
 * the others, whatever junk is left sitting past index `k-1` doesn't matter.
 */
function removeDuplicatesII(nums: number[]): number {
  let k = 2;
  for (let i = 2; i < nums.length; i++) {
    if (nums[i] !== nums[k - 2]) {
      nums[k] = nums[i];
      k++;
    }
  }
  return k;
}

/**
 * Given an array nums of size n, return the majority element.
 * The majority element is the element that appears more than ⌊n / 2⌋ times. 
 * You may assume that the majority element always exists in the array.
 
 * Input: nums = [2,2,1,1,1,2,2]
 * Output: 2
 */
function majorityElement(nums: number[]): number {
  let candidate = nums[0];
  let count = 0;

  for (const num of nums) {
    if (count === 0) {
      candidate = num;
    }
    if (num === candidate) {
      count++;
    } else {
      count--;
    }
  }

  return candidate;
}

/**
 * Best time to buy and sell stock
 * Maximize your profit by choosing a single day to buy one stock
 * Choosing a different day in the future to sell that stock.

 * Input: prices = [7,1,5,3,6,4]
 * Output: 7
 */
function maxProfit(prices: number[]): number {
  let buy = prices[0];
  let profit = 0;

  for (let i = 1; i < prices.length; i++) {
    if (prices[i] < buy) {
      buy = prices[i];
    } else if (prices[i] - buy > profit) {
      profit = prices[i] - buy;
    }
  }
  return profit;
}

/**
 * Best time to buy and sell stock II
 * On each day, you may decide to buy and/or sell the stock.
 * You can only hold at most one share of the stock at any time.
 * However, you can sell and buy the stock multiple times on the same day,
 * ensuring you never hold more than one share of the stock.

 * Input: prices = [7,1,5,3,6,4]
 * Output: 7
 */
function maxProfitII(prices: number[]): number {
  let maxProfit = 0;
  let buy = prices[0];
  let sell = 0;

  for (let i = 1; i < prices.length; i++) {
    if (prices[i] < buy) {
      buy = prices[i];
    } else if (prices[i] > prices[i - 1]) {
      sell = prices[i] - prices[i - 1];
      maxProfit += sell;
    }
  }
  return maxProfit;
}

/**
 * Given an integer array nums,
 * rotate the array to the right by k steps, where k is non-negative.

 * Input: nums = [1,2,3,4,5,6,7], k = 3
 * Output: [5,6,7,1,2,3,4]
 */
function rotate(nums: number[], k: number): void {
  const n = nums.length;
  k %= n;

  function reverse(start: number, end: number) {
    while (start < end) {
      [nums[start], nums[end]] = [nums[end], nums[start]];
      start++;
      end--;
    }
  }

  reverse(0, n - 1);
  reverse(0, k - 1);
  reverse(k, n - 1);
}

/**
 * You are given an integer array nums.
 * You are initially positioned at the array's first index,
 * and each element in the array represents your maximum jump length at that position.
 * Return true if you can reach the last index, or false otherwise.

 * Input: nums = [2,3,1,1,4]
 * Output: true
 */
function canJump(nums: number[]): boolean {
  let goal = nums.length - 1;

  for (let i = nums.length - 2; i >= 0; i--) {
    if (i + nums[i] >= goal) {
      goal = i;
    }
  }

  return goal === 0;
}

/**
 * Given two strings needle and haystack, 
 * return the index of the first occurrence of needle in haystack, 
 * or -1 if needle is not part of haystack.

 * Input: haystack = "sadbutsad", needle = "sad"
 * Output: 0
 */
function strStr(haystack: string, needle: string) {
  if (haystack.length < needle.length) return -1;

  for (let i = 0; i <= haystack.length - needle.length; i++) {
    if (haystack.substring(i, i + needle.length) === needle) {
      return i;
    }
  }
  return -1;
}

function romanToInt(s: string): number {
  let res = 0;
  let roman = new Map<string, number>([
    ["I", 1],
    ["V", 5],
    ["X", 10],
    ["L", 50],
    ["C", 100],
    ["D", 500],
    ["M", 1000],
  ]);

  // MCMXCIV
  for (let i = 0; i < s.length - 1; i++) {
    const current = roman.get(s[i]) ?? 0;
    const next = roman.get(s[i + 1]) ?? 0;
    if (current < next) {
      res -= current;
    } else {
      res += current;
    }
  }
  res += roman.get(s[s.length - 1]) ?? 0;
  return res;
}
