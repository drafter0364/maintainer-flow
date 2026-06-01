export function selectMode(mode, event) {
    if (mode !== "auto")
        return mode;
    if (event.pull_request)
        return "pr";
    if (event.issue && !event.issue.pull_request)
        return "issue";
    if (event.release)
        return "release";
    throw new Error("Maintainer Flow could not infer a mode from this event. Set mode to pr, issue, or release.");
}
export function labelsFromEvent(labels) {
    return labels?.map((label) => (typeof label === "string" ? label : label.name ?? "")).filter(Boolean);
}
//# sourceMappingURL=actionHelpers.js.map