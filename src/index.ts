import { parseArgs } from 'node:util';
import * as path from 'path';
import * as fs from 'fs/promises';
import { buildTree, renderTreeLines } from './tree.js';

// MENTOR NOTE FOR JUNIORS:
// Always output clean help text. A user should be able to run `foldersnap -h` or `foldersnap --help` 
// and immediately know how to use your tool without referring to online documentation.
const HELP_TEXT = `
foldersnap - A CLI tool to snapshot your folder structure into a clean tree view.

Usage:
  foldersnap [options] [path]

Options:
  -o, --output <file>    Saves the tree structure to a file (saves as markdown).
  -d, --depth <n>        Limits folder traversal depth (default: unlimited).
  -i, --ignore <list>    Comma-separated list of additional folder/file names to ignore.
  -h, --help             Displays this help information.

Examples:
  foldersnap
  foldersnap --depth 2
  foldersnap --output snap.md
  foldersnap --ignore "temp,build,.env" ./my-project
`;

async function main() {
  let parsed;
  try {
    parsed = parseArgs({
      options: {
        output: { type: 'string', short: 'o' },
        depth: { type: 'string', short: 'd' },
        ignore: { type: 'string', short: 'i' },
        help: { type: 'boolean', short: 'h' },
      },
      allowPositionals: true,
    });
  } catch (err: any) {
    console.error(`Error parsing arguments: ${err.message}`);
    console.log(HELP_TEXT);
    process.exit(1);
  }

  const { values, positionals } = parsed;

  if (values.help) {
    console.log(HELP_TEXT);
    process.exit(0);
  }

  // Parse depth
  let maxDepth = Infinity;
  if (values.depth) {
    const parsedDepth = parseInt(values.depth, 10);
    if (isNaN(parsedDepth) || parsedDepth < 0) {
      console.error('Error: --depth must be a non-negative integer.');
      process.exit(1);
    }
    maxDepth = parsedDepth;
  }

  // Set up ignores
  // MENTOR NOTE FOR JUNIORS:
  // It is a user-friendly default to append custom ignores instead of overriding the defaults completely.
  // We keep essential folders like .git and node_modules hidden by default because traversing them is slow
  // and almost never desired in a folder structure summary.
  const defaultIgnores = ['node_modules', '.git', 'dist', '.next'];
  const ignoreList = [...defaultIgnores];
  if (values.ignore) {
    const customIgnores = values.ignore.split(',').map(s => s.trim()).filter(Boolean);
    ignoreList.push(...customIgnores);
  }

  // Get target directory path
  const rawPath = positionals[0] || '.';
  const targetPath = path.resolve(rawPath);

  // Validate that the target path exists and is a directory
  try {
    const stats = await fs.stat(targetPath);
    if (!stats.isDirectory()) {
      console.error(`Error: Target path '${rawPath}' is not a directory.`);
      process.exit(1);
    }
  } catch (error: any) {
    console.error(`Error: Target path '${rawPath}' does not exist or is not accessible.`);
    process.exit(1);
  }

  // Run the traversal
  const tree = await buildTree(targetPath, { maxDepth, ignoreList });
  const lines = renderTreeLines(tree);
  const rootName = path.basename(targetPath) || targetPath;
  const treeText = [rootName, ...lines].join('\n');

  if (values.output) {
    const outputPath = path.resolve(values.output);
    
    // MENTOR NOTE FOR JUNIORS:
    // Format file outputs properly. If the user saves to markdown, wrapping the tree
    // in a code block ensures it renders in monospaced font with proper formatting in GitHub or other MD viewers.
    const markdownContent = `# Folder Snapshot

Snapshot of \`${targetPath}\`
Generated on: ${new Date().toLocaleString()}

\`\`\`
${treeText}
\`\`\`
`;
    
    try {
      await fs.writeFile(outputPath, markdownContent, 'utf-8');
      console.log(`Snapshot successfully saved to ${outputPath}`);
    } catch (err: any) {
      console.error(`Error writing to file '${values.output}': ${err.message}`);
      process.exit(1);
    }
  } else {
    // Print to terminal
    console.log(treeText);
  }
}

main().catch((err) => {
  console.error('Fatal CLI Error:', err);
  process.exit(1);
});
