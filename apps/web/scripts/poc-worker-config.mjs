// Usage: node scripts/poc-worker-config.mjs <wrangler.toml> <worker-config.json>
import { readFileSync, writeFileSync } from 'node:fs'
import TOML from '@iarna/toml'
import { workerConfig } from './lib/poc-worker-config.mjs'

const [tomlPath, outPath] = process.argv.slice(2)
if (!tomlPath || !outPath) {
  console.error('usage: poc-worker-config.mjs <wrangler.toml> <worker-config.json>')
  process.exit(2)
}
const config = workerConfig(TOML.parse(readFileSync(tomlPath, 'utf8')))
writeFileSync(outPath, `${JSON.stringify(config, null, 2)}\n`)
console.log(`Wrote ${outPath}: ${Object.keys(config).join(', ')}`)
