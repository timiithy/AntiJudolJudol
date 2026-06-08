#!/bin/bash
# Quick start script untuk menjalankan semua tests
# Usage: bash run_all_tests.sh

echo "================================"
echo "🧪 ANTI-JUDOL TESTING SUITE"
echo "================================"
echo ""

# Check if running on Windows or Unix
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    echo "🖥️  Detected Windows environment"
    IS_WINDOWS=true
else
    echo "🖥️  Detected Unix environment"
    IS_WINDOWS=false
fi

echo ""
echo "📝 Running Tests..."
echo ""

# Test AI Module
echo "1️⃣  Testing AI Module (Pytest)..."
echo "   cd ai && pytest -v"
echo ""

if [ "$IS_WINDOWS" = true ]; then
    cd ai && python -m pytest -v
else
    cd ai && pytest -v
fi

AI_RESULT=$?

echo ""
echo "2️⃣  Testing Backend Module (Jest)..."
echo "   cd backend && npm test"
echo ""

cd ../backend && npm test

BACKEND_RESULT=$?

echo ""
echo "================================"
echo "📊 TEST RESULTS SUMMARY"
echo "================================"
echo ""

if [ $AI_RESULT -eq 0 ]; then
    echo "✅ AI Tests: PASSED"
else
    echo "❌ AI Tests: FAILED"
fi

if [ $BACKEND_RESULT -eq 0 ]; then
    echo "✅ Backend Tests: PASSED"
else
    echo "❌ Backend Tests: FAILED"
fi

echo ""
echo "================================"

if [ $AI_RESULT -eq 0 ] && [ $BACKEND_RESULT -eq 0 ]; then
    echo "🎉 ALL TESTS PASSED! ✅"
    echo "================================"
    exit 0
else
    echo "⚠️  SOME TESTS FAILED! ❌"
    echo "================================"
    exit 1
fi
