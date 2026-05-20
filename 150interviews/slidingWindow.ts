//#region Sliding Window
/**
 * Two pointers both start from the left side -> Run into the right side
 * The range between left and right make a "window"
 *
 * Step 1 (Extend): The "Right" moves forward, absorb the numbers to gather to sum => Until sum >= target.
 * Step 2 (Narrow): When target is achieved, the "Left" moves forward to find the minimal length but still reach the target.
 * Whenever the "Left" moves, subtract the numbers from sum
 */
//#endregion

//#region Minimum Size Subarray Sum
/**
 * Given an array of positive integers nums and a positive integer target
 * return the minimal length of a subarray whose sum is greater than or equal to target.
 * If there is no such subarray, return 0 instead.
 *
 * Input: target = 7, nums = [2, 3, 1, 2, 4, 3]
 * Output: 2
 */
function minSubArrayLength(target: number, nums: number[]): number {
  let left = 0;
  let sum = 0;
  let minLength = Infinity;

  for (let right = 0; right < nums.length; right++) {
    sum += nums[right];

    while (sum >= target) {
      minLength = Math.min(minLength, right - left + 1);

      sum -= nums[left];
      left++;
    }
  }
  return minLength === Infinity ? 0 : minLength;
}

//#endregion

//#region LENGTH OF THE LONGEST SUBSTRING
/**
 * Given a string s, find the length of the longest substring without duplicate characters.

 * Input: s = "abcabcbb"
 * Output: 3
 * @param s
 */
function lengthOfLongestSubstring(s: string): number {
  let left = 0;
  let maxLength = 0;
  let charSet = new Set<string>();

  for (let right = 0; right < s.length; right++) {
    if (charSet.has(s[right])) {
      charSet.delete(s[left]);
      left++;
    }
    charSet.add(s[right]);

    maxLength = Math.max(maxLength, right - left + 1);
  }

  return maxLength;
}
//#endregion
