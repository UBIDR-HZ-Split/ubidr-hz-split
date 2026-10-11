import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const albumsRoot = path.join(root, "uploads", "galerija");
const output = path.join(root, "content", "gallery.json");
const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

function titleFromSlug(slug) {
  return slug.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim()
    .replace(/\b\p{L}/gu, c => c.toLocaleUpperCase("hr-HR"));
}

function listImages(albumSlug, dir) {
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(entry => entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase()))
    .map(entry => entry.name)
    .sort((a, b) => a.localeCompare(b, "hr", { numeric: true }))
    .map(name => `uploads/galerija/${albumSlug}/${name}`);
}

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.mkdirSync(albumsRoot, { recursive: true });
const albums = fs.readdirSync(albumsRoot, { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .sort((a, b) => a.name.localeCompare(b.name, "hr"))
  .map(entry => {
    const images = listImages(entry.name, path.join(albumsRoot, entry.name));
    if (!images.length) return null;
    return { title: titleFromSlug(entry.name), image: images[0], images };
  })
  .filter(Boolean);
fs.writeFileSync(output, JSON.stringify({ items: albums }, null, 2) + "\n", "utf8");
console.log(`Generated ${albums.length} album(s) in content/gallery.json`);
