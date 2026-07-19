# Founder Above the Fold Single-Project Cabinet
## IKEA / Meccano Assembly Manual Edition

### Box Contents

| Label | Part | Plain-English job | Where it lives | Owner |
|---|---|---|---|---|
| A | Working drawer | The only Finder folder used for product work | `/Users/hella.crypto/Projects/Founder Above the Fold` | Founder |
| B | GitHub drawer | The only remote source and history | `lila-debug/founder-above-the-fold` | Founder |
| C | Main rail | The finished and shared product line | `main` | Founder |
| D | Archive rails | Preserve superseded local history without presenting it as current | `archive/legacy-founderacct`, `archive/legacy-projects-deploy`, `archive/stray-linkedin-capture` | Founder |
| E | Manual rack | Keep product instructions beside the product | `docs/`, `manuals/`, and the in-app manual | Product |
| F | Temporary worktree | Isolate short work without making a new product version | Git-registered temporary path | Codex |
| G | Removal manifest | Names only the redundant drawers approved for the Trash | Cleanup handoff | Founder |

### Mission Control Board

```text
[One Finder drawer]
        |
        v
[One GitHub repository + main rail]
        |
        v
[Web + MCP + iOS + Mac + manuals]
        |
        v
[One product that can be found, tested, sold, and repaired]
```

### Assembly Steps

#### Step 1 - Place the working drawer

Diagram:

```text
[Finder] ---> [Founder Above the Fold] ---> [git main]
```

Do:

1. Open the labelled Finder drawer above.
2. Confirm `git status --short --branch` names `main`.
3. Confirm `origin` points to `lila-debug/founder-above-the-fold`.

Check:

- The working drawer and GitHub drawer show the same current commit after approved pushes.

Avoid:

- Starting work in a folder labelled `v1`, `Official`, `copy`, `app`, or a Desktop export.

#### Step 2 - Insert every product surface

Diagram:

```text
[Web] [MCP] [iOS] [Mac] [Visual Guide] [Manuals] [Launch Media]
   \     |     |     |        |            |          /
                    [ONE DRAWER]
```

Do:

1. Keep runnable product surfaces under `apps/`.
2. Keep portable contracts under `packages/`.
3. Keep instruction panels under `docs/` and `manuals/`.
4. Keep approved launch evidence under `output/` or `outputs/`.

Check:

- A feature and its matching manual panel arrive in the same commit series.

Avoid:

- Creating a separate GitHub repository for a manual, prototype, mobile cabinet, or launch asset that belongs to this product.

#### Step 3 - Isolate temporary work

Diagram:

```text
[main] ---> [temporary branch/worktree] ---> [test] ---> [fit] ---> [remove worktree]
```

Do:

1. Create a branch for unfinished work.
2. Use a registered worktree only when simultaneous isolated work is genuinely needed.
3. Fit accepted work into `main`.
4. Remove the temporary worktree after checking that its commits are reachable.

Check:

- `git worktree list` contains no stale or unexplained worktree.

Avoid:

- Copying the entire folder in Finder as a versioning method.

#### Step 4 - Remove redundant drawers safely

Diagram:

```text
[Inventory] ---> [Preserve unique commits] ---> [Owner approval] ---> [Trash]
```

Do:

1. Compare the commit, remote, status, and unique files in every candidate drawer.
2. Preserve useful unique history on a labelled archive rail.
3. Obtain owner approval for an exact removal list.
4. Move approved folders to a dated Trash holding drawer.

Check:

- The canonical drawer still builds after every redundant folder is removed.
- The Trash holding drawer is recoverable until the owner empties it.

Avoid:

- Deleting a dirty drawer, unpushed commit, secret panel, or unknown artefact on sight.

### Safety Stickers

- [Security] Never place credentials in Git, a manual, an archive branch, screenshots, or chat.
- [Privacy] Inspect captures before preservation; a login screen is not evidence of successful connection.
- [Cost] Cleanup must not create paid services, deployments, or storage without approval.
- [IP] Keep owner-created product assets in the canonical private drawer; label third-party references.
- [Evidence] A tidy folder name is not proof of freshness. Compare commit ancestry, uncommitted changes, builds, and tests.

### Finished-Build Test

- [ ] Exactly one local working drawer remains outside the Trash holding drawer.
- [ ] Exactly one active GitHub repository remains for the product.
- [ ] `main` contains every validated current commit.
- [ ] Superseded unique histories are preserved on labelled archive rails.
- [ ] `git status --short --branch` is clean and aligned with `origin/main`.
- [ ] Lint, typecheck, builds, focused tests, and brand checks pass.
- [ ] The owner can find the working drawer without remembering a version suffix.

---

Based on true events. Sadly.

Canadian Kind, Scottish Strong, Nigerian Proud.

© 2024–2026 Lila Olufemi Abegunrin · REVOLUTIONISING LIFE SINCE 1982™

Founder Above the Fold™ · Trademarks and Patents Pending (CIPO)
