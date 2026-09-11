import os
import json
import sys
import stat

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

DEFAULT_ROOT = os.path.join(SCRIPT_DIR, "public")
DEFAULT_OUTPUT = os.path.join(SCRIPT_DIR, "public", "data", "sitemap.json")

def is_hidden(path, name):
    if name.startswith('.'):
        return True
    try:
        attrs = os.stat(path).st_file_attributes
        return bool(attrs & stat.FILE_ATTRIBUTE_HIDDEN)
    except AttributeError:
        return False


def build_dir_array(path):
    entries = sorted(os.listdir(path))
    files = []
    subdirs = {}

    for entry in entries:
        full = os.path.join(path, entry)

        if is_hidden(full, entry):
            continue

        if os.path.isdir(full):
            subdirs[entry] = build_dir_array(full)
        else:
            files.append(entry)

    if subdirs and not files:
        return [subdirs]

    if subdirs and files:
        return [subdirs] + files

    return files


root = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_ROOT
output_path = os.path.abspath(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_OUTPUT

os.makedirs(os.path.dirname(output_path), exist_ok=True)


entries = sorted(os.listdir(root))
top_dirs = {}
top_files = []

for entry in entries:
    full = os.path.join(root, entry)

    if is_hidden(full, entry):
        continue

    if os.path.isdir(full):
        top_dirs[entry] = build_dir_array(full)
    else:
        top_files.append(entry)

sitemap = [top_dirs] + top_files

with open(output_path, "w") as f:
    json.dump(sitemap, f, indent=2)

print("sitemap.json generated from:", root)
print("Output location:", output_path)