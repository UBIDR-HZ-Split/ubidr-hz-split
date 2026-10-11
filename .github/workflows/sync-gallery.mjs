import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const galleryFile = path.join(root, "content", "gallery.json");
const uploadRoot = path.join(root, "uploads", "galerija");
const imageExts = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

function slugify(value) {
  return String(value || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

function findImages(albumSlug) {
  const dir = path.join(uploadRoot, albumSlug);
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(entry => entry.isFile() && imageExts.has(path.extname(entry.name).toLowerCase()))
    .map(entry => entry.name)
    .sort((a, b) => a.localeCompare(b, "hr", { numeric: true }))
    .map(name => `uploads/galerija/${albumSlug}/${name}`);
}

if (!fs.existsSync(galleryFile)) throw new Error("Nedostaje content/gallery.json");
fs.mkdirSync(uploadRoot, { recursive: true });

const gallery = readJson(galleryFile, { items: [] });
if (!Array.isArray(gallery.items)) throw new Error("content/gallery.json mora sadržavati polje items.");

let changed = false;
for (const album of gallery.items) {
  if (!album || !album.title) continue;

  // Folder is derived from album title. Use the exact same slug as the folder name.
  const slug = slugify(album.title);
  const uploadedPhotos = findImages(slug);
  if (!uploadedPhotos.length) continue;

  // Preserve CMS images and cover; append uploaded folder photos without duplicates.
  const existing = Array.isArray(album.images) ? album.images : [];
  const merged = [...existing, ...uploadedPhotos].filter((photo, i, all) => photo && all.indexOf(photo) === i);

  if (JSON.stringify(existing) !== JSON.stringify(merged)) {
    album.images = merged;
    changed = true;
  }
  // If no cover is configured, use the first uploaded image.
  if (!album.image && !album.cover) {
    album.image = uploadedPhotos[0];
    changed = true;
  }
}

if (changed) {
  fs.writeFileSync(galleryFile, JSON.stringify(gallery, null, 2) + "\n", "utf8");
  console.log("Ažuriran content/gallery.json");
} else {
  console.log("Nema novih fotografija za dodavanje.");
}
