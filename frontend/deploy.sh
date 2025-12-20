#!/bin/bash

# PianoStudio Frontend Deployment Script for Fly.io

set -e

echo "Building PianoStudio frontend..."
npm run build

echo "Deploying to Fly.io..."
fly deploy --depot=false

echo "Deployment complete!"
echo "Frontend is now live at: https://pianostudio-frontend.fly.dev"
