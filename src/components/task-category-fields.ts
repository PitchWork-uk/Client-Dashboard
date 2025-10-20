export type CategoryKey = "Slideshow" | "Pitch" | "Development" | "Design";

export type FieldDef =
    | { id: string; type: "text" | "textarea"; label: string; required?: boolean; placeholder?: string }
    | { id: string; type: "select"; label: string; required?: boolean; options: string[] };

export const CATEGORY_FIELDS: Record<CategoryKey, FieldDef[]> = {
    Slideshow: [
        { id: "slidesCount", type: "text", label: "Estimated number of slides", required: true, placeholder: "e.g., 12–15" },
        { id: "brandGuidelines", type: "textarea", label: "Brand guidelines / references", placeholder: "Links or notes" },
    ],
    Pitch: [
        { id: "audience", type: "text", label: "Target audience", required: true, placeholder: "e.g., Executive team" },
        { id: "keyOutcome", type: "textarea", label: "Key outcome / goal", required: true, placeholder: "What does success look like?" },
    ],
    Development: [
        { id: "stack", type: "select", label: "Tech stack", required: true, options: ["React", "Next.js", "Node.js", "Python", "Other"] },
        { id: "repo", type: "text", label: "Repository link", placeholder: "https://..." },
    ],
    Design: [
        { id: "deliverable", type: "select", label: "Deliverable", required: true, options: ["Logo", "Landing page", "Illustration", "Other"] },
        { id: "inspiration", type: "textarea", label: "Inspiration / moodboard links", placeholder: "Links or notes" },
    ],
};

export function toLabeledPairs(category: CategoryKey, extra: Record<string, string> | undefined): { label: string; value: string }[] {
    const defs = CATEGORY_FIELDS[category] || [];
    const result: { label: string; value: string }[] = [];
    if (!extra) return result;
    for (const [id, value] of Object.entries(extra)) {
        const trimmed = String(value || "").trim();
        if (!trimmed) continue;
        const def = defs.find(d => d.id === id);
        result.push({ label: def ? def.label : id, value: trimmed });
    }
    return result;
}


