export declare function readTextFile(path: string): string;
export declare function readJsonFile<T>(path: string): T;
export declare function writeTextFile(path: string, content: string): void;
export declare function truncateText(value: string, maxCharacters?: number): string;
