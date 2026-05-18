/**
 * Problem 1: Merge Two Sorted Arrays
 * * The Core Idea: Combine two already-sorted arrays into one, 
 * * keeping it sorted, without using a brand-new array.

 * Input: nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3
 * Output: [1,2,2,3,5,6]
 */
//#region MERGED SORTED ARRAY
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
//#endregion

//#region REMOVE ELEMENT
/**
 * Problem 2: Remove a Specific Value
 * * The Core Idea: Filter out a specific "bad" number 
 * * push all the "good" numbers to the front of the array.

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
 * * for a number to appear twice, but no more than that.

 * Input: nums = [1,1,1,2,2,3]
 * Output: 5, nums = [1,1,2,2,3,_]
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
//#endregion

//#region BAYER MOORE
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
//#endregion

//#region FIND PROFIT
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
//#endregion

//#region REVERSE
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
//#endregion

//#region JUMP
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

// You are given a 0-indexed array of integers nums of length n.
// You are initially positioned at index 0.
// Each element nums[i] represents the maximum length of a forward jump from index i.
// In other words, if you are at index i, you can jump to any index (i + j) where:
// 0 <= j <= nums[i] and
// i + j < n
// Return the minimum number of jumps to reach index n - 1.
// The test cases are generated such that you can reach index n - 1.

// Input: nums = [2,3,1,1,4]
// Output: 2
function canJumpII(nums: number[]): number {
  let near = 0,
    far = 0,
    jumps = 0;

  while (far < nums.length - 1) {
    let farthest = 0;
    for (let i = near; i <= far; i++) {
      farthest = Math.max(farthest, i + nums[i]);
    }
    near = far + 1;
    far = farthest;
    jumps++;
  }
  return jumps;
}
//#endregion

//#region ROMAN & INTEGER
// * Roman To Integer
// Roman = MCMXCIV
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

// * Integer to Roman
// num = 3749
function intToRoman(num: number): string {
  const valueSymbols: [number, string][] = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];

  let res = "";
  for (const [value, symbol] of valueSymbols) {
    if (num === 0) break;
    let count = Math.floor(num / value);
    res += symbol.repeat(count);
    num -= count * value;
  }

  return res;
}
//#endregion

//#region STRING AND WORDS
/**
 * Given a string s consisting of words and spaces,
 * return the length of the last word in the string.
 * A word is a maximal substring consisting of non-space characters only.

 * Input: s = "Hello World"
 * Output: 5
 *  */
function lengthOfLastWord(s: string): number {
  let end = s.length - 1;
  while (end >= 0 && s[end] === " ") {
    end--;
  }

  let start = end;
  while (start >= 0 && s[start] !== " ") {
    start--;
  }

  return end - start;
}

/** 
 * Write a function to find the longest common prefix string amongst an array of strings.
 * If there is no common prefix, return an empty string "".
 * Solution: Sort to get all the words by alphabetics
 * Compare for the first and the last 
 * -> If sorted, 2 most differents are the first and last words
 * That would return the common prefix for the whole array

 * Input: strs = ["flower", "flow", "flight"];
 * Output: "fl";
*/
function longestCommonPrefix(strs: string[]): string {
  strs.sort();

  let first = strs[0];
  let last = strs[strs.length - 1];
  let i = 0;

  while (i < first.length && i < last.length && first[i] === last[i]) {
    i++;
  }

  return first.slice(0, i);
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
//#endregion

//#region H-INDEX
/**
 * H-Index là một hệ số được giới khoa học sinh ra
 * Cân bằng giữa "Số lượng bài báo" và "Chất lượng (lượt trích dẫn) của các bài đó".

 * H-Index là tìm một con số H LỚN NHẤT sao cho:
 * "Tôi đã viết được H bài báo, 
 * và bài nào cùi bắp nhất trong số đó cũng được người ta trích dẫn ít nhất H lần!"
 */

// * Solution 1: Descending Order
// [3, 0, 6, 1, 5];
// [6, 5, 3, 1, 0]
// 6 >= 1 => hIndex = i + 1 = 0 + 1 = 1
// 5 >= 2 => hIndex = i + 1 = 1 + 1 = 2
// 3 >= 3 => hIndex = i + 1 = 2 + 1 = 3
// 1 >= 4 => Break
function hIndexDescending(citations: number[]) {
  citations.sort((a, b) => b - a);
  let hIndex = 0;

  for (let i = 0; i < citations.length; i++) {
    if (citations[i] >= i + 1) {
      hIndex = i + 1;
    } else {
      break;
    }
  }

  return hIndex;
}

// * Solution 2: Ascending Order
// [3, 0, 6, 1, 5];
// [0, 1, 3, 5, 6]
// i = 0 => 0 >= 5 -> Wrong
// i = 1 => 1 >= 4 -> Wrong
// i = 2 => 3 >= 3 -> Return 5 - 2 = 3
function hIndex(citations: number[]): number {
  citations.sort((a, b) => a - b);
  const n = citations.length;

  for (let i = 0; i < citations.length; i++) {
    if (citations[i] >= n - i) {
      return n - i;
    }
  }

  return 0;
}
//#endregion

//#region IDG
// Insert Delete GetRandom O(1)

// Input
// ["RandomizedSet", "insert", "remove", "insert", "getRandom", "remove", "insert", "getRandom"]
// [[], [1], [2], [2], [], [1], [2], []]

// Output
// [null, true, false, true, 2, true, false, 2]
class RandomizedSet {
  private currentSet: number[];
  private indexMap: Map<number, number>;
  constructor() {
    this.currentSet = [];
    this.indexMap = new Map();
  }

  search(val: number) {
    return this.indexMap.has(val);
  }

  insert(val: number): boolean {
    if (this.search(val)) return false;

    this.currentSet.push(val);
    this.indexMap.set(val, this.currentSet.length - 1);
    return true;
  }

  remove(val: number): boolean {
    if (!this.search(val)) return false;

    const idx = this.indexMap.get(val)!;
    const last = this.currentSet[this.currentSet.length - 1];

    // Swap
    this.currentSet[idx] = last;
    this.indexMap.set(last, idx);
    this.currentSet.pop();
    this.indexMap.delete(val);
    return true;
  }

  getRandom(): number {
    const randomIndex = Math.floor(Math.random() * this.currentSet.length);
    return this.currentSet[randomIndex];
  }
}
//#endregion

//#region PRODUCT OF ARRAY
/** 
 * Given an integer array nums
 * return an array answer such that answer[i] 
 * is equal to the product of all the elements of nums except nums[i].

 * EX: nums = [1, 2, 3, 4];
 */
function productExceptSelf(nums: number[]): number[] {
  const n = nums.length;
  const answer = new Array();

  // Step 1: From Left to Right (Prefix)
  // First element does not have any numbers on the left, so the product is 1
  answer[0] = 1;
  for (let i = 1; i < n; i++) {
    // Product of current number = Product of previous number * Value of previous number
    answer[i] = answer[i - 1] * nums[i - 1];
  }

  // Step 2: From Right to Left (Suffix)
  // Last element does not have any numbers on the right, so the product initial is 1
  let rightProduct = 1;
  for (let i = n - 1; i >= 0; i++) {
    // Product on the left (in the answer) MULTIPLY with the right product
    answer[i] = rightProduct * answer[i];

    // Update the right product for next iteration (move to left)
    rightProduct = rightProduct * nums[i];
  }

  return answer;
}
//#endregion

//#region GAS STATION
/**
 * Có N gas stations, và số lượng gas ở i trạm là gas[i]
 * Mỗi lần di chuyển sẽ tốn cost[i] của gas để đi từ trạm i đến trạm i + 1
 * => Chúng ta xuất phát ở i thì sẽ có gas[i] -> Di chuyển thì sẽ bị trừ cost[i]
 * -> Tới trạm mới sẽ được cộng thêm gas[i + 1]
 * Trả về trạm ga nên bắt đầu để đi được 1 vòng mà ko hết xăng (< 0)
 * @param gas
 * @param cost
 * @returns number
 */
// Greedy - Tham lam
// EX: Input: gas = [1,2,3,4,5], cost = [3,4,5,1,2]
function canCompleteCircuit(gas: number[], cost: number[]): number {
  let totalTank = 0;
  let currentTank = 0;
  let start = 0;

  for (let i = 0; i < gas.length; i++) {
    let diff = gas[i] - cost[i];

    totalTank += diff;
    currentTank += diff;

    if (currentTank < 0) {
      start = i + 1;
      currentTank = 0;
    }
  }

  if (totalTank < 0) return -1;

  return start;
}
//#endregion
