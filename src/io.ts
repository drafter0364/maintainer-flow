import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export function readTextFile(path: string): string {
  return readFileSync(path, "utf8");
}

export function readJsonFile<T>(path: string): T {
  return JSON.parse(readTextFile(path)) as T;
}

export function writeTextFile(path: string, content: string): void {
  const directory = dirname(path);
  if (directory && directory !== ".") {
    mkdirSync(directory, { recursive: true });
  }
  writeFileSync(path, content, "utf8");
}

export function truncateText(value: string, maxCharacters = 12000): string {
  if (value.length <= maxCharacters) return value;
  return `${value.slice(0, maxCharacters)}\n\n[truncated ${value.length - maxCharacters} characters]`;
}
