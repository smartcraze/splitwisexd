<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

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

## use these skiils

- clean-code
- frontend-design
- next-best-practices
- next-cache-components
- security-reviewer
