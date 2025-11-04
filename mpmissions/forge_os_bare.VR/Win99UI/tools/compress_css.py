"""A simplified script to compress CSS files using zlib compression and base64 encoding.

This script takes a CSS file or directory as input, compresses the contents
using zlib compression, and encodes the compressed data to base64 format.
The resulting b64 string is saved to a new file with a '.b64' extension.

Directory Input Behavior:
    - "." (current directory): Compresses CSS files in the current directory only (one layer)
    - ".." (recursive): Compresses CSS files in current directory and all subdirectories recursively
    - Any specific path: Compresses CSS files recursively from that path

Functions:
    compress_css(input_css_file): Compresses and encodes the CSS file using zlib
    process_path(path, recursive): Process either a single file or a directory
    get_input_path(): Gets the CSS file or folder path from user input

Usage:
    Run the script and enter the path to your CSS file or folder when prompted.
    The compressed and encoded output will be saved as 'your_file.css.b64'
"""

import os
import glob
import base64
import zlib


def compress_css(input_css_file):
    """Compresses CSS file using zlib and encodes to Base64.
    
    This function:
    1. Reads the CSS file content
    2. Compresses it using zlib compression
    3. Encodes the compressed data to base64
    4. Writes the output with 76-character line wrapping for readability
    
    Args:
        input_css_file (str): Path to the CSS file to compress
        
    Returns:
        str: Base64-encoded compressed CSS content
        
    Output:
        Creates a file with '.b64' extension containing the compressed data
    """
    with open(input_css_file, "r", encoding="utf-8") as f:
        css_content = f.read()

        # Compress using zlib
        compressed_content = zlib.compress(css_content.encode("utf-8"))

        # Encode to base64
        b64_string = (
            base64.b64encode(compressed_content)
            .decode("utf-8")
            .replace("\n", "")
        )

        # Write output file with line wrapping at 76 characters
        output_file = input_css_file + ".b64"
        line_length = 76
        formatted_b64 = "\n".join(
            [
                b64_string[i : i + line_length]
                for i in range(0, len(b64_string), line_length)
            ]
        )
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(formatted_b64)

    return b64_string


def get_input_path():
    """Gets the CSS file or directory path from user input.
    
    Returns:
        tuple: (user_path, recursive) where recursive is True if ".." is entered
    """
    user_path = input("Enter the path to your CSS file or folder: ").strip()
    
    # Determine recursion based on input
    # ".." means recursive (multiple directory layers)
    # "." means single directory layer only
    recursive = user_path == ".."
    
    return user_path, recursive


def process_path(input_path, recursive=True):
    """Process either a single file or all CSS files in a directory.
    
    Args:
        input_path (str): Path to CSS file or directory
        recursive (bool): If True, process subdirectories recursively
        
    Returns:
        str or list: Base64 string(s) of compressed CSS
    """
    if os.path.isfile(input_path):
        if input_path.endswith(".css"):
            b64_string = compress_css(input_path)
            print(f"Processed file: {input_path}")
            return b64_string
        else:
            print("File must have .css extension")
            return None

    elif os.path.isdir(input_path):
        # Use recursive glob if recursive=True, otherwise only current directory
        if recursive:
            css_files = glob.glob(
                os.path.join(input_path, "**/*.css"), recursive=True
            )
        else:
            css_files = glob.glob(os.path.join(input_path, "*.css"))
        
        if not css_files:
            print(f"No CSS files found in {input_path}")
            return None
            
        results = []
        for css_file in css_files:
            b64_string = compress_css(css_file)
            print(f"Processed file: {css_file}")
            results.append(b64_string)
        return results
    else:
        print("Invalid path provided")
        return None


if __name__ == "__main__":
    # Get user input and determine processing mode
    path, is_recursive = get_input_path()
    
    # If user enters ".." or ".", use current directory
    # ".." triggers recursive mode (all subdirectories)
    # "." triggers non-recursive mode (current directory only)
    # Both operate within the current working directory, NOT the parent
    if path == ".." or path == ".":
        path = os.path.abspath(".")
    
    # Process the CSS files
    process_path(path, recursive=is_recursive)
    print(
        "Compression complete! Base64 output '.b64' files have been created."
    )
