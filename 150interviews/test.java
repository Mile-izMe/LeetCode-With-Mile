class Solution {
    public boolean isHappy(int n) {
        Set<Integer> seenNumbers = new HashSet<>();

        while (n !== 1 && !seenNumbers.has(n)) {
            seenNumbers.add(n);
            n = getNextNumber(n);
        }

        return n === 1
    }

    private int getNextNumber(int n) {
        int totalSum = 0;

        while (n > 0) {
            int digit = n % 10;
            totalSum += digit * digit;
            num = Math.floor(n / 10);
        }

        return totalSum
    }
}
