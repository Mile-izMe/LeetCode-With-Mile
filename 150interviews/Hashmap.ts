//#region RANSOM NOTE
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

// var canConstruct = function(ransomNote, magazine) {
//     if (ransomNote.length > magazine.length) {
//         return false;
//     }

//     for (const c of new Set(ransomNote)) {
//         if (magazine.split(c).length - 1 < ransomNote.split(c).length - 1) {
//             return false;
//         }
//     }

//     return true;
// };
