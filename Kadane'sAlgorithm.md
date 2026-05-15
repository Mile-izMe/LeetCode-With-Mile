## Kadane's Algorithm
- Tìm mảng con liên tiếp có tổng lớn nhất (Maximum Subarray Sum) 
trong một mảng số nguyên (chứa cả số âm và số dương).

- Ví dụ: Với mảng [-2, 1, -3, 4, -1, 2, 1, -5, 4]
Mảng con liên tiếp có tổng lớn nhất là [4, -1, 2, 1] với tổng bằng 6.

Dưới đây là tóm tắt "bình dân" và cốt lõi nhất về thuật toán này:

1. Ý tưởng cốt lõi (Tư duy "Bỏ nợ")
Bạn duyệt qua từng phần tử của mảng từ trái sang phải. Tại mỗi bước, bạn đứng trước một ngã rẽ:

- Lựa chọn 1: Cho phần tử hiện tại "ké" vào nhóm (mảng con) liền trước nó để tạo thành một nhóm dài hơn.

- Lựa chọn 2: Bỏ mặc nhóm phía trước, tự thân phần tử hiện tại đứng ra thành lập một nhóm hoàn toàn mới.

# Nếu nhóm phía trước mang lại "lợi ích" (tổng của nó > 0), thì ta gộp vào để to hơn. Nhưng nếu nhóm phía trước đang ôm một "cục nợ" (tổng của nó < 0), thì việc gộp vào chỉ làm ta nghèo đi. Thà ta tự bắt đầu một nhóm mới từ chính mình còn hơn!

2. Hai biến quan trọng cần theo dõi
Để code thuật toán này, bạn chỉ cần dùng đúng 2 biến:

- **current_max** (Tổng lớn nhất tạm thời): Lưu tổng của mảng con liên tiếp tính đến phần tử hiện tại. 
Công thức: current_max = Math.max(phần_tử_hiện_tại, current_max_trước_đó + phần_tử_hiện_tại).

- **global_max** (Kỷ lục cao nhất): Lưu lại mức tổng cao nhất từng đạt được từ đầu đến giờ. 
Tại mỗi bước, ta so sánh current_max với global_max, nếu lớn hơn thì cập nhật kỷ lục mới.

EX: nums = [-3, 4, -1, 2]
```
function maxSubArray(nums: number[]): number {
    let current_max = nums[0];
    let global_max = nums[0];

    for (let i = 1; i < nums.length; i++) {
        // So sánh: Đứng 1 mình (nums[i]) hay gộp với nhóm trước (current_max + nums[i])
        current_max = Math.max(nums[i], current_max + nums[i]);
        
        // Cập nhật kỷ lục nếu tổng hiện tại phá kỷ lục
        if (current_max > global_max) {
            global_max = current_max;
        }
    }

    return global_max;
}
```

