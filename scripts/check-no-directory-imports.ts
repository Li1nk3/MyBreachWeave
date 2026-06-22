import { existsSync, readdirSync, statSync } from "fs"
import { dirname, extname, resolve } from "path"

const SOURCE_ROOTS = ["apps", "packages", "scripts"]
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx"])
const STATIC_IMPORT_RE = /\b(?:import|export)\s+(?:type\s+)?(?:[^\n'"]*?\s+from\s+)?["']([^"']+)["']/g
const DYNAMIC_IMPORT_RE = /\bimport\(\s*["']([^"']+)["']\s*\)/g

function collectSourceFiles(root: string): string[] {
    const files: string[] = []
    if (!existsSync(root)) return files

    function walk(dir: string) {
        for (const entry of readdirSync(dir)) {
            if (entry === "node_modules" || entry === "dist" || entry === "build") continue
            const path = resolve(dir, entry)
            const stat = statSync(path)
            if (stat.isDirectory()) {
                walk(path)
            } else if (SOURCE_EXTENSIONS.has(extname(path))) {
                files.push(path)
            }
        }
    }

    walk(root)
    return files
}

function importSpecifiers(source: string): string[] {
    const specs: string[] = []
    for (const match of source.matchAll(STATIC_IMPORT_RE)) {
        if (match[1]) specs.push(match[1])
    }
    for (const match of source.matchAll(DYNAMIC_IMPORT_RE)) {
        if (match[1]) specs.push(match[1])
    }
    return specs
}

const projectRoot = resolve(import.meta.dir, "..")
const violations: string[] = []

for (const root of SOURCE_ROOTS) {
    for (const file of collectSourceFiles(resolve(projectRoot, root))) {
        const source = await Bun.file(file).text()
        for (const specifier of importSpecifiers(source)) {
            if (!specifier.startsWith(".")) continue
            const target = resolve(dirname(file), specifier)
            if (existsSync(target) && statSync(target).isDirectory()) {
                violations.push(`${file}: imports directory ${JSON.stringify(specifier)}`)
            }
        }
    }
}

if (violations.length > 0) {
    console.error(violations.join("\n"))
    process.exit(1)
}
