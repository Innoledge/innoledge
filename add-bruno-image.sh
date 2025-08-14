#!/bin/bash

echo "=== Dr. Bruno Image Helper Script ==="
echo ""
echo "This script will help you add Dr. Bruno's image to your website."
echo ""
echo "You have a few options:"
echo ""
echo "1. If you have the image file on your computer:"
echo "   - Copy it to: /home/steph/dev/innoledge/assets/images/"
echo "   - Rename it to: bruno-leraillez.jpg"
echo ""
echo "2. If you have the image at a URL, run this command:"
echo "   wget -O /home/steph/dev/innoledge/assets/images/bruno-leraillez.jpg YOUR_IMAGE_URL"
echo ""
echo "3. To create a placeholder for now:"
echo "   We'll create a simple placeholder file"
echo ""
read -p "Would you like to create a placeholder? (y/n): " choice

if [ "$choice" = "y" ] || [ "$choice" = "Y" ]; then
    # Create a placeholder using base64 encoded minimal JPEG
    echo "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" | base64 -d > /home/steph/dev/innoledge/assets/images/bruno-leraillez.jpg
    echo "✓ Placeholder image created successfully!"
    echo "  Location: /home/steph/dev/innoledge/assets/images/bruno-leraillez.jpg"
    echo ""
    echo "You can replace this with the actual image later."
fi

echo ""
echo "Current status:"
if [ -f "/home/steph/dev/innoledge/assets/images/bruno-leraillez.jpg" ]; then
    echo "✓ bruno-leraillez.jpg exists"
    ls -la /home/steph/dev/innoledge/assets/images/bruno-leraillez.jpg
else
    echo "✗ bruno-leraillez.jpg NOT FOUND"
fi