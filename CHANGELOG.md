# Changelog

Releases of this app. The kit releases it has absorbed are recorded in `.rocketflare.json`
(`kit`, `history`) and described in `docs/upgrades/`.

## 0.7.0

- The release banner is sky blue: release "Sky".

## 0.6.0

- The release banner is lime: release "Lime".
- Built on kit 0.40.0 (from 0.33.0) and the analytics plugin 3.12.0. The jobs queue has a
  dead-letter queue, which the PoC artefact names by its `JOBS_DLQ` binding.

## 0.5.0

- The release banner is violet: release "Violet".
- Removes 0.4.0's `v2` migration for `ReleaseCounter`. It was never applied: the reconciler
  refused 0.4.0.

## 0.4.0

- The release banner is crimson: release "Crimson".
- A Durable Object migration (`v2`) creates `ReleaseCounter`, a class nothing binds or exports.
  The reconciler refuses this release (`worker_config_refused`); 0.5.0 removes the migration.

## 0.3.0

- The release banner is teal: release "Teal".

## 0.2.0

- A banner at the bottom of every page names the release: version, name and colour.
