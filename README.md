# BreachWeave

BreachWeave is a CTF-oriented multi-agent platform for Web and Pwn challenge practice.

The current fork focuses on local and authorized CTF workflows:

- Challenge Manager: loads challenge metadata, attachments, hints, and submissions.
- CTF Solver: launches model-driven solver containers for Web/Pwn tasks.
- Observer and memory board: keeps reusable facts, attempts, submissions, and solver progress visible.
- Docker runtime: runs solver work in a Linux CTF toolchain instead of polluting the host.

The original pentest-oriented prompts and skills are no longer exposed by default. Reusable pieces such as browser automation, ffuf guidance, JWT tooling, PHP payload construction, and focused fuzz dictionaries are kept for CTF Web usage.

## Status

Implemented and tested locally:

- Web UI and REST API.
- Docker-based Linux solver runtime.
- Built-in CTF prompts:
  - `ctf-web-solver`
  - `ctf-pwn-solver`
- Mock challenge mode for local testing without a real contest API.

Still expected to evolve:

- Real contest API adapter details.
- Fully unattended contest mode.
- More challenge-type specific prompts and skills.

## Requirements

- Windows, Linux, or macOS host.
- Bun 1.3.x.
- Docker Desktop or a working Docker daemon.
- A model provider compatible with the configured protocol, usually OpenAI Responses-compatible or Anthropic-compatible.

Install dependencies:

```bash
bun install
```

Start the Web UI:

```bash
bun run web
```

Open:

```text
http://127.0.0.1:3000
```

If port `3000` is busy, the server may choose another port and print it in the startup log.

## Model Setup

Configure models in the Web UI:

```text
http://127.0.0.1:3000/#/config/providers
http://127.0.0.1:3000/#/config/models
```

Minimum setup:

1. Add a provider with protocol, base URL, and API key.
2. Discover or manually add a model.
3. Use the model test button to confirm it returns `OK`.

Runtime config is stored under:

```text
~/.tch-agent/config/
```

Do not commit files from that directory. It may contain API keys.

## Local CTF Mode

For local practice, enable mock challenge mode in Host Settings or through the API. Mock mode lets the platform create challenges locally and validate submitted flags without a real contest backend.

The solver receives:

```text
/root/workspace/challenge.json
/root/workspace/challenge.md
/root/workspace/attachments/
```

For Pwn tasks, place binaries, source files, Dockerfiles, libc/ld files, and notes in the attachment directory. For Web tasks, include the target URL in the challenge entrypoint and add any source or archive files as attachments.

## Runtime Image

The solver runtime builds a Docker image named:

```text
tch-agent:latest
```

The image contains common CTF Web/Pwn tooling, including:

- pwntools
- gdb
- checksec
- ROPgadget / ropper
- ffuf
- sqlmap
- dirsearch
- Chromium and headless browser tooling
- Bun for running the solver RPC entrypoint inside Linux

The Web process starts on the host, while each solver runs inside an isolated container.

## Development Commands

```bash
bun run web
bun run typecheck
bun test
```

Regenerate embedded built-in prompts, skills, and runtime assets after editing built-in resources:

```bash
bun scripts/generate-builtin-assets.ts
```

## Repository Layout

```text
apps/
  cli/        command entrypoint
packages/
  core/       config, challenge manager, runtime, solver session
  ui-web/     Web UI and REST API
  ui-tui/     terminal UI
scripts/
  generate-builtin-assets.ts
```

## Notes

- This project is intended for CTF, lab, and authorized practice environments.
- Local logs and generated challenge binaries are ignored.
- API keys and user config live outside the repository under `~/.tch-agent/config/`.
