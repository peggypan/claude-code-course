#!/bin/bash

echo "🎨 Claude Code 课程 - 预览脚本"
echo "=================================="
echo ""
echo "选择要预览的版本："
echo "1) 原版设计 (浅色主题)"
echo "2) 新设计 (深色科技风)"
echo "3) 并排对比"
echo ""
read -p "请输入选项 (1-3): " choice

case $choice in
  1)
    echo "📖 打开原版..."
    open index.html
    ;;
  2)
    echo "✨ 打开新设计..."
    open index-redesign.html
    ;;
  3)
    echo "📊 并排打开两个版本..."
    open index.html
    sleep 1
    open index-redesign.html
    ;;
  *)
    echo "❌ 无效选项"
    exit 1
    ;;
esac

echo ""
echo "✅ 完成！"
echo ""
echo "💡 提示："
echo "   - 查看设计说明：cat REDESIGN.md"
echo "   - 直接打开：open index-redesign.html"
