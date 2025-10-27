#!/bin/bash

# Start this in one terminal: npm run dev

# In another terminal, run this script to trigger the cron
echo "Triggering scheduled event via /test-cron..."
curl "http://localhost:8787/test-cron"

echo ""
echo "Done! Check your dev server logs."
