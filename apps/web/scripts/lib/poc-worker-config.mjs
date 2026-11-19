// Code-structure half of wrangler.toml for the PoC artefact (operated-apps-poc formats/artefact.md).

export const ALLOWED_KEYS = [
  'main',
  'compatibility_date',
  'compatibility_flags',
  'durable_objects',
  'migrations',
  'workflows',
  'ai',
  'triggers',
  'assets',
  'placement',
  'observability',
  'limits',
  'queues',
]

const COPIED_KEYS = ALLOWED_KEYS.filter(
  key => !['main', 'workflows', 'ai', 'assets', 'queues'].includes(key)
)

function workflows(entries) {
  return entries.map(({ binding, class_name }) => {
    if (!binding) throw new Error(`Workflow ${class_name ?? '(unnamed)'} has no binding`)
    return { binding, class_name }
  })
}

function assets({ directory: _directory, ...rest }) {
  return rest
}

// A dead-letter queue has no producer in wrangler.toml; its binding is my-app's predicate binding.
const DEAD_LETTER_BINDINGS = { 'my-app-jobs-dlq': 'JOBS_DLQ' }

function deadLetterBinding(name) {
  const binding = DEAD_LETTER_BINDINGS[name]
  if (!binding) throw new Error(`Dead-letter queue ${name} has no binding in DEAD_LETTER_BINDINGS`)
  return binding
}

function queueConsumers(queues) {
  const bindingByQueue = new Map((queues.producers ?? []).map(p => [p.queue, p.binding]))
  return (queues.consumers ?? []).map(consumer => {
    const binding = bindingByQueue.get(consumer.queue)
    if (!binding) throw new Error(`Queue consumer ${consumer.queue} has no producer binding`)
    const named = { ...consumer, queue: binding }
    if (consumer.dead_letter_queue !== undefined) {
      named.dead_letter_queue = deadLetterBinding(consumer.dead_letter_queue)
    }
    return named
  })
}

/**
 * @param {Record<string, any>} wrangler parsed wrangler.toml
 * @returns {Record<string, any>} the worker-config.json fragment
 */
export function workerConfig(wrangler) {
  const config = { main: 'worker.js' }
  for (const key of COPIED_KEYS) {
    if (wrangler[key] !== undefined) config[key] = wrangler[key]
  }
  if (wrangler.workflows) config.workflows = workflows(wrangler.workflows)
  if (wrangler.ai) config.ai = { binding: wrangler.ai.binding }
  if (wrangler.assets) config.assets = assets(wrangler.assets)
  if (wrangler.queues?.consumers) config.queues = { consumers: queueConsumers(wrangler.queues) }
  return config
}
