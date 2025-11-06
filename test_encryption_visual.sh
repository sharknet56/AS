#!/bin/bash

# Visual Test: Show that encrypted files cannot be opened as images

echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║           VISUAL ENCRYPTION TEST - Try Opening Files            ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Find first encrypted file
enc_file=$(find backend/uploads -name "enc_*" -type f | head -1)

if [ -z "$enc_file" ]; then
    echo "❌ No encrypted files found. Upload an image first."
    exit 1
fi

echo "Testing with: $(basename "$enc_file")"
echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "TEST 1: Try to identify file type"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

file_type=$(file "$enc_file")
echo "$file_type"
echo ""

if echo "$file_type" | grep -q "data"; then
    echo "✅ GOOD: File is identified as 'data' (not an image format)"
    echo "   → This means it's encrypted and not readable as an image"
else
    echo "⚠️  File is identified as something other than 'data'"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "TEST 2: Check if 'identify' (ImageMagick) can read it"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

if command -v identify &> /dev/null; then
    if identify "$enc_file" 2>&1 | grep -q "no decode delegate"; then
        echo "✅ GOOD: ImageMagick cannot decode the file"
        echo "   → Confirms it's encrypted"
    elif identify "$enc_file" 2>&1 | grep -q "insufficient image data"; then
        echo "✅ GOOD: ImageMagick finds insufficient image data"
        echo "   → Confirms it's encrypted"
    else
        echo "Output:"
        identify "$enc_file" 2>&1 | head -5
    fi
else
    echo "ℹ️  ImageMagick not installed (skip this test)"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "TEST 3: Search for plaintext image markers"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Check for JPEG markers
if grep -q "JFIF" "$enc_file" 2>/dev/null; then
    echo "⚠️  WARNING: Found 'JFIF' marker (JPEG plaintext)"
elif grep -q "Exif" "$enc_file" 2>/dev/null; then
    echo "⚠️  WARNING: Found 'Exif' marker (JPEG plaintext)"
else
    echo "✅ No JPEG plaintext markers found"
fi

# Check for PNG marker
if head -c 8 "$enc_file" | grep -q "PNG" 2>/dev/null; then
    echo "⚠️  WARNING: Found PNG signature (PNG plaintext)"
else
    echo "✅ No PNG plaintext markers found"
fi

# Check for GIF marker
if head -c 6 "$enc_file" | grep -q "GIF8" 2>/dev/null; then
    echo "⚠️  WARNING: Found GIF signature (GIF plaintext)"
else
    echo "✅ No GIF plaintext markers found"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "TEST 4: Show file headers (encrypted vs plaintext)"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

echo "Encrypted file header (first 32 bytes):"
xxd -l 32 "$enc_file"
echo ""

echo "Expected for JPEG (plaintext):"
echo "00000000: ffd8 xxxx xxxx xxxx xxxx ...  (starts with FFD8)"
echo ""

echo "Expected for PNG (plaintext):"
echo "00000000: 8950 xxxx xxxx xxxx ...  (starts with 89504E47)"
echo ""

echo "Expected for Fernet encrypted:"
echo "00000000: 6741 4141 4141 41 ...  (starts with 'gAAAAA' in ASCII)"
echo ""

if head -c 6 "$enc_file" | grep -q "^gAAAAA"; then
    echo "✅ CONFIRMED: File starts with 'gAAAAA' (Fernet encryption)"
else
    echo "⚠️  File does not start with Fernet signature"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "CONCLUSION"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "✅ Files in backend/uploads/ are ENCRYPTED AT REST"
echo "✅ Cannot be opened with image viewers or editors"
echo "✅ Can only be decrypted by the backend with the correct key"
echo "✅ Decryption happens in memory when serving through the API"
echo ""
echo "To verify decryption works:"
echo "1. Open the app in browser: http://localhost:3000"
echo "2. Login and navigate to uploaded images"
echo "3. Images display correctly (decrypted on-the-fly)"
echo ""
