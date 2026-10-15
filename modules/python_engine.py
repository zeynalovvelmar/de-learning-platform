import sys
import subprocess
import ast
from typing import Tuple, Optional

DISALLOWED_MODULES = {'os', 'subprocess', 'shutil', 'socket', 'pty', 'posix'}

class PythonEngine:
    def __init__(self, default_timeout: float = 3.0):
        self.default_timeout = default_timeout

    def _check_security(self, code_str: str) -> Optional[str]:
        """
        Parses AST to detect disallowed system/process module imports.
        """
        try:
            tree = ast.parse(code_str)
        except SyntaxError as e:
            # Syntax errors will be reported during execution
            return None

        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    root_pkg = alias.name.split('.')[0]
                    if root_pkg in DISALLOWED_MODULES:
                        return f"SecurityError: Access to module '{root_pkg}' is restricted in sandbox."
            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    root_pkg = node.module.split('.')[0]
                    if root_pkg in DISALLOWED_MODULES:
                        return f"SecurityError: Access to module '{root_pkg}' is restricted in sandbox."
        return None

    def execute_code(self, code_str: str, timeout: Optional[float] = None) -> Tuple[str, Optional[str]]:
        """
        Executes user code in an isolated subprocess with timeout protection.
        Returns (stdout_text, error_message).
        """
        t = timeout or self.default_timeout

        # Security check
        sec_err = self._check_security(code_str)
        if sec_err:
            return "", sec_err

        try:
            res = subprocess.run(
                [sys.executable, "-c", code_str],
                capture_output=True,
                text=True,
                timeout=t
            )
            stdout = res.stdout
            stderr = res.stderr

            if res.returncode != 0:
                # Return the last meaningful traceback lines
                err_lines = [line for line in stderr.splitlines() if line.strip()]
                clean_err = "\n".join(err_lines[-3:]) if err_lines else "Unknown execution error"
                return stdout, clean_err
            
            return stdout, None

        except subprocess.TimeoutExpired:
            return "", f"TimeoutError: Execution timed out (limit: {t}s). Check for infinite loops."
        except Exception as e:
            return "", str(e)

    def check_answer(self, user_code: str, test_code: str, timeout: Optional[float] = None) -> Tuple[bool, str, Optional[str]]:
        """
        Executes user code coupled with test assertions.
        Returns (is_correct, status_code, details).
        Status codes: 'ok', 'user_error', 'values_mismatch', 'timeout', 'internal_error'
        """
        t = timeout or self.default_timeout

        sec_err = self._check_security(user_code)
        if sec_err:
            return False, "user_error", sec_err

        # Indent test_code for try block (8 spaces)
        indented_tests = "\n".join("        " + line for line in test_code.strip().splitlines())

        harness = f"""
{user_code}

# Test Verification Harness
if __name__ == '__main__':
    try:
{indented_tests}
        print("__TEST_PASSED__")
    except AssertionError as _ae:
        print(f"__TEST_FAILED__{{_ae}}")
    except Exception as _e:
        print(f"__TEST_ERROR__{{_e}}")
"""

        try:
            res = subprocess.run(
                [sys.executable, "-c", harness],
                capture_output=True,
                text=True,
                timeout=t
            )
            stdout = res.stdout
            stderr = res.stderr

            if res.returncode != 0 and "__TEST_FAILED__" not in stdout and "__TEST_PASSED__" not in stdout:
                # Syntax error or runtime crash in user code
                err_lines = [line for line in stderr.splitlines() if line.strip()]
                clean_err = "\n".join(err_lines[-3:]) if err_lines else "Syntax or runtime error"
                return False, "user_error", clean_err

            if "__TEST_PASSED__" in stdout:
                return True, "ok", None

            if "__TEST_FAILED__" in stdout:
                for line in stdout.splitlines():
                    if line.startswith("__TEST_FAILED__"):
                        detail = line.replace("__TEST_FAILED__", "").strip()
                        return False, "values_mismatch", detail or None
                return False, "values_mismatch", None

            if "__TEST_ERROR__" in stdout:
                for line in stdout.splitlines():
                    if line.startswith("__TEST_ERROR__"):
                        detail = line.replace("__TEST_ERROR__", "").strip()
                        return False, "user_error", detail
                return False, "user_error", "An error occurred during evaluation."

            return False, "user_error", stderr or "Execution failed"

        except subprocess.TimeoutExpired:
            return False, "timeout", f"Execution exceeded {t}s limit."
        except Exception as e:
            return False, "internal_error", str(e)
