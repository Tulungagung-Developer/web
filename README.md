# Tulungagung Dev

The Tulungagung Dev website is the community's home for articles, events, and member registration. It is built as an Astro server application and deployed to Cloudflare Workers.

## Features

- Publish community articles from Markdown content files.
- Publish upcoming and past events with structured metadata.
- Collect member registrations through a validated form.
- Process registrations asynchronously with a Cloudflare Queue.
- Append registration data to Google Sheets through a service account.

## Tech stack

- [Astro](https://astro.build/) 7 with the Cloudflare adapter
- TypeScript
- React islands for interactive UI
- Markdown/MDX content support
- Tailwind CSS 4
- Cloudflare Workers, Assets, and Queues
- Google Sheets API
- pnpm 11.17.0

## Requirements

Install the following before starting development:

- Node.js LTS compatible with the versions used by Astro 7 and Wrangler.
- pnpm 11.17.0. The required package-manager version is declared in `package.json`.
- Git.

Google Cloud and Cloudflare credentials are only required when you need to test or deploy the member-registration flow:

- A Google Cloud project with the Google Sheets API enabled.
- A Google service account that can edit the destination spreadsheet.
- A Cloudflare account with Wrangler authentication for deployment.

## Local setup

1. Clone the repository and enter the project directory:

   ```bash
   git clone git@github.com:alfanjauhari/tulungagung-dev.git
   cd tulungagung-dev
   ```

2. Enable Corepack and activate the repository's pnpm version:

   ```bash
   corepack enable
   corepack prepare pnpm@11.17.0 --activate
   ```

3. Install dependencies:

   ```bash
   pnpm install
   ```

4. Create a local environment file:

   ```bash
   cp .env.example .env
   ```

5. Fill in the values in `.env` as described below.

6. Start the development server:

   ```bash
   pnpm dev
   ```

The site is normally available at `http://localhost:4321`.

## Environment variables

| Variable                      | Required                    | Description                                                                                  |
| ----------------------------- | --------------------------- | -------------------------------------------------------------------------------------------- |
| `SPREADSHEET_ID`              | Yes                         | The Google Spreadsheet ID. It is the value between `/d/` and `/edit` in the spreadsheet URL. |
| `SPREADSHEET_RANGE`           | No                          | The target sheet and range for appended rows. Defaults to `Sheet1!A:K`.                      |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | For registration processing | The service-account JSON object. It must contain at least `client_email` and `private_key`.  |

The variables are server-only secrets. Never commit `.env`, service-account files, private keys, or real credentials. The repository's `.gitignore` already excludes the common local secret files.

### Google Sheets setup

To test member registration end to end:

1. Enable the Google Sheets API in Google Cloud.
2. Create a service account and obtain its JSON credentials.
3. Share the destination spreadsheet with the service account's `client_email` and grant it Editor access.
4. Set `SPREADSHEET_ID` to the spreadsheet ID.
5. Set `SPREADSHEET_RANGE` to the correct tab and range, for example `Sheet1!A:K`.
6. Put the service-account JSON in `GOOGLE_SERVICE_ACCOUNT_JSON`. Keep the value as valid JSON; newline characters in the private key must be escaped when the JSON is stored on one line.

The worker appends these values in order: submission timestamp, full name, email, WhatsApp number, domicile, occupation, interest, experience level, motivation, and consent.

## Package scripts

| Command               | Purpose                                         |
| --------------------- | ----------------------------------------------- |
| `pnpm dev`            | Start the Astro development server.             |
| `pnpm build`          | Create a production build in `dist/`.           |
| `pnpm preview`        | Preview the production build locally.           |
| `pnpm check`          | Run Astro's type and content checks.            |
| `pnpm lint`           | Run Oxlint.                                     |
| `pnpm lint:fix`       | Format supported files with Oxfmt's fix mode.   |
| `pnpm format`         | Format the repository with Oxfmt.               |
| `pnpm format:check`   | Check formatting without changing files.        |
| `pnpm generate-types` | Run `astro sync` and regenerate Wrangler types. |

Before opening a pull request, run at least:

```bash
pnpm check
pnpm lint
pnpm format:check
pnpm build
```

## Content

Articles live in `src/content/articles/`, and events live in `src/content/events/`. Both collections are validated by `src/content.config.ts`. Every `.md` file in these directories is treated as publishable content, so keep unfinished drafts out of the default branch.

See [contribution.md](contribution.md) for the required frontmatter and the contribution workflow for articles, events, and code.

## Deployment

The application is configured for Cloudflare Workers in `wrangler.jsonc`. The configuration includes:

- The Worker entry point at `src/worker.ts`.
- Static assets from `dist/`.
- The `registration-spreadsheet` Queue for member-registration processing.
- Node.js compatibility flags.

After authenticating Wrangler and configuring the target Cloudflare account:

```bash
pnpm build
pnpm exec wrangler deploy
```

Set production secrets through Wrangler or the Cloudflare dashboard. For example:

```bash
pnpm exec wrangler secret put SPREADSHEET_ID
pnpm exec wrangler secret put SPREADSHEET_RANGE
pnpm exec wrangler secret put GOOGLE_SERVICE_ACCOUNT_JSON
```

The `registration-spreadsheet` queue must be available in the target Cloudflare account, and the production service account must have Editor access to the configured spreadsheet.

## Project structure

```text
src/
├── actions/       Server actions, including member registration.
├── components/    Reusable Astro and React UI components.
├── content/       Markdown articles and events.
├── islands/       Client-side React interactions.
├── layouts/       Shared page layouts.
├── lib/           Validation, dates, Google Sheets, and queue helpers.
├── pages/         Astro routes.
└── worker.ts      Cloudflare Worker fetch and queue handlers.
```

## Contributing

Contributions are welcome. You can contribute an article, submit an event, or improve the codebase. Read [contribution.md](CONTRIBUTION.md) before preparing a pull request.
