<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes: APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Guidelines

- Do not use the em dash character ("—") anywhere in text, documentation, code, or responses. Use regular hyphens ("-"), colons, or rephrase instead.
- Do not write comments in code. Prefer clear names and structure over comments.
- Follow SOLID principles in all code:
  - **S**ingle Responsibility: each module/class/function has one reason to change
  - **O**pen/Closed: open for extension, closed for modification
  - **L**iskov Substitution: subtypes must be substitutable for their base types
  - **I**nterface Segregation: prefer small, focused interfaces over large ones
  - **D**ependency Inversion: depend on abstractions, not concretions
- Keep React components thin. Do not grow large monolithic component files.
  - Extract reusable logic into dedicated hooks (`useSomething.ts`) in a nearby `hooks/` folder or co-located file.
  - Extract pure helpers, constants, and types into separate files (`helpers/`, `utils/`, `types.ts`, `constants.ts`) - not inside the component file.
  - Prefer composing smaller presentational components over one long JSX tree.
  - A component file should mostly wire props, hooks, and UI - not own business logic, form orchestration, or data-mapping helpers.
