import fs from 'node:fs';
import path from 'node:path';

process.env.NODE_ENV = 'test';

if (!process.env.DATABASE_URL) {
  const envPath = path.resolve(process.cwd(), 'packages/db/.env');

  if (fs.existsSync(envPath)) {
    const envContents = fs.readFileSync(envPath, 'utf8');
    const databaseUrlMatch = envContents.match(/^DATABASE_URL=(.*)$/m);

    if (databaseUrlMatch) {
      const sourceUrl = databaseUrlMatch[1].trim().replace(/^['"]|['"]$/g, '');
      const baseUrl = sourceUrl.replace(/\/[^/]+$/, '');
      process.env.DATABASE_URL = `${baseUrl}/messaging_app_test`;
    }
  }
}
