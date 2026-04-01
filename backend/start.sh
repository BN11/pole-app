#!/bin/sh
echo "Running prisma db push..."
./node_modules/.bin/prisma db push
echo "Starting server with tsx..."
exec ./node_modules/.bin/tsx src/index.ts
