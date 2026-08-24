import { CreateUserInput, LogInUserInput } from '@repo/common';
import { describe, expect, it } from 'vitest';

describe('CreateUserInput', () => {
  it('accepts a valid signup payload', () => {
    const result = CreateUserInput.parse({
      email: 'person@example.com',
      password: 'Password1!',
      confirmPassword: 'Password1!',
    });

    expect(result.email).toBe('person@example.com');
  });

  it('rejects mismatched passwords', () => {
    const result = CreateUserInput.safeParse({
      email: 'person@example.com',
      password: 'Password1!',
      confirmPassword: 'Password2!',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['confirmPassword']);
  });

  it('rejects passwords without required numbers and special characters', () => {
    const result = CreateUserInput.safeParse({
      email: 'person@example.com',
      password: 'password',
      confirmPassword: 'password',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.message)).toEqual(
      expect.arrayContaining([
        'Password must contain at least one number',
        'Password must contain at least one special character',
      ])
    );
  });
});

describe('LogInUserInput', () => {
  it('requires an email and password', () => {
    const result = LogInUserInput.safeParse({
      email: '',
      password: '',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path.join('.'))).toEqual(
      expect.arrayContaining(['email', 'password'])
    );
  });
});
