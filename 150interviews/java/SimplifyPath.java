import java.util.ArrayDeque;
import java.util.Deque;

/**
 * ! UNIX-STYLE:
 * * A single period '.' represents the current directory.
 * * A double period '..' represents the previous/parent directory.
 * * Multiple consecutive slashes such as '//' and '///' are treated as a single slash '/'.
 * * '...' and '....' are valid directory or file names.

 * ! RULES:
 * * The path must start with a single slash '/'.
 * * Directories within the path must be separated by exactly one slash '/'.
 * * The path must not end with a slash '/', unless it is the root directory.
 * * The path must not have any single or double periods ('.' and '..') used to denote current or parent directories.

 * Input: path = "/home/"
 * Output: "/home"
 * 
 * Input: path = "/home/user/Documents/../Pictures"
 * Output: "/home/user/Pictures"
 */
public class SimplifyPath {
    public String simplifyPath(String path) {
        Deque<String> stack = new ArrayDeque<>();
        String[] components = path.split("/");

        for (String p : components) {
            if (p.equals("..")) {
                if (!stack.isEmpty()) {
                    stack.removeLast();
                }
            } else if (!p.isEmpty() && !p.contains(".")) {
                stack.addLast(p);
            }
        }
        return "/" + String.join("/", stack);
    }
}
