# HW-CODEX-WORLD-02 — P1 triage

**PARTIAL / NEEDS DESIGN DECISION** · Baseline `f23e5134e6bdd00e4e348269eeb1a114f6dc0d93`. Chromium private QA exercised all four Owner coordinates through the actual developer teleport path.

| Input | Runtime result |
| --- | --- |
| Ancient Rune Puzzle (3380,260) | Unchanged; no overlapping enabled collider in this fixture. |
| Abyssal Chasm (2240,-700) | Unchanged; historical fallback (2240,-720) did not trigger. |
| Whispering Grove Sanctum (1600,-420) | Original point identified as Deep Forest before teleport. Scan moved to (1589,-409), beyond the requested zone east bound X=1440. Historical (1600,-580) fallback did not trigger. |
| Veil Origin Cavern (800,1500) | Unchanged; no overlapping enabled collider in this fixture. |

Source still has an unchecked fallback if both searches fail. The reproduced coordinate mismatch concerns developer teleport to an unfinished zone. Production blocker at that point is unconfirmed. The competition smoke covered natural Fog Crossing → Bellhollow → Outer Woods and Continue at a valid checkpoint. A broader production Save/Continue policy for invalid or contradictory zone coordinates requires deciding whether to refuse load, keep the saved zone or relocate to a different zone. No speculative map, collider, save or production change was made. Trace at `scratch/hw-codex-world-02/dev-owner-coordinates/runtime.json`. Placeholder entries remain gated.
