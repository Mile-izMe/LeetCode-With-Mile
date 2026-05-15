// Given an integer array nums, rotate the array to the right by k steps,
// where k is non-negative.

// Input: nums = [1,2,3,4,5,6,7], k = 3
// Output: [5,6,7,1,2,3,4]

function rotateRemake(nums: number[], k: number): void {
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
