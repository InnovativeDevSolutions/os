# Win99UI Tools

This directory contains Python utility scripts for processing CSS and media files for the Win99UI project.

## Tools Overview

### 1. compress_css.py
Compresses CSS files using zlib compression and encodes them to base64 format.

**Features:**
- Zlib compression for optimal size reduction
- Base64 encoding for safe transport
- Line-wrapped output (76 characters per line)
- Single file or directory processing
- Recursive and non-recursive modes

**⚠️ Note:** This is the **recommended tool** for Win99UI. The framework currently only supports zlib-compressed, non-minified CSS files.

**Usage:**
```bash
python compress_css.py
```

When prompted, enter:
- **`.`** - Process CSS files in current directory only (non-recursive, one layer)
- **`..`** - Process CSS files in current directory and all subdirectories (recursive)
- **`path/to/file.css`** - Process a specific CSS file
- **`path/to/directory`** - Process all CSS files in specified directory (recursive)

**Output:**
Creates `.b64` files with base64-encoded compressed CSS content.

**Example:**
```
Enter the path to your CSS file or folder: ..
Processed file: C:\...\styles\main.css
Processed file: C:\...\components\button\button.css
Compression complete! Base64 output '.b64' files have been created.
```

---

### 2. media_to_base64.py
Converts media files (images, audio, video) to base64 encoded text files.

**Supported File Types:**
- **Images:** `.png`, `.jpg`, `.jpeg`
- **Audio:** `.mp3`
- **Video:** `.mp4`, `.webm`
- **Documents:** `.md`

**Usage:**
```bash
python media_to_base64.py
```

When prompted, enter:
- **`.`** - Process media files in current directory only (non-recursive, one layer)
- **`..`** - Process media files in current directory and all subdirectories (recursive)
- **`path/to/file.mp4`** - Process a specific media file
- **`path/to/directory`** - Process all supported media files in specified directory (recursive)

**Output:**
Creates `.b64` files with base64-encoded media content (e.g., `video.mp4.b64`).

**Example:**
```
Enter the path to your media file or folder: .
Converted assets\logo.png to base64 -> assets\logo.png.b64
Converted assets\sound.mp3 to base64 -> assets\sound.mp3.b64
```

---

### 3. package_css.py
Advanced CSS packaging tool with multiple compression and archival options.

**⚠️ Important:** The Win99UI framework currently only supports zlib compression without minification. Use `compress_css.py` for production. This tool is provided for future extensibility.

**Features:**
- Optional CSS minification (not yet supported by framework)
- Multiple compression algorithms (zlib, gzip, brotli)
- Archive compression (LZMA, 7z) (not yet supported by framework)
- Interactive configuration

**Usage:**
```bash
python package_css.py
```

When prompted, first enter path:
- **`.`** - Process CSS files in current directory only (non-recursive, one layer)
- **`..`** - Process CSS files in current directory and all subdirectories (recursive)
- **`path/to/file.css`** - Process a specific CSS file
- **`path/to/directory`** - Process all CSS files in specified directory (recursive)

Then follow the interactive prompts to configure:
1. Minification preference (yes/no)
2. Compression preference (yes/no)
3. Compression type (zlib/gzip/brotli)
4. Archival preference (yes/no)
5. Archival type (lzma/7z)

**Output:**
- `.b64` files with processed CSS
- Optional `.xz` or `.7z` archive files

---

## Installation

Install required dependencies:

```bash
pip install -r requirements.txt
```

**Required packages:**
- `brotli` - For brotli compression (package_css.py only)
- `py7zr` - For 7z archival (package_css.py only)

**Note:** `compress_css.py` and `media_to_base64.py` only require standard library modules.

---

## Directory Behavior Reference

All three tools (`compress_css.py`, `media_to_base64.py`, and `package_css.py`) use consistent directory input patterns:

| Input | Behavior |
|-------|----------|
| `.` | Process files in current directory only (one layer, non-recursive) |
| `..` | Process files in current directory AND all subdirectories (recursive) |
| Specific path | Process files from specified path (recursive by default) |
| File path | Process single file |

**Important:** The `..` input does NOT navigate to the parent directory. Instead, it enables recursive processing within your current working directory.

---

## Building Executables

To create standalone executables using PyInstaller:

```bash
# Build compress_css executable
python -m PyInstaller --onefile --name compress_css Win99UI\tools\compress_css.py

# Build media_to_base64 executable
python -m PyInstaller --onefile --name media_to_base64 Win99UI\tools\media_to_base64.py

# Build package_css executable
python -m PyInstaller --onefile --name package_css Win99UI\tools\package_css.py
```

Executables will be created in the `dist\` directory.

---

## Common Use Cases

### Process all CSS in current project recursively
```bash
python compress_css.py
# Enter: ..
```

### Process CSS in current directory only (non-recursive)
```bash
python compress_css.py
# Enter: .
```

### Process CSS in specific directory recursively
```bash
python compress_css.py
# Enter: styles
```

### Convert single image to base64
```bash
python media_to_base64.py
# Enter: assets/logo.png
```

### Convert all media in current directory (non-recursive)
```bash
python media_to_base64.py
# Enter: .
```

### Package CSS with custom options
```bash
python package_css.py
# Enter: ..
# Then configure: minify (yes), compress (yes), compression type (brotli), archive (no)
```

---

## Framework Compatibility

**⚠️ Important:** The Win99UI framework currently has the following limitations:

- **Supported:** Zlib compression only (used by `compress_css.py`)
- **Not Yet Supported:** 
  - CSS minification
  - Gzip or Brotli compression
  - Archive formats (LZMA, 7z)

**Recommendation:** Use `compress_css.py` for all CSS processing in Win99UI projects. The `package_css.py` tool is provided for future framework enhancements.

---

## Notes

- All tools preserve original files - output is written to new `.b64` files
- Base64 output is line-wrapped at 76 characters for readability (compress_css.py and package_css.py)
- Recursive mode processes all subdirectories from the starting point
- Tools will skip unsupported file types and display appropriate messages
- `compress_css.py` uses only zlib compression (simplified tool)
- `package_css.py` offers multiple compression and archival options (advanced tool)
- When using `..` or `.`, both stay within your current working directory
