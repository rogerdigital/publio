# Contributing

Thanks for taking time to improve Publio. This project is a Next.js and TypeScript application for multi-platform content publishing.

## Development Setup

1. Fork and clone the repository.
2. Install dependencies:

```bash
pnpm install
```

3. Start the development server:

```bash
pnpm dev
```

4. Run checks before opening a pull request:

```bash
pnpm test
pnpm build
```

## Pull Request Guidelines

- Keep changes focused and easy to review.
- Include tests for behavior changes when practical.
- Do not commit secrets, `.env.local`, `.next/`, or generated dependency directories.
- Use clear commit messages that describe the change and verification.
- For UI changes, include screenshots or a short description of the user-visible behavior.

## Reporting Issues

When reporting a bug, include:

- Steps to reproduce.
- Expected behavior.
- Actual behavior.
- Browser, operating system, and Node.js version when relevant.
- Logs or screenshots when they help explain the issue.

## Security

Please do not file public issues for security vulnerabilities. Follow the process in [SECURITY.md](./SECURITY.md).
