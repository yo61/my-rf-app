/**
 * The release banner names the release the artefact was built from, so a person can see which
 * release a deployed environment runs. The `config` project: no database.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { RELEASE } from '@/ui/release'

const ROOT_PACKAGE = path.resolve(__dirname, '../../../../package.json')

describe('RELEASE', () => {
  it('carries the root package.json version, which the release tag must match', () => {
    const { version } = JSON.parse(readFileSync(ROOT_PACKAGE, 'utf8')) as { version: string }
    expect(RELEASE.version).toBe(version)
  })
})
