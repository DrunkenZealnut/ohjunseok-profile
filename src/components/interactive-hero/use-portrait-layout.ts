"use client";

import { useEffect, useState, type RefObject } from "react";

export interface PointPosition {
  id: string;
  abs: { x: number; y: number };
}

export interface LayoutResult {
  points: PointPosition[];
  isMobile: boolean;
  containerSize: { w: number; h: number };
  imageRect: { x: number; y: number; w: number; h: number };
}

const POINT_OFFSETS: Record<string, { x: number; y: number }> = {
  eyes: { x: 0.35, y: 0.38 },
  ears: { x: 0.82, y: 0.42 },
  mouth: { x: 0.50, y: 0.72 },
  head: { x: 0.50, y: 0.08 },
};

export function usePortraitLayout(
  containerRef: RefObject<HTMLDivElement | null>,
  imageRef: RefObject<HTMLDivElement | null>,
): LayoutResult {
  const [layout, setLayout] = useState<LayoutResult>({
    points: [],
    isMobile: false,
    containerSize: { w: 0, h: 0 },
    imageRect: { x: 0, y: 0, w: 0, h: 0 },
  });

  useEffect(() => {
    const container = containerRef.current;
    const image = imageRef.current;
    if (!container || !image) return;

    function recalc() {
      requestAnimationFrame(() => {
        const cRect = container!.getBoundingClientRect();
        const iRect = image!.getBoundingClientRect();

        const relX = iRect.left - cRect.left;
        const relY = iRect.top - cRect.top;
        const isMobile = window.innerWidth < 768;

        const points = Object.entries(POINT_OFFSETS).map(([id, offset]) => ({
          id,
          abs: {
            x: relX + iRect.width * offset.x,
            y: relY + iRect.height * offset.y,
          },
        }));

        setLayout({
          points,
          isMobile,
          containerSize: { w: cRect.width, h: cRect.height },
          imageRect: { x: relX, y: relY, w: iRect.width, h: iRect.height },
        });
      });
    }

    const ro = new ResizeObserver(recalc);
    ro.observe(container);
    recalc();

    return () => ro.disconnect();
  }, [containerRef, imageRef]);

  return layout;
}
