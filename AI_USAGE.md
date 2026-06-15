# AI_USAGE.md - AI Tools & Debugging Log

## 1. AI Tools & Key Prompts
- **AI Collaborator**: Gemini (Advanced Agentic Coding agent).
- **Primary Prompts**:
  - *"i want to start building frontend apps/web and i want to use the shadcn components"*
  - *"i have already built the backend. I want a login module, group manager, expense splits (equal, unequal, percentage, shares), and import CSV report."*
  - *"make the features folder in components and group the components; components should not exceed 150 lines of code."*

---

## 2. Debugging Log: Three Concrete Cases

Here are three instances where the AI generated incomplete or incorrect code, how it was detected, and how we resolved it:

### Case 1: Missing Shadcn Component (`Checkbox`)
- **What happened**: The AI generated code that imported `Checkbox` from `@/components/ui/checkbox`.
- **How it was caught**: Running `bun run build` failed with:
  ```bash
  Module not found: Can't resolve '@/components/ui/checkbox'
  ```
  Checking the `apps/web/components/ui` folder revealed the Checkbox component was not installed in the workspace.
- **What was changed**: Instead of installing extra NPM packages or configuring new component files, we replaced the custom component with a native HTML element and Tailwind classes:
  - Replaced `<Checkbox>` with `<input type="checkbox" className="h-4 w-4 rounded accent-primary cursor-pointer" />`.
  This fixed the build immediately without bloating node_modules.

---

### Case 2: Tabler Icon Export Mismatch (`IconPiggybank`)
- **What happened**: The AI imported `IconPiggybank` from `@tabler/icons-react` on the group details page.
- **How it was caught**: The build script failed with the following TypeScript error:
  ```bash
  The export IconPiggybank was not found in module @tabler/icons-react. Did you mean to import IconPin?
  ```
- **What was changed**: The project actually uses `lucide-react` rather than `@tabler/icons-react`. We removed the Tabler imports and replaced them with equivalent Lucide icons (e.g., `Wallet`, `Landmark`), resolving the icon compilation block.

---

### Case 3: Next.js SSR Hydration Error with `localStorage`
- **What happened**: In the initial drafts of `api.ts` and `auth-context.tsx`, `localStorage` was accessed directly at the top level to pull the JWT authentication token.
- **How it was caught**: Next.js logged runtime hydration warnings and failed SSR compilation because `localStorage` is a browser-only API, whereas Next.js attempts to pre-render the pages on the server where `localStorage` is undefined.
- **What was changed**: We guarded all `localStorage` access checks with `typeof window !== "undefined"` conditional statements and deferred token check loading inside client-side React `useEffect` hooks, establishing complete compatibility with Next.js SSR.
