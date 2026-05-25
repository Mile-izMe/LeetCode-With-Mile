//#region VALID SUDOKU
/**
 * Input: board = 
[["5","3",".",".","7",".",".",".","."]
,["6",".",".","1","9","5",".",".","."]
,[".","9","8",".",".",".",".","6","."]
,["8",".",".",".","6",".",".",".","3"]
,["4",".",".","8",".","3",".",".","1"]
,["7",".",".",".","2",".",".",".","6"]
,[".","6",".",".",".",".","2","8","."]
,[".",".",".","4","1","9",".",".","5"]
,[".",".",".",".","8",".",".","7","9"]]
Output: true
 * @param board 
 * @returns 
 */
function isValidSudoku(board: string[][]): boolean {
  // Create 27 Set
  const rows = Array.from({ length: 9 }, () => new Set<string>());
  const cols = Array.from({ length: 9 }, () => new Set<string>());
  const boxes = Array.from({ length: 9 }, () => new Set<string>());

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      let value = board[r][c];

      if (value === ".") {
        continue;
      }

      let boxIndex = Math.floor(r / 3) * 3 + c / 3;

      if (
        rows[r].has(value) ||
        cols[c].has(value) ||
        boxes[boxIndex].has(value)
      ) {
        return false;
      }

      rows[r].add(value);
      cols[c].add(value);
      boxes[boxIndex].add(value);
    }
  }

  return true;
}
//#endregion

//#region SPIRAL ORDER
/**
 * Movement:
 * Left -> Right (Trái sang phải)
 * Top -> Bottom (Trên xuống dưới)
 * Right -> Left (Phải sang trái)
 * Bottom -> Top (Dưới lên trên)
 * @param matrix
 */
function spiralOrder(matrix: number[][]): number[] {
  if (matrix.length === 0) return [];

  let result: number[] = [];
  let top = 0;
  let bottom = matrix.length - 1;
  let left = 0;
  let right = matrix[0].length - 1;

  while (top <= bottom && left <= right) {
    // Trái -> Phải (Men theo Top)
    for (let i = left; i <= right; i++) {
      result.push(matrix[i][right]);
    }
    top++; // Đẩy tường trên xuống

    // Trên -> Dưới (Men theo Right)
    for (let i = top; i <= bottom; i++) {
      result.push(matrix[i][right]);
    }
    right--; // Đẩy tường phải sang trái

    // BƯỚC NGOẶT: Phải kiểm tra lại xem tường có bị đè lên nhau chưa
    // Vì nếu top > bottom, ta không được phép đi ngược từ Phải -> Trái nữa
    if (top <= bottom) {
      // Phải -> Trái (Men theo bottom)
      for (let i = right; i >= left; i--) {
        result.push(matrix[bottom][i]);
      }
      bottom--; // Đẩy tường dưới lên
    }

    if (left <= right) {
      // Bước 4: Dưới -> Trên (Men theo left)
      for (let i = bottom; i >= top; i--) {
        result.push(matrix[i][left]);
      }
      left++; // Đẩy tường trái sang phải
    }
  }

  return result;
}
//#endregion
