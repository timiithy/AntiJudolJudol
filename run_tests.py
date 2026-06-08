#!/usr/bin/env python
"""
Utility script untuk menjalankan tests dan manage testing environment
Usage: python run_tests.py [command]
Commands: run, ai, backend, coverage, help
"""

import subprocess
import sys
import os
from pathlib import Path

class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_header(text):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*50}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.BLUE}{text}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*50}{Colors.ENDC}\n")

def print_success(text):
    print(f"{Colors.GREEN}✅ {text}{Colors.ENDC}")

def print_error(text):
    print(f"{Colors.RED}❌ {text}{Colors.ENDC}")

def print_info(text):
    print(f"{Colors.CYAN}ℹ️  {text}{Colors.ENDC}")

def print_warning(text):
    print(f"{Colors.YELLOW}⚠️  {text}{Colors.ENDC}")

def run_ai_tests():
    """Run AI tests with Pytest"""
    print_header("🧪 RUNNING AI TESTS")
    
    ai_dir = Path("ai")
    if not ai_dir.exists():
        print_error("AI directory not found!")
        return False
    
    try:
        os.chdir(ai_dir)
        result = subprocess.run(
            [sys.executable, "-m", "pytest", "-v", "--tb=short"],
            capture_output=False
        )
        os.chdir("..")
        return result.returncode == 0
    except Exception as e:
        print_error(f"Error running AI tests: {e}")
        os.chdir("..")
        return False

def run_backend_tests():
    """Run Backend tests with Jest"""
    print_header("🧪 RUNNING BACKEND TESTS")
    
    backend_dir = Path("backend")
    if not backend_dir.exists():
        print_error("Backend directory not found!")
        return False
    
    try:
        os.chdir(backend_dir)
        
        # Try different ways to run npm on Windows/Unix
        if sys.platform.startswith('win'):
            # Windows: try npm.cmd or npm.exe
            result = subprocess.run(
                ["npm.cmd", "test"],
                capture_output=False,
                shell=True
            )
        else:
            # Unix/Linux/Mac
            result = subprocess.run(
                ["npm", "test"],
                capture_output=False
            )
        
        os.chdir("..")
        return result.returncode == 0
    except Exception as e:
        print_error(f"Error running Backend tests: {e}")
        print_warning("Make sure npm is installed and 'npm install' was run in backend folder")
        os.chdir("..")
        return False

def run_all_tests():
    """Run all tests"""
    print_header("🎯 RUNNING ALL TESTS")
    
    ai_passed = run_ai_tests()
    backend_passed = run_backend_tests()
    
    print_header("📊 TEST RESULTS SUMMARY")
    
    if ai_passed:
        print_success("AI Tests PASSED")
    else:
        print_error("AI Tests FAILED")
    
    if backend_passed:
        print_success("Backend Tests PASSED")
    else:
        print_error("Backend Tests FAILED")
    
    if ai_passed and backend_passed:
        print(f"\n{Colors.GREEN}{Colors.BOLD}🎉 ALL TESTS PASSED!{Colors.ENDC}\n")
        return True
    else:
        print(f"\n{Colors.RED}{Colors.BOLD}⚠️  SOME TESTS FAILED!{Colors.ENDC}\n")
        return False

def run_coverage():
    """Generate coverage reports"""
    print_header("📈 GENERATING COVERAGE REPORTS")
    
    # AI Coverage
    print_info("Generating AI coverage report...")
    try:
        os.chdir("ai")
        subprocess.run([
            sys.executable, "-m", "pytest",
            "--cov=.",
            "--cov-report=html",
            "--cov-report=term"
        ])
        print_success("AI coverage report generated: ai/htmlcov/index.html")
        os.chdir("..")
    except Exception as e:
        print_error(f"Error generating AI coverage: {e}")
        os.chdir("..")
    
    # Backend Coverage
    print_info("Generating Backend coverage report...")
    try:
        os.chdir("backend")
        subprocess.run(["npm", "run", "test:coverage"])
        print_success("Backend coverage report generated: backend/coverage/lcov-report/index.html")
        os.chdir("..")
    except Exception as e:
        print_error(f"Error generating Backend coverage: {e}")
        os.chdir("..")

def print_help():
    """Print help message"""
    help_text = """
╔══════════════════════════════════════════════════════════════╗
║           ANTI-JUDOL TESTING UTILITY                        ║
╚══════════════════════════════════════════════════════════════╝

USAGE: python run_tests.py [command]

COMMANDS:
  run           - Run all tests (AI + Backend)
  ai            - Run only AI tests
  backend       - Run only Backend tests
  coverage      - Generate coverage reports
  help          - Show this help message

EXAMPLES:
  python run_tests.py run        # Run all tests
  python run_tests.py ai         # Run AI tests only
  python run_tests.py backend    # Run Backend tests only
  python run_tests.py coverage   # Generate coverage reports

═══════════════════════════════════════════════════════════════

QUICK START:

1. First time setup:
   - cd ai
   - pip install -r requirements-dev.txt
   - cd ../backend
   - npm install

2. Run tests:
   - python run_tests.py run

3. Check coverage:
   - python run_tests.py coverage

═══════════════════════════════════════════════════════════════

For detailed information, see TESTING_GUIDE.md

═══════════════════════════════════════════════════════════════
"""
    print(help_text)

def main():
    if len(sys.argv) < 2:
        print_help()
        return
    
    command = sys.argv[1].lower()
    
    if command == "run":
        success = run_all_tests()
        sys.exit(0 if success else 1)
    elif command == "ai":
        success = run_ai_tests()
        sys.exit(0 if success else 1)
    elif command == "backend":
        success = run_backend_tests()
        sys.exit(0 if success else 1)
    elif command == "coverage":
        run_coverage()
    elif command == "help" or command == "--help" or command == "-h":
        print_help()
    else:
        print_error(f"Unknown command: {command}")
        print_help()
        sys.exit(1)

if __name__ == "__main__":
    main()
