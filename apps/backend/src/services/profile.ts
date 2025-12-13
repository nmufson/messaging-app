export function nameEmailSearch(input: string) {
  return {
    OR: [
      {
        user: {
          email: { contains: input, mode: 'insensitive' as const },
        },
      },
      {
        firstName: { contains: input, mode: 'insensitive' as const },
      },
      {
        lastName: { contains: input, mode: 'insensitive' as const },
      },
    ],
  };
}
