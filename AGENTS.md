# AGENTS.md

# SplitwiseXD

A simplified Splitwise-inspired expense sharing application focused on correctness, clean architecture, and collaborative financial tracking.

This project is intentionally scoped as a practical MVP that can be implemented quickly while still maintaining strong engineering fundamentals.

The goal is not to perfectly clone Splitwise.

The goal is to build a reliable shared-expense system with:

- accurate balance calculations
- clean relational data modeling
- understandable business logic
- realtime collaboration
- maintainable architecture

---

# 1. Product Overview

SplitwiseXD allows users to:

- create groups
- add members to groups
- track shared expenses
- split expenses in multiple ways
- calculate balances between users
- settle debts
- discuss expenses through realtime comments

The application behaves like a shared debt ledger between users.

Every transaction changes balances between people.

The core product problem being solved:

> "Who owes whom, and how much?"

---

# 2. Core Product Philosophy

## Simplicity First

Minimum code that solves the problem.
Nothing speculative.

- No features beyond what was asked.
- No unnecessary abstractions.
- No premature optimization.
- No enterprise complexity.
- No hidden business logic.

Every feature should be understandable in isolation.

---

# 3. Core Features

## Authentication

Users can:

- register
- login
- logout

Authentication exists only to support shared financial tracking.

No social auth.
No advanced profile system.

---

## Groups

Users can:

- create groups
- join groups
- add members
- remove members
- view group balances

A group represents a shared financial space.

Examples:

- Trip
- Flatmates
- Office team
- Friends outing

---

## Expenses

Users can:

- create expenses
- edit expenses
- delete expenses
- attach descriptions
- choose who paid
- choose participants

Each expense stores:

- total amount
- payer
- participants
- split configuration

---

# 4. Expense Split Types

The system supports four split methods.

## Equal Split

Expense is divided equally among participants.

Example:
₹1200 split among 4 people.

Each owes:
₹300

---

## Unequal Split

Custom exact amounts per participant.

Example:

- A owes ₹500
- B owes ₹300
- C owes ₹200

---

## Percentage Split

Expense divided using percentages.

Example:

- A = 50%
- B = 30%
- C = 20%

---

## Share-Based Split

Expense divided using weighted shares.

Example:

- A = 2 shares
- B = 1 share

A pays twice as much as B.

---

# 5. Balance System

The balance engine is the heart of the application.

The application tracks directional debt between users.

Example:

Rahul owes Suraj ₹300

Internally:

Rahul -> Suraj = 300

Balances are derived from:

- expenses
- settlements

The system must always maintain financial consistency.

Core invariant:

Total paid = total owed

---

# 6. Settlements

Users can settle debts manually.

Example:

- Rahul pays Suraj ₹500

This reduces the outstanding balance between them.

Settlements never delete historical expenses.

Financial history remains immutable.

---

# 7. Expense Comments

Every expense supports realtime discussion.

Users can:

- comment on expenses
- discuss payment details
- clarify splits

Comments update in realtime.

This is lightweight collaboration, not a full chat system.

---

# 8. Architecture Principles

## Relational Data Modeling

The application uses normalized relational structures.

Core entities:

- users
- groups
- group members
- expenses
- expense participants
- settlements
- comments

Relationships are explicit and queryable.

---

## Deterministic Business Logic

Balance calculations should always produce the same result for the same input.

No hidden mutations.
No unpredictable state.

Business rules must stay centralized and testable.

---

## Append-Only Financial History

Historical records should remain preserved.

Updates should not destroy auditability.

Settlements reduce balances but do not erase expense history.

---

# 9. Realtime Scope

Realtime functionality is intentionally minimal.

Realtime is only used for:

- expense comments
- live balance refreshes

No notifications.
No presence system.
No typing indicators.

---

# 10. UI Philosophy

The UI should prioritize:

- clarity
- speed
- minimal clicks
- understandable balances

The interface should feel operational rather than decorative.

Users should instantly understand:

- what they owe
- who owes them
- recent activity
- group state

---

# 11. Non-Goals

The following are intentionally excluded from scope:

- recurring expenses
- OCR receipt scanning
- multi-currency support
- analytics dashboards
- notifications
- advanced permissions
- offline sync
- AI expense parsing
- payment gateway integration
- mobile application

The focus is correctness over feature quantity.

---

# 12. Engineering Priorities

Priority order:

1. Correct balances
2. Stable data model
3. Clear business logic
4. Reliable CRUD flows
5. Realtime collaboration
6. UI polish

---

# 13. Code Expectations

Every implementation should:

- be explicit
- be readable
- avoid over-abstraction
- prioritize maintainability
- minimize hidden magic

If a simpler solution exists, prefer it.

---

# 14. Success Criteria

The project is successful if:

- balances are correct
- expense flows work reliably
- settlements reduce debts correctly
- group collaboration feels smooth
- the architecture is understandable
- another engineer can extend the system easily

This project should feel like a clean engineering MVP rather than a hacked demo.

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

<STRICT>FOLLOW THESE INSTRUCTION AND IF YOU FEEL DO ASK ME </STRICT>

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
