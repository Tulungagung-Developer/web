# Contributing to Tulungagung Dev

Thank you for helping Tulungagung Dev grow. There are three main ways to contribute: publish an article, add a community event, or improve the website code.

For code changes, start with the setup steps in [README.md](README.md). For content changes, make sure the frontmatter matches the schemas below before opening a pull request.

## Contribution workflow

1. Create a branch from the default branch. Use a descriptive name such as `docs/my-article`, `event/community-workshop`, `feat/mobile-navigation`, or `fix/registration-error`.
2. Make one focused contribution per pull request whenever possible.
3. Run the relevant validation commands locally.
4. Open a pull request with a clear summary, the type of contribution, and the checks you ran.
5. Respond to review feedback and keep the branch up to date if requested.

If a contribution involves a significant change in direction, a new dependency, or a change to the registration infrastructure, open an issue or discussion first so the approach can be agreed on before implementation.

## 1. Contribute an article

Articles are Markdown files stored in `src/content/articles/`. The filename becomes the article URL slug, so use lowercase words separated by hyphens, for example `getting-started-with-git.md`.

### Required frontmatter

```yaml
---
title: "A Clear and Useful Article Title"
subtitle: "A short sentence that explains what readers will learn."
excerpt: "A concise summary used on article cards and at the beginning of the article."
author: "Author Name"
role: "Software Engineer"
date: 2026-09-02
readTime: "6 min read"
category: "Engineering"
image: "https://example.com/article-cover.jpg"
featured: false
---
```

The `category` value must be one of:

- `Engineering`
- `Design`
- `Culture`
- `Career`
- `Other`

`subtitle` and `featured` are optional. All other fields are required. The `image` field must be a valid absolute URL to a publicly accessible image.

### Article content guidelines

- Write for people learning, working, or growing in technology.
- Prefer practical explanations, real examples, and clear headings.
- Explain unfamiliar terms and include links to reliable references when useful.
- Use Markdown code fences for code and keep examples reproducible where possible.
- Do not publish confidential information, personal data, or material that you do not have permission to use.
- Use an image you own or have permission to publish, and provide appropriate attribution when required.
- Proofread the title, excerpt, author information, and date before submitting.

After adding the file, run:

```bash
pnpm check
pnpm format:check
```

## 2. Contribute an event

Events are Markdown files stored in `src/content/events/`. Use a lowercase, hyphen-separated filename such as `intro-to-web-development-workshop.md`.

### Required frontmatter

```yaml
---
title: "Introduction to Web Development"
subtitle: "A beginner-friendly session for the community."
excerpt: "Learn the fundamentals, ask questions, and meet other people who are starting to build for the web."
date: 2026-10-10
endDate: 2026-10-10
location: "Tulungagung"
venue: "Community Hall"
registrationUrl: "https://example.com/register"
category: "Workshop"
image: "https://example.com/event-cover.jpg"
featured: false
---
```

The `category` value must be one of:

- `Meetup`
- `Workshop`
- `Online`
- `Conference`
- `Other`

`subtitle`, `endDate`, `venue`, `registrationUrl`, and `featured` are optional. The event `date`, `location`, `category`, and `image` are required. `registrationUrl` and `image`, when provided, must be valid absolute URLs.

### Event content guidelines

Include enough information for someone to decide whether to attend:

- What the event is about and who it is for.
- Date, time, location, or online meeting details.
- Agenda, speakers, facilitators, or topics when available.
- Registration instructions, capacity, prerequisites, and what attendees should bring.
- Organizer or contact information where appropriate.
- Accessibility or participation notes when relevant.

The events page automatically separates upcoming and past events. The detail page uses `endDate`, when present, to determine whether an event has finished. Add an event only when its public details are ready, because every Markdown file merged into the default branch is eligible to be displayed.

After adding the file, run:

```bash
pnpm check
pnpm format:check
```

## 3. Contribute code

Code contributions include bug fixes, accessibility improvements, performance work, content tooling, and new product features.

### Development expectations

- Follow the existing Astro, TypeScript, React, and Tailwind patterns.
- Keep server-only secrets and Google credentials out of client-side code.
- Prefer the existing `@/*` path alias for imports from `src/`.
- Keep changes focused and avoid unrelated formatting or refactors.
- Explain the reason for adding a new dependency and use the existing dependency when it already solves the problem.
- Do not manually edit generated files. If Cloudflare bindings change, use `pnpm generate-types` to regenerate the Wrangler types.
- Consider responsive behavior, keyboard navigation, semantic HTML, and reduced-motion preferences for UI changes.

### Validation

Run the checks that match your change. For a complete code contribution, run:

```bash
pnpm check
pnpm lint
pnpm format:check
pnpm build
```

If the change affects the registration form, queue, Google Sheets integration, or Cloudflare Worker, also test the relevant flow with the required local secrets and bindings. Never use production credentials in a pull request or commit them to the repository.

For visual changes, include screenshots or a short screen recording in the pull request. For behavior changes, describe how reviewers can reproduce and verify the result.

## Pull request checklist

Before requesting review, confirm that:

- The pull request explains what changed and why.
- The contribution type is identified: article, event, or code.
- Content frontmatter is valid, if applicable.
- `pnpm check` passes.
- `pnpm lint` and `pnpm format:check` pass for code changes.
- `pnpm build` passes for changes that affect routes, content, integrations, or deployment.
- UI changes have been checked at mobile and desktop sizes.
- No secrets, generated build output, or unrelated changes are included.

Maintainers may ask for revisions to improve clarity, accessibility, correctness, security, or consistency with the community's goals.
