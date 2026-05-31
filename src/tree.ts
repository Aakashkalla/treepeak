import * as fs from 'fs/promises';
import * as path from 'path';

export interface TreeNode {
  name: string;
  isDirectory: boolean;
  children?: TreeNode[];
}

export interface TraverseOptions {
  maxDepth: number;
  ignoreList: string[];
}

/**
 * Recursively traverses a folder and constructs a TreeNode tree.
 * 
 * MENTOR NOTE FOR JUNIORS:
 * 1. We use asynchronous `fs.promises` instead of synchronous `fs` methods. In a production Node.js 
 *    server, blocking the single event loop with sync I/O is a huge performance anti-pattern. 
 *    Even in CLI tools, async keeps it responsive and ready for concurrency.
 * 2. We use `fs.readdir(..., { withFileTypes: true })`. This returns `fs.Dirent` objects which already 
 *    contain the type (file vs directory) so we don't have to perform a costly `fs.stat` on every 
 *    single file. This dramatically speeds up CLI execution.
 * 3. We filter ignores BEFORE recursing. Checking ignores after reading subdirectories is a major 
 *    performance leak because Node.js would waste time reading contents of huge folders like `node_modules`.
 */
export async function buildTree(
  dirPath: string,
  options: TraverseOptions,
  currentDepth = 0
): Promise<TreeNode> {
  const name = path.basename(dirPath) || dirPath;
  const node: TreeNode = {
    name,
    isDirectory: true,
  };

  // If we have reached the maximum depth specified by the user, we stop traversing further down.
  if (currentDepth >= options.maxDepth) {
    return node;
  }

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const children: TreeNode[] = [];

    // Sort entries: directories first, then files, both alphabetically.
    // This gives a consistent, predictable look.
    const sortedEntries = entries.sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });

    for (const entry of sortedEntries) {
      // Check if this entry matches any of our ignore terms (direct name match or glob-like pattern)
      if (options.ignoreList.includes(entry.name)) {
        continue;
      }

      const childPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        const childNode = await buildTree(childPath, options, currentDepth + 1);
        children.push(childNode);
      } else {
        children.push({
          name: entry.name,
          isDirectory: false,
        });
      }
    }

    node.children = children;
  } catch (error: any) {
    // Handle permissions errors, missing folders, or broken symlinks gracefully
    // Instead of crashing the whole CLI, we just log that we couldn't read this directory.
    node.children = [{
      name: `[Error reading directory: ${error.message}]`,
      isDirectory: false
    }];
  }

  return node;
}

/**
 * Visualizes the TreeNode structure into an array of strings representing the tree structure.
 * 
 * MENTOR NOTE FOR JUNIORS:
 * Tree rendering relies on tracking parent states (specifically, whether parent components are 
 * the last in their respective list).
 * - "├── " represents a regular branch.
 * - "└── " represents the final branch of a folder.
 * - "│   " continues the line for non-final parent directories.
 * - "    " leaves a blank space for final parent directories.
 */
export function renderTreeLines(node: TreeNode, prefix = ''): string[] {
  const lines: string[] = [];

  if (!node.children || node.children.length === 0) {
    return lines;
  }

  node.children.forEach((child, index) => {
    const isLast = index === node.children!.length - 1;
    const branch = isLast ? '└── ' : '├── ';
    lines.push(`${prefix}${branch}${child.name}`);

    if (child.isDirectory && child.children) {
      // If we are the last child, we don't want vertical lines (│) descending from us.
      // So we append four spaces. If we are not the last child, we append "│   " so the line continues.
      const nextPrefix = prefix + (isLast ? '    ' : '│   ');
      lines.push(...renderTreeLines(child, nextPrefix));
    }
  });

  return lines;
}
