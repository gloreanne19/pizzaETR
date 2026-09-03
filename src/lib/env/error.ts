import type { ZodError } from 'zod';

export class EnvValidationError extends Error {
  constructor(
    message: string,
    public readonly zodError: ZodError
  ) {
    super(message);
    this.name = 'EnvValidationError';
  }

  getFormattedMessage(): string {
    const lines = [
      '',
      `ERROR: ${this.message}`,
      '─'.repeat(60),
      '',
      'Missing or invalid environment variables:',
      '',
    ];

    for (const issue of this.zodError.issues) {
      const variable = issue.path.join('.');
      lines.push(`  - ${variable}`);
      lines.push(`    └─ ${issue.message}`);
      lines.push('');
    }

    lines.push('─'.repeat(60));
    lines.push('');
    lines.push('Create or update your .env.local or .env.dev file with the required variables.');

    return lines.join('\n');
  }
}

