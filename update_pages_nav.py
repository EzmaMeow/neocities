import os
from html.parser import HTMLParser

NAV_FILE = "./templates/navigation.html"
INPUT_FILE = "/public/pages/about.html"
INPUT_DIR = "./public/"
OUTPUT_DIR = "./"


# --- Step 1: Extract meta values using HTMLParser ---
class MetaParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.page_type = None
        self.page_id = None

    def handle_starttag(self, tag, attrs):
        if tag == "meta":
            attr_dict = dict(attrs)
            if attr_dict.get("name") == "page-type":
                self.page_type = attr_dict.get("content")
            if attr_dict.get("name") == "page-id":
                self.page_id = attr_dict.get("content")

# Load nav template ---
with open(NAV_FILE, "r", encoding="utf-8") as f:
    nav_html = f.read()

# Add active class only if meta exists ---
def activate(html_text, tab_id):
    search = f'id="{tab_id}"'
    replace = f'id="{tab_id}" class="active"'
    return html_text.replace(search, replace)

def modifyPage(page_path):
    # Load page
    with open(page_path, "r", encoding="utf-8") as f:
        page_html = f.read()

    # Parse meta tags
    parser = MetaParser()
    parser.feed(page_html)
    page_type = parser.page_type
    page_id = parser.page_id

    # Replace the existing #nav block ---
    start = page_html.find('<div id="nav"')
    if start != -1:
        end = page_html.find('</div>', start)
        if end != -1:
            end += len('</div>')
            page_html = page_html[:start] + nav_html + page_html[end:]



    if page_type:
        page_html = activate(page_html, f"{page_type}-tab")

    if page_id:
        page_html = activate(page_html, f"{page_id}-tab")

    

    # Create directory chain
    directory = os.path.dirname(OUTPUT_DIR+page_path)
    os.makedirs(directory, exist_ok=True)

    # Write output ---
    with open(OUTPUT_DIR+page_path , "w", encoding="utf-8") as f:
       f.write(page_html)


for root, dirs, files in os.walk(INPUT_DIR):
    for f in files:
        if f.lower().endswith(".html"):
            full_path = os.path.join(root, f)
            modifyPage(full_path)