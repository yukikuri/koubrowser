import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

function findJsonFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      return findJsonFiles(path)
    }
    return entry.isFile() && entry.name.endsWith('.json') ? [path] : []
  })
}

describe('map json check', () => {
  it('resources/map json files can be parsed', () => {
    const mapDir = resolve(process.cwd(), 'resources/map')
    const jsonFiles = findJsonFiles(mapDir).sort()

    expect(jsonFiles.length).toBeGreaterThan(0)

    jsonFiles.forEach((file) => {
      const content = readFileSync(file, 'utf8')
      expect(() => JSON.parse(content), file).not.toThrow()
    })
  })
})
