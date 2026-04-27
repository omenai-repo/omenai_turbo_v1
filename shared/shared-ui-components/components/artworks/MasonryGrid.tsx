"use client";

/**
 * MasonryGrid
 *
 * Pure-CSS masonry using `columns`. Each child breaks naturally to its
 * intrinsic height — no JS, no layout thrash, perfect aspect-ratio preservation.
 *
 * USAGE
 * ─────
 * <MasonryGrid>
 *   {artworks.map((art) => (
 *     <ArtworkCard key={art.art_id} {...art} />
 *   ))}
 * </MasonryGrid>
 *
 * COLUMN COUNTS (tailwind columns-* classes, passed via `className`):
 *   Default: 2 → sm:3 → lg:4 → xl:5
 *   Override: <MasonryGrid className="columns-2 md:columns-3 xl:columns-4" />
 */

import { ReactNode } from "react";
import { clsx } from "clsx"; // adjust to your cn/clsx helper path

interface MasonryGridProps {
  children: ReactNode;
  /** Override default responsive column classes */
  className?: string;
  /** Gap between items — Tailwind gap value, default gap-5 */
  gap?: string;
}

export default function MasonryGrid({
  children,
  className,
  gap = "gap-5",
}: MasonryGridProps) {
  return (
    <div
      className={clsx(
        // ── Column count at each breakpoint ──────────────────────────────
        "columns-2 sm:columns-3 lg:columns-4 ",
        // ── Gap between columns ──────────────────────────────────────────
        gap,
        // ── Prevent items from being sliced across column breaks ─────────
        "[&>*]:break-inside-avoid",
        // ── Space between rows (margin-bottom on every child) ────────────
        "[&>*]:mb-5",
        className,
        "pb-10",
      )}
    >
      {children}
    </div>
  );
}
