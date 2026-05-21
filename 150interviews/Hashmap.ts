//#region RANSOM NOTE
/**
 * Given two strings ransomNote and magazine,
 * return true if ransomNote can be constructed by using the letters from magazine and false otherwise.
 * Each letter in magazine can only be used once in ransomNote.
 * @param ransomNote
 * @param magazine
 * @returns

 * Input: ransomNote = "a", magazine = "b"
 * Output: false
 */
function ransomNote(ransomNote: string, magazine: string): boolean {
  const letterCount = new Map<string, number>();

  for (const char of magazine) {
    const currentCount = letterCount.get(char) || 0;
    letterCount.set(char, currentCount + 1);
  }

  for (const c of ransomNote) {
    const countInStock = letterCount.get(c) || 0;

    if (countInStock === 0) {
      return false;
    }

    letterCount.set(c, countInStock - 1);
  }

  return true;
}
//#endregion

//#region ISOMORPHIC STRINGS
/**
 * Given two strings s and t, determine if they are isomorphic.
 * Two strings s and t are isomorphic if the characters in s can be replaced to get t.
 * All occurrences of a character must be replaced with another character while preserving the order of characters.
 * No two characters may map to the same character, but a character may map to itself.
 * @param s
 * @param t
 * @returns

 * Input: s = "egg", t = "add"
 * Output: true
 */
function Isomorphic(s: string, t: string): boolean {
  if (s.length !== t.length) return false;
  const mapS = new Map<string, string>();
  const mapT = new Map<string, string>();

  for (let i = 0; i < s.length; i++) {
    let charS = s[i];
    let charT = t[i];

    if (
      (mapS.has(charS) && mapS.get(charS) !== charT) ||
      (mapT.has(charT) && mapT.get(charT) !== charS)
    ) {
      return false;
    }

    mapS.set(charS, charT);
    mapT.set(charT, charS);
  }

  return true;
}

// Solution 2:
function IsomorphicSol2(s: string, t: string): boolean {
  if (s.length !== t.length) return false;
  const mapS = new Uint16Array(256);
  const mapT = new Uint16Array(256);

  for (let i = 0; i < s.length; i++) {
    let charS = s.charCodeAt(i);
    let charT = s.charCodeAt(i);

    if (mapS[charS] !== mapT[charT]) {
      return false;
    }

    mapS[charS] = i + 1;
    mapT[charT] = i + 1;
  }

  return true;
}

//#endregion

//#region WORD PATTERN
/**
 * Given a pattern and a string s, find if s follows the same pattern.
 * Here follow means a full match, such that there is a bijection between a letter in pattern and a non-empty word in s. Specifically:
 * Each letter in pattern maps to exactly one unique word in s.
 * Each unique word in s maps to exactly one letter in pattern.
 * No two letters map to the same word, and no two words map to the same letter.
 * @param pattern 
 * @param s 

 * Input: pattern = "abba", s = "dog cat cat dog"
 * Output: true
 */
function wordPattern(pattern: string, s: string): boolean {
  let words = s.split(" ");
  const charToWords = new Map<string, string>();
  const usedWords = new Set<string>();

  if (pattern.length !== words.length) return false;
  for (let i = 0; i < pattern.length; i++) {
    let word = words[i];
    let charP = pattern[i];
    if (charToWords.has(charP)) {
      if (charToWords.get(charP) !== word) {
        return false;
      }
    } else {
      if (usedWords.has(word)) {
        return false;
      }
      charToWords.set(charP, word);
      usedWords.add(word);
    }
  }

  return true;
}

//#endregion

//#region TWO SUM
/**
 * Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
 * You may assume that each input would have exactly one solution, and you may not use the same element twice.
 * You can return the answer in any order.
 * @param nums
 * @param target
 * @returns

 * Input: nums = [2,7,11,15], target = 9
 * Output: [0,1]
 */
function twoSumI(nums: number[], target: number): number[] {
  const numMap = new Map<number, number>();

  for (let i = 0; i < nums.length; i++) {
    const result = target - nums[i];

    if (numMap.has(result)) {
      return [i, numMap.get(result)!];
    }

    numMap.set(nums[i], i);
  }

  return [];
}

//#endregion
