// scripts/loadEnv.ts
//
// Standalone CLI scripts (run via `tsx`, not through Next.js) don't get
// Next.js's built-in env file loading. Plain `dotenv/config` only reads a
// file literally named `.env`, but this project's setup docs - and Next.js
// itself when running `next dev`/`next build` - use `.env.local`. Loading
// both here (in that order, since dotenv never overwrites an already-set
// variable) means these scripts work regardless of which file you actually
// used, matching the app's own behavior.
import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(process.cwd(), '.env.local') });
config({ path: path.resolve(process.cwd(), '.env') });