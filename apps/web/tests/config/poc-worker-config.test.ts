// The code-structure half of the operated-apps PoC artefact (operated-apps-poc formats/artefact.md).
import { readFileSync } from 'node:fs'
import path from 'node:path'
import TOML from '@iarna/toml'
import { describe, expect, it } from 'vitest'
import { ALLOWED_KEYS, workerConfig } from '../../scripts/lib/poc-worker-config.mjs'

const wrangler = TOML.parse(
  readFileSync(path.join(__dirname, '../../wrangler.toml'), 'utf8')
) as Record<string, unknown>

describe('workerConfig, from the real wrangler.toml', () => {
  const config = workerConfig(wrangler)

  it('keeps only the allowed keys', () => {
    for (const key of Object.keys(config)) expect(ALLOWED_KEYS).toContain(key)
  })

  it('points main at the dry-run bundle', () => {
    expect(config.main).toBe('worker.js')
  })

  it('drops every per-environment setting', () => {
    for (const key of [
      'name',
      'vars',
      'kv_namespaces',
      'r2_buckets',
      'hyperdrive',
      'routes',
      'account_id',
    ]) {
      expect(config).not.toHaveProperty(key)
    }
  })

  it('keeps workflows without their per-environment name', () => {
    expect(config.workflows).toEqual([
      { binding: 'AGENT_RUN_WORKFLOW', class_name: 'AgentRunWorkflow' },
    ])
  })

  it('keeps assets without a directory', () => {
    expect(config.assets).not.toHaveProperty('directory')
    expect(config.assets).toMatchObject({ binding: 'ASSETS' })
  })

  it('names queue consumers by their producer binding, keeping their settings', () => {
    expect(config.queues).toEqual({
      consumers: [
        {
          queue: 'JOBS_QUEUE',
          max_batch_size: 10,
          max_batch_timeout: 5,
          max_retries: 3,
          retry_delay: 60,
        },
      ],
    })
  })

  it('keeps Durable Objects, their migrations and the AI binding', () => {
    expect(config.durable_objects).toEqual({
      bindings: [{ name: 'NOTIFICATIONS_HUB', class_name: 'NotificationsHub' }],
    })
    expect(config.migrations).toEqual([{ tag: 'v1', new_sqlite_classes: ['NotificationsHub'] }])
    expect(config.ai).toEqual({ binding: 'AI' })
  })
})

describe('workerConfig refusals', () => {
  it('refuses a consumer whose queue has no producer binding', () => {
    expect(() =>
      workerConfig({ main: 'src/worker.ts', queues: { consumers: [{ queue: 'orphan' }] } })
    ).toThrow(/orphan.*no producer/)
  })

  it('refuses a workflow without a binding', () => {
    expect(() =>
      workerConfig({ main: 'src/worker.ts', workflows: [{ name: 'x', class_name: 'X' }] })
    ).toThrow(/binding/)
  })

  it('works with no queues, workflows or assets', () => {
    expect(workerConfig({ main: 'src/worker.ts', compatibility_date: '2026-06-01' })).toEqual({
      main: 'worker.js',
      compatibility_date: '2026-06-01',
    })
  })
})
