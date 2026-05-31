# treepeak 📸

treepeak is a fast, zero-dependency Node.js/TypeScript CLI tool that snapshots your folder structure into a clean, readable ASCII tree. Perfect for sharing repository structures in GitHub issues, documentation, or LLM prompts.

## Features

- **No External Dependencies**: Built entirely using native Node.js libraries.
- **Fast Execution**: Recursively reads files efficiently by filtering ignored folders early.
- **Smart Defaults**: Automatically ignores common heavy folders like `node_modules`, `.git`, `dist`, and `.next`.
- **Customizable**: Set maximum traversal depth, add custom ignore directories, or output results directly to Markdown files.

## Installation

Install the package globally using npm:

```bash
npm install -g treepeak
```

Or run it directly without installing via npx:

```bash
npx treepeak
```

## Usage

Run the command in any directory to output the folder tree:

```bash
treepeak
```

### Options

| Option | Short | Description | Example |
|---|---|---|---|
| `--depth` | `-d` | Limits the folder traversal depth | `treepeak --depth 2` |
| `--output` | `-o` | Saves the output tree as a Markdown file | `treepeak --output snap.md` |
| `--ignore` | `-i` | Comma-separated list of folder/file names to ignore | `treepeak --ignore "temp,build,.env"` |
| `--help` | `-h` | Displays the help text | `treepeak --help` |

### Examples

**Limit search to depth 1:**
```bash
treepeak --depth 1
```

**Ignore specific directories in addition to default ignores:**
```bash
treepeak --ignore "assets,logs"
```

**Generate a snapshot file for documentation:**
```bash
treepeak --output structure.md
```

### Example Output

Full snapshot file: [snap.md](snap.md)

```
treepeak
├── src
│   ├── index.ts
│   └── tree.ts
├── .gitignore
├── LICENSE
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.json
└── tsup.config.ts
```

## License

MIT
