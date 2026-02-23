# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`saasdentalreceptionist` is a Python 3.12 project in early development. The scaffold was generated with `uv init`.

## Commands

```bash
# Run the entry point
uv run hello.py

# Install dependencies (after adding them to pyproject.toml)
uv sync

# Add a dependency
uv add <package>
```

## Structure

- `pyproject.toml` — project metadata and dependencies (managed via `uv`)
- `hello.py` — current entry point (`main()` function)
- `.python-version` — pins Python 3.12
