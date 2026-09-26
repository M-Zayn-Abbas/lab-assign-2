"""
Runs dsa-project/main.py with scripted keystrokes, echoing each typed value after its
prompt exactly like an interactive terminal would. Usage: python cli_session.py key1 key2 ...
"""
import builtins
import os
import sys

PROJECT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "dsa-project")
sys.path.insert(0, PROJECT)
os.chdir(PROJECT)

keys = iter(sys.argv[1:])


def scripted_input(prompt=""):
    value = next(keys)
    print(prompt + value)
    return value


builtins.input = scripted_input
import main  # noqa: E402

main.main()
