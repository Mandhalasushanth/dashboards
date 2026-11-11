import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

/** Fails the build when any source file exceeds the project's line limit. */
const MAX_LINES = 490;
const SCANNED_DIRECTORIES = ['src', 'scripts'];
const SCANNED_EXTENSIONS = new Set(['.ts', '.tsx', '.css']);

interface FileReport {
  readonly file: string;
  readonly lines: number;
}

function listSourceFiles(directory: string): string[] {
  return readdirSync(directory, { recursive: true, encoding: 'utf8' })
    .map((relativePath) => path.join(directory, relativePath))
    .filter((filePath) => SCANNED_EXTENSIONS.has(path.extname(filePath)));
}

function countLines(file: string): FileReport {
  return { file, lines: readFileSync(file, 'utf8').split(/\r?\n/).length };
}

function run(): void {
  const reports = SCANNED_DIRECTORIES.flatMap(listSourceFiles).map(countLines);
  const oversized = reports.filter((report) => report.lines > MAX_LINES);

  if (oversized.length > 0) {
    oversized.forEach((report) => console.error(`  ${report.file}: ${report.lines} lines`));
    console.error(`\n${oversized.length} file(s) exceed ${MAX_LINES} lines.`);
    process.exit(1);
  }
  console.log(`All ${reports.length} source files are within ${MAX_LINES} lines.`);
}

try {
  run();
} catch (error) {
  console.error('File length check failed to run.', error);
  process.exit(1);
}
