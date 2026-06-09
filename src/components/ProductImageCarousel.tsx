"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  type PointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type ProductImageCarouselProps = {
  images: string[];
  alt: string;
  activeIndex: number;
  onIndexChange: (index: number) => void;
};

const SWIPE_THRESHOLD = 50;

export default function ProductImageCarousel({
  images,
  alt,
  activeIndex,
  onIndexChange,
}: ProductImageCarouselProps) {
  const count = images.length;
  const hasMultiple = count > 1;

  const slides = useMemo(
    () => (hasMultiple ? [images[count - 1], ...images, images[0]] : images),
    [images, count, hasMultiple]
  );

  const [slideIndex, setSlideIndex] = useState(hasMultiple ? 1 : 0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [noTransition, setNoTransition] = useState(false);

  const pointerStartX = useRef(0);
  const pointerId = useRef<number | null>(null);
  const syncingFromParent = useRef(false);

  const realIndex = hasMultiple ? (slideIndex - 1 + count) % count : 0;

  useEffect(() => {
    if (!hasMultiple || syncingFromParent.current) return;
    if (realIndex === activeIndex) return;
    setNoTransition(false);
    setSlideIndex(activeIndex + 1);
  }, [activeIndex, hasMultiple, realIndex]);

  const resetTransition = useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setNoTransition(false));
    });
  }, []);

  const handleTransitionEnd = () => {
    if (!hasMultiple) return;

    if (slideIndex === 0) {
      syncingFromParent.current = true;
      setNoTransition(true);
      setSlideIndex(count);
      onIndexChange(count - 1);
      resetTransition();
      syncingFromParent.current = false;
      return;
    }

    if (slideIndex === count + 1) {
      syncingFromParent.current = true;
      setNoTransition(true);
      setSlideIndex(1);
      onIndexChange(0);
      resetTransition();
      syncingFromParent.current = false;
      return;
    }

    onIndexChange(slideIndex - 1);
  };

  const goNext = () => {
    if (!hasMultiple || isDragging) return;
    setNoTransition(false);
    setSlideIndex((current) => current + 1);
  };

  const goPrev = () => {
    if (!hasMultiple || isDragging) return;
    setNoTransition(false);
    setSlideIndex((current) => current - 1);
  };

  const goToSlide = (index: number) => {
    if (!hasMultiple) return;
    setNoTransition(false);
    setSlideIndex(index + 1);
    onIndexChange(index);
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!hasMultiple || e.button !== 0) return;
    pointerStartX.current = e.clientX;
    pointerId.current = e.pointerId;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDragging || pointerId.current !== e.pointerId) return;
    setDragOffset(e.clientX - pointerStartX.current);
  };

  const finishDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    if (pointerId.current === e.pointerId) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }

    const offset = dragOffset;
    setIsDragging(false);
    setDragOffset(0);
    pointerId.current = null;

    if (offset > SWIPE_THRESHOLD) goPrev();
    else if (offset < -SWIPE_THRESHOLD) goNext();
  };

  return (
    <div className="product-image-carousel">
      <div
        className="product-carousel-viewport"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onPointerLeave={finishDrag}
      >
        <div
          className={[
            "product-carousel-track",
            isDragging ? "is-dragging" : "",
            noTransition ? "no-transition" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={{
            transform: `translate3d(calc(-${slideIndex * 100}% + ${isDragging ? dragOffset : 0}px), 0, 0)`,
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {slides.map((src, i) => (
            <div key={`${src}-${i}`} className="product-carousel-slide">
              <Image
                src={src}
                alt={i === slideIndex || !hasMultiple ? alt : ""}
                width={600}
                height={720}
                className="product-carousel-image"
                priority={hasMultiple ? i === 1 : i === 0}
                draggable={false}
              />
            </div>
          ))}
        </div>

        {hasMultiple && (
          <>
            <button
              type="button"
              className="product-carousel-arrow product-carousel-arrow-prev"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              aria-label="Previous image"
            >
              <ChevronLeft size={22} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              className="product-carousel-arrow product-carousel-arrow-next"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              aria-label="Next image"
            >
              <ChevronRight size={22} strokeWidth={2.5} />
            </button>
          </>
        )}
      </div>

      {hasMultiple && (
        <div className="product-carousel-dots" role="tablist" aria-label="Product images">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Image ${i + 1} of ${count}`}
              className={`product-carousel-dot ${i === activeIndex ? "active" : ""}`}
              onClick={() => goToSlide(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
