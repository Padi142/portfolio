---
name: AgentSync
description: One CLAUDE.md / AGENTS.md for all your machines and coding agents
type: Dev tool
technologies:
  - TypeScript
  - TanStack Start
  - Cloudflare
  - D1
  - oRPC
  - WorkOS
  - CLI
github: https://github.com/Padi142/agentsync
link: https://agentsync.krejzac.cz
order: 6
---

## TLDR
A tool that keeps the global instructions for my coding agents, like `~/.claude/CLAUDE.md`, `~/.codex/AGENTS.md` and `~/.pi/agent/AGENTS.md`, **the same on every computer** I work on. You write one **Template** on the web and every registered machine fills in its own details and writes the result into its agents' files. A small hook runs every time an agent session starts, so the instructions are always up to date without me thinking about it. It supports [Claude Code](https://code.claude.com/), [Codex](https://developers.openai.com/codex) and [pi](https://github.com/badlogic/pi-mono) out of the box. The web app runs on [Cloudflare Workers](https://workers.cloudflare.com/) with [D1](https://developers.cloudflare.com/d1/) as a database, built with [TanStack Start](https://tanstack.com/start) and a typed [oRPC](https://orpc.unnoq.com/) API. You can try it at [agentsync.krejzac.cz](https://agentsync.krejzac.cz).

<figure>
  <img src="/projects/agentsync/editor.webp" alt="AgentSync Template editor with Markdown and {{ }} Expressions on the left and a rendered preview of ~/.claude/CLAUDE.md for the Laptop machine on the right." width="2880" height="1800" loading="lazy" />
  <figcaption>The Template editor with a live preview of what the Laptop writes for Claude Code.</figcaption>
</figure>

## The why?

I use coding agents on a bunch of different machines. My laptop, my desktop, a server I SSH into and sometimes a university GPU node. Over time, each one of them ended up with its own slightly different `CLAUDE.md`. I would add a rule like **"use pnpm, not npm"** on my laptop, then wonder why the agent on my server keeps running `npm install`. Copying the file around by hand worked for about a week, then I forgot about it.

On top of that, I don't use just one agent. Claude Code reads `CLAUDE.md`, Codex and pi read `AGENTS.md`, each from a different folder. So it was not one file on four machines, it was **three files on four machines**, all drifting apart.

My first idea was to just put the files into a dotfiles repo and symlink them. But that has a problem, the files are not supposed to be identical. My server runs Linux, my laptop runs macOS, some machines have a GPU and some don't, and I want to tell the agent about it. So I have decided to make a proper tool for it, with a server that holds the one true copy and a CLI that renders it for each machine.

## One Template, many Machines

The core idea is that there is exactly **one Template** per user, stored on the server. The files on disk are just rendered output and are never the source of truth. The Template is ordinary Markdown, plus a few **Expressions** in `{{ }}` for the parts that differ from machine to machine:

```md
# My instructions

I am working on {{machine.nickname}}, running {{machine.os}}.
My editor is {{editor}}.

{{if agent == "codex"}}
Run the tests before you say you're done.
{{else}}
Use the agentsync skill when you change these instructions.
{{end}}
```

<p align="center">
  <small>Built-in variables come from the machine itself, others like editor are set per machine.</small>
</p>

I have intentionally kept the grammar tiny. Variables, `if`/`else` and that's it. No loops, no `and`/`or`, no filters. A line that holds only a block tag disappears completely, so the output does not end up full of blank lines. The whole grammar lives in its own package with **zero dependencies**, so the exact same code renders the files in the CLI, validates saves on the server and powers the live preview in the web editor. If you make a typo like `{{machine.arch}}`, the editor shows the line and column right away instead of the agent receiving garbage.

The web editor shows a preview for each machine and each agent side by side, and the text that came from a variable is underlined, so you can see what changes from one computer to the next. Each machine then has its own page with its variables, the files it writes into and a history of changes.

<figure>
  <img src="/projects/agentsync/machine.webp" alt="AgentSync machine page for Laptop showing its Variables, its Targets for Claude Code, Codex and pi, variable history and CLI commands." width="2880" height="1800" loading="lazy" />
  <figcaption>A machine page with its variables and Targets.</figcaption>
</figure>

## The hook (and a fun timing problem)

Registering a machine is one command. `agentsync init` signs you in using the [WorkOS](https://workos.com/) device flow (the same thing as when you log in to a TV app with a code from your phone), detects which agents are installed and adds a `SessionStart` hook to each of them. When a session starts, the hook fetches the Template, renders it and writes the file.

The hook was built to **never get in the way**. It never prompts, waits at most 2 seconds for the server, keeps the existing files when it can't reach it and always exits successfully. If something needs attention, it prints a single `AgentSync: ...` line that the agent sees in its context.

Then I have found out something annoying. Claude Code and Codex **read their instructions file before the hook can change it**. So when the hook writes a new version, the session that is just starting still has the old one and only the next session gets the update. I have tested this on both of them by making a hook that rewrites the file and checking what the session actually saw. Both answered from the old file. pi on the other hand awaits its extensions before it reads `AGENTS.md`, so for pi I have written a small extension instead of a hook and the update applies right away. For the other two, the hook's line tells the agent which file got updated, so it can re-read it if it matters.

## Drift and Conflicts

Syncing text between machines is easy until two of them disagree. There are two cases.

**Drift** is when you edit `~/.claude/CLAUDE.md` by hand. AgentSync owns that file, but silently overwriting your edit would be pretty rude. So `sync` stops and asks what to do. You can copy the change into the Template, overwrite it (the old file is kept as a backup) or just leave it for later. The CLI remembers the exact text it last wrote, so the diff shows only your hand edit, not changes that came from other machines.

**Conflicts** happen when two edits of the Template overlap, for example from the web and from another machine at the same time. Every save carries the revision it started from, and if the Template changed in the meantime, the save is rejected. Instead of throwing your edit away, the server merges it line by line and keeps it as a Conflict with the classic `<<<<<<<` markers only on the lines that actually clash. You can resolve it on the web by picking a side for each region, or in the terminal. Meanwhile, all machines keep getting the current Template, so nothing breaks.

<figure>
  <img src="/projects/agentsync/conflict.webp" alt="AgentSync Conflict page with the merged Template on the left, the clashing lines marked, and a side by side choice between Your edit and Current Template on the right." width="2880" height="1800" loading="lazy" />
  <figcaption>Resolving a Conflict on the web. Only the lines that actually clash need a decision.</figcaption>
</figure>

## Made for agents too

Since this is a tool for agents, I wanted the agents to be able to use it themselves. Every command has a `--json` flag and meaningful **exit codes** (`3` for Drift, `4` for a Conflict, `5` for not being signed in), so an agent can branch on them. `init` also installs an **agentsync skill**, which teaches the agent the commands, the Template syntax and how to resolve Conflicts. And when the CLI runs into Drift or a Conflict in an interactive terminal, it can hand the whole thing over to Claude Code, Codex or pi with a prompt.

The setup page on the web even has a prompt you can paste into your agent and it registers the machine for you. There is a small catch, an agent's shell only shows output once a command exits, so it would never see the login code. For this, there is `init --no-wait`, which prints the code and exits, and the next `init` continues where it left off.

## Try it!!

The web app is live at [agentsync.krejzac.cz](https://agentsync.krejzac.cz). The CLI isn't on npm yet (turns out the `agentsync` name there already belongs to some unrelated package), so for now you build it from the repo:

```bash
git clone https://github.com/Padi142/agentsync.git ~/agentsync
cd ~/agentsync
pnpm install && pnpm build
(cd packages/cli && npm link)
agentsync init --server https://agentsync.krejzac.cz
```

On your first machine, your existing instructions file becomes the Template, so nothing you have already written gets lost.
