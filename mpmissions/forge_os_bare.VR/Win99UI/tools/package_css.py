"""A script to package CSS files with advanced compression and archival options.

This script takes a CSS file or directory as input, optionally minifies and compresses
the contents using various algorithms, and encodes to base64 format.
The resulting b64 string is saved to a new file with a '.b64' extension.

Directory Input Behavior:
    - "." (current directory): Processes CSS files in the current directory only (one layer)
    - ".." (recursive): Processes CSS files in current directory and all subdirectories recursively
    - Any specific path: Processes CSS files recursively from that path

Functions:
    compress_css(input_css_file): Compresses and encodes the CSS file
    process_path(path, recursive): Process either a single file or a directory
    get_input_path(): Gets the CSS file or folder path from user input
    minify_css(css): Minifies CSS content by removing whitespace and comments

Usage:
    Run the script and enter the path to your CSS file or folder when prompted.
    The compressed and encoded output will be saved as 'your_file.css.b64'
"""

import os
import glob
import base64
import re
import zlib
import gzip
import lzma

# pylint: disable=import-error
import brotli  # type: ignore
import py7zr


def minify_css(css):
    """Minifies CSS content by removing unnecessary characters.
    
    Performs the following optimizations:
    1. Removes all comments (/* ... */)
    2. Collapses whitespace to single spaces
    3. Removes spaces around CSS operators ({};,:)
    4. Removes unnecessary semicolons before closing braces
    5. Trims leading/trailing whitespace
    
    Args:
        css (str): Original CSS content
        
    Returns:
        str: Minified CSS content
    """
    # Remove comments
    css = re.sub(r"/\*[\s\S]*?\*/", "", css)
    # Remove whitespace
    css = re.sub(r"\s+", " ", css)
    # Remove spaces around operators
    css = re.sub(r"\s*([{};,:])\s*", r"\1", css)
    # Remove unnecessary semicolons
    css = re.sub(r";}", "}", css)
    # Remove leading/trailing whitespace
    css = css.strip()
    return css


def process_css_content(css_content, minify, compress, compress_type):
    """Applies minification and compression to CSS based on user preferences.
    
    Args:
        css_content (str): Original CSS content
        minify (bool): Whether to minify the CSS
        compress (bool): Whether to compress the CSS
        compress_type (str): Compression algorithm ('zlib', 'gzip', or 'brotli')
        
    Returns:
        bytes: Processed CSS content (compressed if enabled, otherwise just encoded)
    """
    if minify:
        css_content = minify_css(css_content)
    if compress:
        if compress_type == "brotli":
            return brotli.compress(css_content.encode("utf-8"))
        elif compress_type == "gzip":
            return gzip.compress(css_content.encode("utf-8"))
        elif compress_type == "zlib":
            return zlib.compress(css_content.encode("utf-8"))
    return css_content.encode("utf-8")


def compress_css(
    input_css_file, minify=True, compress=True, compress_type="brotli"
):
    """Processes, optionally compresses, and Base64 encodes the CSS file.
    
    Args:
        input_css_file (str): Path to the CSS file to process
        minify (bool): Whether to minify CSS (default: True)
        compress (bool): Whether to compress CSS (default: True)
        compress_type (str): Compression algorithm (default: 'brotli')
        
    Returns:
        str: Base64-encoded processed CSS content
        
    Output:
        Creates a file with '.b64' extension containing the processed data
    """
    with open(input_css_file, "r", encoding="utf-8") as f:
        css_content = f.read()

        processed_content = process_css_content(
            css_content, minify, compress, compress_type
        )

        b64_string = (
            base64.b64encode(processed_content)
            .decode("utf-8")
            .replace("\n", "")
        )

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
    """Gets user preferences for minification and compression.
    
    Returns:
        tuple: (user_path, minify, compress, compress_type, archive_type, recursive)
    """
    user_path = input("Enter the path to your CSS file or folder: ").strip()
    
    # Determine recursion based on input
    # ".." means recursive (multiple directory layers)
    # "." means single directory layer only
    recursive = user_path == ".."
    
    minify_choice = (
        input("Do you want to minify the CSS files? (yes/no): ")
        .strip()
        .lower()
    )
    compress_choice = (
        input("Do you want to compress the CSS files? (yes/no): ")
        .strip()
        .lower()
    )
    archive_choice = (
        input("Do you want to archive the files? (yes/no): ").strip().lower()
    )

    minify = minify_choice in ("yes", "y")
    compress = compress_choice in ("yes", "y")
    archive = archive_choice in ("yes", "y")

    user_compress_type = "brotli"
    if compress:
        user_compress_type = (
            input("Choose compression type (zlib/gzip/brotli): ")
            .strip()
            .lower()
        )
        if user_compress_type not in ("zlib", "gzip", "brotli"):
            print("Invalid compression type. Defaulting to brotli.")
            user_compress_type = "brotli"

    user_archive_type = None
    if archive:
        user_archive_type = (
            input(
                "Choose archival type (lzma(highest compression)\
                    /7z(high compression)): "
            )
            .strip()
            .lower()
        )
        if user_archive_type not in ("lzma", "7z"):
            print("Invalid archival type. No archival will be applied.")
            user_archive_type = None

    return user_path, minify, compress, user_compress_type, user_archive_type, recursive


def process_path(
    input_path, minify, compress, compress_type, archive_type=None, recursive=True
):
    """Process either a single file or all CSS files in a directory.
    
    Args:
        input_path (str): Path to CSS file or directory
        minify (bool): Whether to minify CSS
        compress (bool): Whether to compress CSS
        compress_type (str): Compression algorithm to use
        archive_type (str): Archive type (lzma/7z) or None
        recursive (bool): If True, process subdirectories recursively
        
    Returns:
        str or list: Base64 string(s) of processed CSS
    """
    if os.path.isfile(input_path):
        if input_path.endswith(".css"):
            b64_string = compress_css(
                input_path,
                minify=minify,
                compress=compress,
                compress_type=compress_type,
            )
            print(f"Processed file: {input_path}")
            if archive_type:
                archive_compress(input_path, archive_type)
                print(f"Archived file: {input_path}")
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
            b64_string = compress_css(
                css_file,
                minify=minify,
                compress=compress,
                compress_type=compress_type,
            )
            print(f"Processed file: {css_file}")
            if archive_type:
                archive_compress(css_file, archive_type)
                print(f"Archived file: {css_file}")
            results.append(b64_string)
        return results
    else:
        print("Invalid path provided")
        return None


def archive_compress(input_file, archive_type):
    """Compresses a file into an archive using LZMA or 7z.
    
    Args:
        input_file (str): Path to the file to archive
        archive_type (str): Archive format ('lzma' or '7z')
        
    Output:
        Creates '.xz' file for LZMA or '.7z' file for 7z compression
    """
    if archive_type == "lzma":
        with lzma.open(input_file + ".xz", "w") as archive:
            with open(input_file, "rb") as f:
                archive.write(f.read())
    elif archive_type == "7z":
        with py7zr.SevenZipFile(input_file + ".7z", "w") as archive:
            archive.write(input_file, input_file)


if __name__ == "__main__":
    # Get user preferences and input path
    path, minify_opt, compress_opt, compression_type, archival_type, is_recursive = (
        get_input_path()
    )
    
    # If user enters ".." or ".", use current directory
    # ".." triggers recursive mode (all subdirectories)
    # "." triggers non-recursive mode (current directory only)
    # Both operate within the current working directory, NOT the parent
    if path == ".." or path == ".":
        path = os.path.abspath(".")
    
    process_path(
        path,
        minify=minify_opt,
        compress=compress_opt,
        compress_type=compression_type,
        archive_type=archival_type,
        recursive=is_recursive,
    )
    print(
        "Compression complete! Base64 output '.b64' files have been created."
    )
