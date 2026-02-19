#!/usr/bin/env python3
"""Generate PDF from the International Tax Planning Guide markdown using Chrome headless."""

import markdown
import subprocess
import tempfile
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
MD_FILE = os.path.join(PROJECT_DIR, "International_Tax_Planning_Guide.md")
PDF_FILE = os.path.join(PROJECT_DIR, "International_Tax_Planning_Guide.pdf")
CHARTS_DIR = os.path.join(PROJECT_DIR, "charts")

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

with open(MD_FILE, "r", encoding="utf-8") as f:
    md_content = f.read()

html_body = markdown.markdown(
    md_content,
    extensions=["tables", "toc", "fenced_code", "attr_list"],
)

# Fix image paths to absolute file:// URLs
html_body = html_body.replace(
    'src="charts/',
    f'src="file://{CHARTS_DIR}/'
)

css = """
@page {
    size: A4;
    margin: 1.8cm 1.5cm 1.8cm 1.5cm;
}
body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 9pt;
    line-height: 1.5;
    color: #1a1a1a;
    max-width: 100%;
    padding: 0 10px;
}
h1 {
    font-size: 22pt;
    color: #0d2137;
    border-bottom: 3px solid #1a73e8;
    padding-bottom: 8px;
    margin-top: 0;
}
h2 {
    font-size: 15pt;
    color: #1a73e8;
    border-bottom: 1.5px solid #d0d7de;
    padding-bottom: 5px;
    margin-top: 32px;
    page-break-before: always;
}
h3 {
    font-size: 11pt;
    color: #2c5282;
    margin-top: 20px;
    margin-bottom: 6px;
}
h4 {
    font-size: 10pt;
    color: #4a5568;
    margin-top: 14px;
}
p {
    margin: 6px 0;
    text-align: justify;
}
table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0 14px 0;
    font-size: 7.5pt;
}
th {
    background-color: #1a73e8;
    color: white;
    padding: 6px 5px;
    text-align: left;
    font-weight: 600;
    font-size: 7.5pt;
    border: 1px solid #1565c0;
}
td {
    padding: 4px 5px;
    border: 1px solid #d0d7de;
    vertical-align: top;
}
tr:nth-child(even) td {
    background-color: #f6f8fa;
}
strong {
    color: #1a1a1a;
}
img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 14px auto;
    border: 1px solid #e1e4e8;
    border-radius: 4px;
}
blockquote {
    border-left: 4px solid #1a73e8;
    margin: 10px 0;
    padding: 8px 14px;
    background-color: #f0f4f8;
    color: #2d3748;
    font-size: 8.5pt;
}
code {
    background-color: #f1f3f5;
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 8pt;
    font-family: 'SF Mono', 'Menlo', monospace;
}
hr {
    border: none;
    border-top: 2px solid #e1e4e8;
    margin: 20px 0;
}
em {
    color: #555;
}
ul, ol {
    margin: 6px 0;
    padding-left: 20px;
}
li {
    margin: 3px 0;
}
"""

html_full = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>{css}</style>
</head>
<body>
{html_body}
</body>
</html>
"""

# Write HTML to temp file
html_tmp = os.path.join(PROJECT_DIR, "_temp_guide.html")
with open(html_tmp, "w", encoding="utf-8") as f:
    f.write(html_full)

print("Generating PDF via Chrome headless...")
try:
    result = subprocess.run(
        [
            CHROME,
            "--headless",
            "--disable-gpu",
            "--no-sandbox",
            "--disable-software-rasterizer",
            f"--print-to-pdf={PDF_FILE}",
            "--print-to-pdf-no-header",
            f"file://{html_tmp}",
        ],
        capture_output=True,
        text=True,
        timeout=120,
    )
    if result.returncode == 0:
        size_mb = os.path.getsize(PDF_FILE) / (1024 * 1024)
        print(f"PDF saved to: {PDF_FILE}")
        print(f"File size: {size_mb:.1f} MB")
    else:
        print(f"Chrome error (exit {result.returncode}):")
        print(result.stderr)
finally:
    # Also keep the HTML version as a deliverable
    html_out = os.path.join(PROJECT_DIR, "International_Tax_Planning_Guide.html")
    os.rename(html_tmp, html_out)
    print(f"HTML saved to: {html_out}")
