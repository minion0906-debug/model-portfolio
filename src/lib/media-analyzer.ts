export type MediaAnalysis = {
  orientation: "Portrait" | "Landscape" | "Square";
  category: string;
  tags: string[];
};

export function analyzeImage(input: { name: string; width?: number | null; height?: number | null }): MediaAnalysis {
  const name = input.name.toLowerCase();
  const width = input.width || 0;
  const height = input.height || 0;

  const orientation = width === height ? "Square" : width > height ? "Landscape" : "Portrait";

  let category = "Fashion";
  const tags: string[] = [orientation.toLowerCase()];

  if (/beauty|makeup|skin|face|close/.test(name)) {
    category = "Beauty";
    tags.push("beauty", "portrait");
  } else if (/runway|catwalk|show/.test(name)) {
    category = "Runway";
    tags.push("runway", "fashion");
  } else if (/product|commercial|campaign/.test(name)) {
    category = "Commercial";
    tags.push("commercial");
  } else if (orientation === "Portrait") {
    tags.push("portrait");
  }

  return { orientation, category, tags: Array.from(new Set(tags)) };
}
