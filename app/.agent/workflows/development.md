---
description: Development workflow for the Green Servers dashboard application
---

# Green Servers Dashboard

Server metrics dashboard with modern, subtle animations.

## Tech Stack

- Next.js 16 + TypeScript
- Tailwind CSS v4
- Framer Motion
- shadcn/ui

## Important

> [!IMPORTANT] > `npm run dev` is **always running**. Do NOT start it again.

## Animation Notes

Use `as const` for Framer Motion transitions:

```tsx
transition: {
  type: "spring" as const,
  stiffness: 100,
  damping: 15,
}
```

Keep animations **subtle and modern**.
