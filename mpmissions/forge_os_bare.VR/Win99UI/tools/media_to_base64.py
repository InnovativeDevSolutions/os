"""A script to convert media files to base64 encoded text files.

This script processes media files (images, audio, video) and converts them to base64 encoded
text format. It can handle individual files or process directories.
The encoded data is saved to new files with the original extension plus '.b64'.

Supported file types:
    - Images: .png, .jpg, .jpeg
    - Audio: .mp3
    - Video: .mp4, .webm
    - Documents: .md

Directory Input Behavior:
    - "." (current directory): Processes media files in the current directory only (one layer)
    - ".." (recursive): Processes media files in current directory and all subdirectories recursively
    - Any specific path: Processes media files recursively from that path

Functions:
    convert_to_base64(input_file): Converts a media file to base64 encoded text
    main(): Handles user input and initiates file processing

Usage:
    Run the script and enter a file or directory path when prompted.
    
    Examples:
        - Single file: "path/to/video.webm"
        - Current directory (non-recursive): "."
        - Current directory (recursive): ".."
        - Specific directory: "path/to/media/folder"

Output:
    Creates new files with '.b64' extension: 'your_file.webm.b64'
"""

import base64
import os
from pathlib import Path

def convert_to_base64(input_file):
    """Converts a media file to base64-encoded text.
    
    This function:
    1. Reads the binary content of the media file
    2. Encodes it to base64 format
    3. Writes the base64 string to a new file with '.b64' extension
    
    Args:
        input_file (Path): Path object pointing to the media file
        
    Output:
        Creates a file with original extension + '.b64' (e.g., 'video.mp4.b64')
    """
    # Read file in binary mode
    with open(input_file, 'rb') as file:
        # Convert to base64
        encoded = base64.b64encode(file.read())
        
    # Create output filename by appending .b64 while keeping original extension
    output_file = input_file.with_suffix(input_file.suffix + '.b64')
    
    # Write base64 string to text file
    with open(output_file, 'w') as file:
        file.write(encoded.decode('utf-8'))
        
    print(f"Converted {input_file} to base64 -> {output_file}")

def main():
    """Main function to handle user input and process media files.
    
    Prompts user for path and processes supported media files to base64.
    Handles both single files and directories (recursive or non-recursive).
    """
    # Get directory path from user
    dir_path = input("Enter the path to your media file or folder: ").strip()
    
    # Determine if recursive based on ".." input
    # ".." means recursive (all subdirectories)
    # "." means single directory layer only
    recursive = dir_path == ".."
    
    # If user enters ".." or ".", use current directory
    # ".." triggers recursive mode, "." triggers non-recursive mode
    # Both operate within the current working directory, NOT the parent
    if dir_path == ".." or dir_path == ".":
        dir_path = "."
    
    path = Path(dir_path)
    
    if not path.exists():
        print("Invalid path provided")
        return
    
    # Supported extensions
    supported_extensions = {'.jpg', '.jpeg', '.mp3', '.mp4', '.md', '.png', '.webm'}
    
    # Process single file
    if path.is_file():
        if path.suffix.lower() in supported_extensions:
            convert_to_base64(path)
        else:
            print(f"Unsupported file type: {path.suffix}")
        return
    
    # Process directory - recursive or non-recursive based on input
    if recursive:
        files = path.rglob('*')
    else:
        files = path.glob('*')
    
    processed_count = 0
    for file in files:
        if file.is_file() and file.suffix.lower() in supported_extensions:
            convert_to_base64(file)
            processed_count += 1
    
    if processed_count == 0:
        print(f"No supported media files found in {path}")

if __name__ == '__main__':
    main()