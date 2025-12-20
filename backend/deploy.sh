#!/bin/bash

set -e

echo "Deploying PianoStudio Backend to Fly.io..."

# Check if fly.toml exists
if [ ! -f "fly.toml" ]; then
    echo "Error: fly.toml not found. Please run 'fly launch' first."
    exit 1
fi

# Build and deploy with --depot=false as per CLAUDE.md instructions
echo "Building and deploying (using Fly.io builder)..."
fly deploy --depot=false

echo ""
echo "Deployment complete!"
echo ""
echo "Useful commands:"
echo "  fly status                  - Check app status"
echo "  fly logs                    - View logs"
echo "  fly ssh console             - SSH into the container"
echo "  fly secrets list            - View secrets"
echo "  fly postgres connect -a <db-name> - Connect to database"
