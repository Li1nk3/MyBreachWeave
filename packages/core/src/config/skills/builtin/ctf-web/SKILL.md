---
name: ctf-web
description: Web CTF solving workflow for authorized challenge targets, including crawl, endpoint mapping, vulnerability triage, exploit reproduction, and flag submission.
tags: [ctf, web, challenge]
compatibility:
  tools: Bash, Read, Grep, Find, LS
---

# CTF Web Skill

Use this skill when the task is an authorized Web CTF challenge or when the target exposes HTTP/HTTPS entrypoints.

## Operating Rules

- Treat the target as a CTF challenge: optimize for reproducible flag extraction, not broad real-world reporting.
- Do a fast baseline before exploitation. Capture enough request/response evidence to avoid blind guessing.
- Prefer short scripts for repeated requests, differential checks, and payload sweeps.
- Keep artifacts in the workspace, grouped by purpose: `notes.md`, `requests/`, `responses/`, `scripts/`, `exploits/`.
- Submit only strings that match the expected flag format or are strongly evidenced as flags.

## First Pass

1. Normalize targets into a list of base URLs.
2. Fetch `/`, response headers, cookies, redirects, and obvious metadata.
3. Check common CTF discovery paths: `/robots.txt`, `/sitemap.xml`, `/.git/HEAD`, `/.env`, `/backup`, `/admin`, `/debug`, `/api`, `/source`, `/src`, `/www.zip`.
4. Crawl HTML and JavaScript before fuzzing. Extract forms, links, scripts, API routes, hidden fields, comments, source maps, and client-side route names.
5. Record each interesting input as: route, method, parameters, content type, auth state, observed behavior.

## Web Triage Matrix

Prioritize by observed signals:

- Error differences or SQL keywords: SQLi, NoSQLi, template injection, expression injection.
- File path parameters, download endpoints, image/file readers: path traversal, LFI, arbitrary file read.
- URL fetchers, webhooks, import-from-url features: SSRF.
- Upload, image processing, archive extraction: upload bypass, parser confusion, decompression side effects.
- Login, role checks, object IDs, hidden JSON fields: auth bypass, IDOR, mass assignment.
- Redirect, preview, markdown, PDF, HTML rendering: XSS, HTML injection, server-side rendering quirks.
- Cookies, JWT, Flask/Django/Rails/Spring hints: signing issues, weak secrets, debug consoles.

## Exploit Workflow

1. Build a minimal reproduction for one suspected vulnerability.
2. Confirm the primitive with low-impact probes: boolean differences, controlled echo, known local files, harmless SSRF canaries inside the challenge network, or deterministic timing only when necessary.
3. Once a primitive is confirmed, turn it into a flag extraction path.
4. Put final exploit code in `exploits/solve.py` or `exploits/solve.sh`.
5. Re-run the final exploit from a clean command before submitting.

## Efficient Commands

Useful baseline commands:

```bash
curl -i -sS "$URL/"
curl -i -sS "$URL/robots.txt"
whatweb "$URL"
ffuf -w /usr/share/seclists/Discovery/Web-Content/raft-small-words.txt -u "$URL/FUZZ" -mc all -fs 0
```

Use Python when requests need cookies, sessions, retries, or response diffing:

```python
import requests

s = requests.Session()
r = s.get("http://target/")
print(r.status_code, r.headers.get("content-type"))
print(r.text[:500])
```

## Stop Conditions

- If a vulnerability class is clearly contradicted by evidence, record the boundary and move on.
- If fuzzing produces many candidates, cluster by status, length, and body signature before inspecting.
- If the app is dynamic or JS-heavy, use the browser/headless skill before manual endpoint guessing.
