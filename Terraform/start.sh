#!/bin/bash

echo "🚀 Starting AI Backend on Port 8000..."
# Yahan check kar ki backend run karne ki command kya hai (e.g., python main.py ya python manage.py runserver)
python3 manage.py runserver 0.0.0.0:8000 & 

echo "🌐 Starting Next.js Frontend on Port 3000..."
npm run dev