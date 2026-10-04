import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import type { PrismaClient } from "@prisma/client";

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);

type FolderPhoto = {
  year: number;
  files: Array<{ filename: string; src: string }>;
};

function listPujaFolderPhotos(rootDir: string): FolderPhoto[] {
  let yearDirs: string[] = [];
  try {
    yearDirs = readdirSync(rootDir).filter((name) => {
      if (!/^\d{4}$/.test(name)) return false;
      return statSync(join(rootDir, name)).isDirectory();
    });
  } catch {
    return [];
  }

  return yearDirs
    .map((yearLabel) => {
      const year = Number(yearLabel);
      const dir = join(rootDir, yearLabel);
      const files = readdirSync(dir)
        .filter((name) => {
          const lower = name.toLowerCase();
          if (name.startsWith(".")) return false;
          const ext = lower.slice(lower.lastIndexOf("."));
          return IMAGE_EXT.has(ext);
        })
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .map((filename) => ({
          filename,
          src: `/images/gallery/puja/${yearLabel}/${filename}`,
        }));

      return { year, files };
    })
    .filter((row) => row.files.length > 0)
    .sort((a, b) => b.year - a.year);
}

/**
 * Publishes filesystem photos from `public/images/gallery/puja/{year}` into:
 * - PujaYear cover + gallery (Saraswati Puja archive)
 * - GalleryAlbum + GalleryMedia (/gallery/saraswati-puja-{year})
 */
export async function seedPujaFolderPhotos(
  prisma: PrismaClient,
  actorUserId?: string | null,
  rootDir = join(process.cwd(), "public/images/gallery/puja"),
) {
  const actor = actorUserId ?? null;
  const now = new Date();
  const folders = listPujaFolderPhotos(rootDir);

  let yearsUpdated = 0;
  let albumsUpdated = 0;
  let mediaUpserted = 0;

  for (const folder of folders) {
    const cover = folder.files[0];
    const galleryJson = folder.files.map((file, index) => ({
      id: `puja-${folder.year}-${index + 1}`,
      src: file.src,
      alt: `Saraswati Puja ${folder.year}`,
      width: 1600,
      height: 1000,
      provenance: "verified",
    }));
    const coverJson = {
      id: `puja-${folder.year}-cover`,
      src: cover.src,
      alt: `Saraswati Puja ${folder.year}`,
      width: 1600,
      height: 1000,
      provenance: "verified",
    };

    const existingYear = await prisma.pujaYear.findUnique({
      where: { year: folder.year },
    });

    const yearPayload = {
      title: `Saraswati Puja ${folder.year}`,
      summary:
        existingYear?.summary?.trim() &&
        !existingYear.summary.includes("[SAMPLE]")
          ? existingYear.summary
          : `Photographs from Saraswati Puja ${folder.year} at Rishra Junior Group Club.`,
      coverJson,
      galleryJson,
      href: `/saraswati-puja/${folder.year}`,
      sortOrder: 3000 - folder.year,
      status: "PUBLISHED" as const,
      provenance: "verified",
      historicallyImportant: folder.year === 2000,
      isSample: false,
      updatedById: actor,
      updatedAt: now,
      deletedAt: null,
    };

    if (existingYear) {
      await prisma.pujaYear.update({
        where: { id: existingYear.id },
        data: yearPayload,
      });
    } else {
      await prisma.pujaYear.create({
        data: {
          year: folder.year,
          ...yearPayload,
          createdById: actor,
        },
      });
    }
    yearsUpdated += 1;

    const slug = `saraswati-puja-${folder.year}`;
    const existingAlbum = await prisma.galleryAlbum.findFirst({
      where: { slug, deletedAt: null },
    });

    const albumPayload = {
      title: `Saraswati Puja ${folder.year}`,
      description: `Album from Saraswati Puja ${folder.year}.`,
      contentStatus: "PUBLISHED" as const,
      published: true,
      historicallyImportant: folder.year === 2000,
      year: folder.year,
      coverUrl: cover.src,
      coverAlt: `Saraswati Puja ${folder.year}`,
      sortOrder: 100 + (3000 - folder.year),
      isSample: false,
      updatedAt: now,
      deletedAt: null,
    };

    const album = existingAlbum
      ? await prisma.galleryAlbum.update({
          where: { id: existingAlbum.id },
          data: albumPayload,
        })
      : await prisma.galleryAlbum.create({
          data: {
            slug,
            ...albumPayload,
            createdById: actor,
          },
        });
    albumsUpdated += 1;

    // Replace published static media rows for this album (keep managed mediaAsset rows).
    await prisma.galleryMedia.updateMany({
      where: {
        albumId: album.id,
        deletedAt: null,
        mediaAssetId: null,
        url: { startsWith: "/images/gallery/puja/" },
      },
      data: { deletedAt: now, contentStatus: "ARCHIVED" },
    });

    for (const [index, file] of folder.files.entries()) {
      const existingMedia = await prisma.galleryMedia.findFirst({
        where: {
          albumId: album.id,
          url: file.src,
          deletedAt: null,
        },
      });
      if (existingMedia) {
        await prisma.galleryMedia.update({
          where: { id: existingMedia.id },
          data: {
            alt: `Saraswati Puja ${folder.year}`,
            sortOrder: (index + 1) * 10,
            contentStatus: "PUBLISHED",
            isSample: false,
            updatedAt: now,
          },
        });
      } else {
        await prisma.galleryMedia.create({
          data: {
            albumId: album.id,
            type: "IMAGE",
            url: file.src,
            alt: `Saraswati Puja ${folder.year}`,
            sortOrder: (index + 1) * 10,
            contentStatus: "PUBLISHED",
            isSample: false,
          },
        });
      }
      mediaUpserted += 1;
    }
  }

  return {
    yearsWithPhotos: folders.map((f) => ({
      year: f.year,
      count: f.files.length,
    })),
    yearsUpdated,
    albumsUpdated,
    mediaUpserted,
  };
}
