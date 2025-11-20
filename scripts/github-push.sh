#!/bin/bash

# GitHub Push Helper Script
# Usage: ./scripts/github-push.sh <branch-name>

BRANCH=${1:-main}

echo "Pushing to GitHub..."
echo "Branch: $BRANCH"

# Add all changes
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "No changes to commit"
else
    echo "Changes detected, ready for commit"
fi

# Push to remote
git push -u origin $BRANCH

echo "Done!"
