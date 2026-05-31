# foldersnap 📸

A fast, zero-dependency Node.js/TypeScript CLI tool that snapshots your folder structure into a clean, readable ASCII tree. Perfect for sharing repository structures in GitHub issues, documentation, or LLM prompts.

## Features

- **No External Dependencies**: Built entirely using native Node.js libraries.
- **Fast Execution**: Recursively reads files efficiently by filtering ignored folders early.
- **Smart Defaults**: Automatically ignores common heavy folders like `node_modules`, `.git`, `dist`, and `.next`.
- **Customizable**: Set maximum traversal depth, add custom ignore directories, or output results directly to Markdown files.

## Installation

Install the package globally using npm:

```bash
npm install -g foldersnap
```

Or run it directly without installing via npx:

```bash
npx foldersnap
```

## Usage

Run the command in any directory to output the folder tree:

```bash
foldersnap
```

### Options

| Option | Short | Description | Example |
|---|---|---|---|
| `--depth` | `-d` | Limits the folder traversal depth | `foldersnap --depth 2` |
| `--output` | `-o` | Saves the output tree as a Markdown file | `foldersnap --output snap.md` |
| `--ignore` | `-i` | Comma-separated list of folder/file names to ignore | `foldersnap --ignore "temp,build,.env"` |
| `--help` | `-h` | Displays the help text | `foldersnap --help` |

### Examples

**Limit search to depth 1:**
```bash
foldersnap --depth 1
```

**Ignore specific directories in addition to default ignores:**
```bash
foldersnap --ignore "assets,logs"
```

**Generate a snapshot file for documentation:**
```bash
foldersnap --output structure.md
```

## License

MIT
