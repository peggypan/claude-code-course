#!/bin/bash
# Assembles the course from parts.
# Run from the course directory: bash build.sh
set -e
cat _base.html modules/*.html _footer.html > index.html
echo "✅ 已构建 index.html — 在浏览器中打开即可查看课程。"
