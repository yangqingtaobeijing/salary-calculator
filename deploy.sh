#!/bin/bash
set -e
echo "🔨 Building..."
npm run build
echo "📄 Adding .nojekyll..."
touch dist/.nojekyll
echo "🚀 Deploying to GitHub Pages..."
npx gh-pages -d dist --dotfiles
echo "✅ Deploy complete!"
