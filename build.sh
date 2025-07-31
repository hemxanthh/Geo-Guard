# Render.com Build Script
echo "🚀 Building Geo Guard for Render deployment..."

# Install frontend dependencies and build
echo "📦 Installing frontend dependencies..."
cd project
npm ci

echo "🔨 Building frontend for production..."
npm run build

# Go back to root
cd ..

echo "📦 Installing backend dependencies..."
npm ci

echo "✅ Build completed successfully!"
echo "🎯 Ready to serve from server/index.js"
