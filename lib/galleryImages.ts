import fs from "fs";
import path from "path";
import { list } from "@vercel/blob";
import { getImageName } from "@/lib/galleryImageHelpers";

const GALLERY_PREFIX = "gallery/";
const IMAGE_EXTENSION_PATTERN = /\.(png|jpe?g|webp|avif)$/i;

export async function getGalleryImages() {
  const blobImages = await getBlobGalleryImages();
  if (blobImages.length > 0) {
    return blobImages;
  }

  return getLocalGalleryImages();
}

async function getBlobGalleryImages() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return [];
  }

  try {
    const images: string[] = [];
    let cursor: string | undefined;

    do {
      const response = await list({
        cursor,
        limit: 1000,
        prefix: GALLERY_PREFIX,
      });

      response.blobs
        .filter((blob) => isGalleryImage(blob.pathname))
        .forEach((blob) => images.push(blob.url));

      cursor = response.hasMore ? response.cursor : undefined;
    } while (cursor);

    return images;
  } catch {
    return [];
  }
}

function getLocalGalleryImages() {
  const imagesDir = path.join(process.cwd(), "public", "images");
  const entries = fs.readdirSync(imagesDir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => isGalleryImage(name))
    .sort();
}

function isGalleryImage(pathname: string) {
  const filename = getImageName(pathname);
  if (!IMAGE_EXTENSION_PATTERN.test(filename)) {
    return false;
  }

  const base = filename.replace(/\.[^/.]+$/, "");
  return base.split("-").length > 1;
}
