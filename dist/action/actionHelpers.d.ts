export interface ActionEvent {
    pull_request?: {
        number?: number;
        title?: string;
        body?: string;
    };
    issue?: {
        number?: number;
        title?: string;
        body?: string;
        pull_request?: unknown;
        labels?: EventLabel[];
    };
    release?: {
        tag_name?: string;
        body?: string;
    };
}
export type EventLabel = string | {
    name?: string;
};
export type Mode = "auto" | "pr" | "issue" | "release";
export type SelectedMode = Exclude<Mode, "auto">;
export declare function selectMode(mode: Mode, event: ActionEvent): SelectedMode;
export declare function labelsFromEvent(labels: EventLabel[] | undefined): string[] | undefined;
