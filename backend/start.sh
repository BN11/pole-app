#!/bin/sh
echo "▶ Running prisma db push..."
node_modules/.bin/prisma db push
echo "▶ Running seed..."
node_modules/.bin/tsx prisma/seed.ts
echo "▶ Starting server..."
exec node dist/index.js
