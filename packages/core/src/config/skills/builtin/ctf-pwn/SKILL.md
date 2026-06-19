---
name: ctf-pwn
description: Binary exploitation CTF workflow for authorized pwn challenges, including binary triage, local reproduction, exploit scripting with pwntools, and remote flag capture.
tags: [ctf, pwn, binary-exploitation]
compatibility:
  tools: Bash, Read, Grep, Find, LS, Write, Edit
---

# CTF Pwn Skill

Use this skill when the task provides a native binary, remote `host:port`, libc/ld files, Dockerfile, or text suggesting stack/heap/format-string exploitation.

## Operating Rules

- Work only on authorized CTF binaries and challenge services.
- Always establish local behavior before remote exploitation when the binary is available.
- Keep notes concise and evidence-backed: mitigation state, input path, crash primitive, leak primitive, control primitive, final exploit.
- Put final exploit code in `exploits/solve.py` and make it configurable for local and remote runs.

## Workspace Layout

Use this layout when files are present:

```text
bin/          original challenge binaries and libc/ld files
notes.md     triage notes and offsets
scripts/     helper scripts for cyclic offsets, leaks, unpacking
exploits/    final exploit scripts
```

## First Pass

1. Inventory files: `file`, `sha256sum`, archive contents, permissions.
2. Run mitigation checks: `checksec --file ./binary` when available, otherwise use pwntools `ELF(...).checksec()`.
3. Run the binary locally with sample input. Capture prompts, menu structure, crash behavior, and environment requirements.
4. Identify architecture, PIE, NX, RELRO, canary, libc dependency, and whether a matching `libc.so`/`ld-linux` is provided.
5. If source or Dockerfile is provided, read it before reverse engineering.

## Exploit Triage

Choose the shortest plausible path:

- No PIE + overflow + NX off: shellcode or direct win function.
- No PIE + NX on: ret2win, ROP, ret2plt, ret2libc with GOT leak.
- PIE on: find an info leak before absolute control-flow targets.
- Canary on: find canary leak, format string, off-by-one, or logic path before stack overwrite.
- Full RELRO: avoid GOT overwrite; prefer ROP, hooks only if libc version allows it, or app logic.
- Format string: map argument index, leak pointers, then decide read/write primitive.
- Heap: first classify allocator/libc, menu operations, UAF/double-free/off-by-null, then target tcache/fastbin/unsorted-bin primitives.

## Pwntools Template

Prefer a small solve script with local/remote switches:

```python
from pwn import *

context.binary = elf = ELF("./chall", checksec=False)
context.log_level = "info"

HOST = args.HOST or "127.0.0.1"
PORT = int(args.PORT or 31337)

def start():
    if args.REMOTE:
        return remote(HOST, PORT)
    return process(elf.path)

io = start()

# TODO: exploit steps

io.interactive()
```

Run examples:

```bash
python exploits/solve.py
python exploits/solve.py REMOTE HOST=example.com PORT=31337
```

## Offset And Leak Discipline

- Use `cyclic`/`cyclic_find` for offsets instead of guessing.
- Record offsets in `notes.md` with the exact command and crash register.
- Verify every leak by checking pointer shape and mapped range.
- Rebase PIE/libc/heap only after one reliable leak.
- Keep final exploit deterministic: clear waits with `sendlineafter`, `recvuntil`, and explicit parsing.

## Remote Flag Capture

1. Re-run the exploit locally after the final edit.
2. Run remote with host and port from the challenge.
3. Capture the flag line and save the final terminal output if useful.
4. Submit the flag with a concise route summary.
