import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
export function readTextFile(path) {
    return readFileSync(path, "utf8");
}
export function readJsonFile(path) {
    return JSON.parse(readTextFile(path));
}
export function writeTextFile(path, content) {
    const directory = dirname(path);
    if (directory && directory !== ".") {
        mkdirSync(directory, { recursive: true });
    }
    writeFileSync(path, content, "utf8");
}
export function truncateText(value, maxCharacters = 12000) {
    if (value.length <= maxCharacters)
        return value;
    return `${value.slice(0, maxCharacters)}\n\n[truncated ${value.length - maxCharacters} characters]`;
}
//# sourceMappingURL=io.js.map