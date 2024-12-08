#!/bin/bash

# 設定版本號（可以從 manifest.json 中讀取）
VERSION=$(grep '"version"' manifest.json | cut -d'"' -f4)
EXTENSION_NAME="secomcare-copycat"

# 創建臨時目錄
TMP_DIR="tmp_${EXTENSION_NAME}_${VERSION}"
mkdir -p "$TMP_DIR"

# 複製必要文件
cp manifest.json "$TMP_DIR/"
cp content.js "$TMP_DIR/"
cp background.js "$TMP_DIR/"
cp styles.css "$TMP_DIR/"
cp options.js "$TMP_DIR/"
cp options.html "$TMP_DIR/"
cp icon.png "$TMP_DIR/"
cp README.md "$TMP_DIR/"

# 創建 zip 檔案
ZIP_NAME="${EXTENSION_NAME}_v${VERSION}.zip"
cd "$TMP_DIR"
zip -r "../$ZIP_NAME" ./*
cd ..

# 清理臨時目錄
rm -rf "$TMP_DIR"

echo "packing finished：$ZIP_NAME" 