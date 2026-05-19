//#region VALID PALINDROME
/**
 * A phrase is a palindrome if, after converting all uppercase letters into lowercase letters 
 * Removing all non-alphanumeric characters, it reads the same forward and backward. 
 * Alphanumeric characters include letters and numbers.
 * Given a string s, return true if it is a palindrome, or false otherwise.

 * Input: s = "A man, a plan, a canal: Panama"
 * Output: true
 * Explanation: "amanaplanacanalpanama" is a palindrome.
 */
function isPalindrome(s: string): boolean {
  s = s.toLowerCase().replace(/[a-z0-9]/g, "");
  let i = 0;
  let j = s.length - 1;

  while (i < j) {
    if (s[i] === s[j]) {
      i++;
      j--;
    } else {
      return false;
    }
  }

  return true;
}
//#endregion

//#region IS SUBSEQUENCE
/**
 * Given two strings s and t, return true if s is a subsequence of t, or false otherwise.
 * A subsequence of a string is a new string that is formed from the original string by deleting some (can be none) of the characters 
 * without disturbing the relative positions of the remaining characters. (i.e., "ace" is a subsequence of "abcde" while "aec" is not).

 * Input: s = "abc", t = "ahbgdc"
 * Output: true
 */
function isSubsequence(s: string, t: string): boolean {
  let sp = 0;
  let tp = 0;

  while (sp < s.length && tp < t.length) {
    if (s[sp] === t[tp]) {
      sp++;
    }
    tp++;
  }

  return sp === s.length;
}
//#endregion

//#region TWO SUM II
/**
 * Given a 1-indexed array of integers numbers that is already sorted in non-decreasing order
 * Find two numbers such that they add up to a specific target number.
 * Let these two numbers be numbers[index1] and numbers[index2] where 1 <= index1 < index2 <= numbers.length.
 * Return the indices of the two numbers index1 and index2, each incremented by one, as an integer array [index1, index2] of length 2.
 * You may not use the same element twice.

 * Input: numbers = [2,7,11,15], target = 9
 * Output: [1,2]
 * Explanation: The sum of 2 and 7 is 9. Therefore, index1 = 1, index2 = 2. We return [1, 2].
 */
//#endregion
function twoSum(numbers: number[], target: number): number[] {
  let i = 0;
  let j = numbers.length - 1;

  while (i < j) {
    if (numbers[i] + numbers[j] === target) {
      return [i + 1, j + 1];
    } else if (numbers[i] + numbers[j] > target) {
      j--;
    } else {
      i++;
    }
  }

  return [];
}
//#endregion

//#region CONTAINER WITH MOST WATER
function maxArea(height: number[]): number {
  let i = 0;
  let j = height.length - 1;
  let maxVolume = 0;

  while (i < j) {
    const currentVolume = (j - i) * Math.min(height[i], height[j]);
    maxVolume = Math.max(currentVolume, maxVolume);

    if (height[i] < height[j]) {
      i++;
    } else {
      j--;
    }
  }

  return maxVolume;
}
//#endregion

//#region 3SUM
function threeSum(nums: number[]): number[][] {
  nums.sort((a, b) => a - b);
  let result = [];

  for (let x = 0; x < nums.length; x++) {
    if (nums[x] === nums[x - 1]) {
      continue;
    }
    let i = x + 1;
    let j = nums.length - 1;

    while (i < j) {
      const total = nums[x] + nums[i] + nums[j];
      if (total === 0) {
        result.push([nums[x], nums[i], nums[j]]);
        i++;
        while (nums[i] === nums[i - 1] && i < j) {
          i++;
        }
      } else if (total < 0) {
        i++;
      } else {
        j--;
      }
    }
  }

  return result;
}
//#endregion
