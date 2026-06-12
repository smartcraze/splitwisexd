<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# agents.md

## Frontend Development Guidelines

### Design System Rules

- Always prioritize strong frontend design and polished UI/UX.
- Maintain strict visual consistency across the application.
- Use only global CSS variables for colors, spacing, radii, typography, shadows, and transitions.
- Never hardcode design values directly inside components unless explicitly required.
- Reuse existing tokens from `globals.css` or the shared theme layer.

Example:

```css
:root {
  --background: #0f0f0f;
  --foreground: #ffffff;
  --primary: #7c3aed;
  --radius: 12px;
}
```

Correct:

```tsx
className = "bg-background text-foreground rounded-[var(--radius)]";
```

Avoid:

```tsx
className = "bg-black text-white rounded-xl";
```

---

## Component Rules

- Use shadcn/ui components wherever possible.
- Extend shadcn components instead of rebuilding common primitives.
- Keep components composable, clean, and accessible.
- Prefer Radix-powered primitives from shadcn/ui for dialogs, dropdowns, sheets, tooltips, popovers, etc.
- Do not introduce another UI framework unless explicitly requested.

Preferred stack:

- shadcn/ui
- Tailwind CSS
- Radix UI
- Lucide Icons

---

## Styling Principles

- Keep spacing consistent.
- Maintain visual hierarchy using typography and spacing, not random colors.
- Use responsive layouts by default.
- Avoid cluttered interfaces.
- Prioritize readability and accessibility.
- Use subtle animations and transitions only where they improve UX.
- Maintain proper dark mode support if the project supports themes.

---

## Code Quality

- Keep components small and focused.
- Avoid deeply nested JSX.
- Extract reusable UI patterns only after repetition becomes clear.
- Prefer server components when interactivity is unnecessary.
- Avoid unnecessary client-side state.
- Keep props minimal and explicit.

---

## File Structure

Prefer organized feature-based structure:

```txt
components/
features/
app/
lib/
hooks/
types/
```

Group related UI, logic, and hooks together when appropriate.

---

## Forms

- Use react-hook-form for forms.
- Use zod for validation.
- Show clear validation and loading states.
- Keep form UX smooth and predictable.

---

## Data Fetching

- Prefer server-side fetching when possible.
- Avoid unnecessary API calls.
- Handle loading, empty, and error states cleanly.
- add toast

---

## Accessibility

- Ensure keyboard accessibility.
- Use semantic HTML.
- Ensure sufficient color contrast.
- Add labels and aria attributes where necessary.
- Never sacrifice usability for visual aesthetics.

---

## Performance

- Optimize unnecessary re-renders.
- Lazy load heavy components when appropriate.
- Optimize images properly.
- Avoid bloated dependencies.
- Keep bundle size in mind before adding libraries.

---

## Animations

- Keep animations subtle and purposeful.
- Use Framer Motion only when necessary.
- Avoid excessive motion or distracting interactions.

---

## Responsive Design

- Design mobile-first.
- Ensure layouts scale smoothly across devices.
- Test common breakpoints properly.
- Avoid overflow and layout shifts.

---

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

```txt
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## use these skiils

- clean-code
- frontend-design
- next-best-practices
- next-cache-components
- security-reviewer
