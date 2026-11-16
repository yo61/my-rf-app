# Issue tracker: Linear

Issues and specs for this repo live in Linear workspace `my-rocketflare-app`
(https://linear.app/my-rocketflare-app), team `MRA` (identifiers `MRA-123`). Use the
`mcp__linear-yo61-my-app__*` tools for every operation — never another `linear-*` server,
they are other workspaces.

## Conventions

- **Create an issue**: `save_issue` with `team: "MRA"`, `title`, `description` (Markdown, real
  newlines). Check `list_issues` with `query` first to avoid duplicates.
- **Read an issue**: `get_issue <id>`, then `list_comments <id>` — `get_issue` omits the discussion.
- **List issues**: `list_issues` with `team: "MRA"` and `label` / `state` / `assignee` filters;
  follow `cursor` while `hasNextPage`.
- **Sub-issue**: `save_issue` with `parentId: "<parent>"`.
- **Comment**: `save_comment`.
- **Labels**: `addLabels` / `removeLabels` on `save_issue` — never `labels`, which replaces the set.
- **Close**: `save_issue` with `state: "Done"` (or `"Canceled"` for wontfix), after a comment
  saying why.
- Agent-only detail (plans, file lists, logs) goes in a trailing `+++ Agent notes` … `+++` section.

## Pull requests as a triage surface

**PRs as a request surface: no.** _(This repo has no remote; `/triage` reads this flag.)_

## When a skill says "publish to the issue tracker"

Create a Linear issue in team `MRA`.

## When a skill says "fetch the relevant ticket"

Read it as in **Read an issue** above.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a single issue with **sub-issues** as tickets.

- **Map**: an issue labelled `wayfinder:map`, holding the Notes / Decisions-so-far / Fog body.
- **Child ticket**: `save_issue` with `parentId: "<map>"` and a `wayfinder:<type>` label
  (`research` / `prototype` / `grilling` / `task`). Once claimed, assigned to the driving dev.
- **Blocking**: Linear's native relations — `save_issue` with `blockedBy: ["MRA-n"]`. A ticket is
  unblocked when every blocker is in a completed or canceled state.
- **Frontier query**: `list_issues` with `parentId: "<map>"` and an open state, drop any with an
  assignee or an open blocker (check each with `get_issue`), first in map order wins.
- **Claim**: `save_issue` with `assignee: "me"`, the session's first write.
- **Resolve**: `save_comment` with the answer, `save_issue` `state: "Done"`, then append a gist +
  link to the map's Decisions-so-far (`save_issue` `patch` on the map).
