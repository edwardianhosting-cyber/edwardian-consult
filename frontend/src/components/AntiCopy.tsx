'use client';

import { useEffect } from 'react';

interface AntiCopyProps {
  enabled?: boolean;
  children: React.ReactNode;
}

export default function AntiCopy({ enabled = true, children }: AntiCopyProps) {
  useEffect(() => {
    if (!enabled) return;

    const preventCopy = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const preventContextMenu = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const preventKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 'x' || e.key === 'X' || e.key === 'a' || e.key === 'A' || e.key === 'u' || e.key === 'U' || e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S')) ||
        (e.metaKey && (e.key === 'c' || e.key === 'C' || e.key === 'x' || e.key === 'X' || e.key === 'a' || e.key === 'A' || e.key === 'u' || e.key === 'U' || e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S')) ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c'))
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Screenshot detection and prevention
    const detectScreenshot = () => {
      // Clear clipboard to prevent screenshot pasting
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText('').catch(() => {});
      }
    };

    const preventPrintScreen = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        e.stopPropagation();
        detectScreenshot();
        return false;
      }
    };

    // Detect when window loses focus (possible screenshot tool)
    const handleBlur = () => {
      detectScreenshot();
    };

    // Detect visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        detectScreenshot();
      }
    };

    const preventDrag = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const preventSelectStart = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Prevent drag and drop
    const preventDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    document.addEventListener('copy', preventCopy, true);
    document.addEventListener('cut', preventCopy, true);
    document.addEventListener('paste', preventCopy, true);
    document.addEventListener('contextmenu', preventContextMenu, true);
    document.addEventListener('keydown', preventKeyDown, true);
    document.addEventListener('keydown', preventPrintScreen, true);
    document.addEventListener('dragstart', preventDrag, true);
    document.addEventListener('selectstart', preventSelectStart, true);
    document.addEventListener('drop', preventDrop, true);
    document.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Add watermark overlay for additional protection
    const watermark = document.createElement('div');
    watermark.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 999999;
      opacity: 0.03;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Ctext x='50%25' y='50%25' font-size='14' fill='%23000' text-anchor='middle' dominant-baseline='middle' transform='rotate(-45, 100, 100)'%3EEdwardian Educational Consult%3C/text%3E%3C/svg%3E");
      background-repeat: repeat;
    `;
    document.body.appendChild(watermark);

    const style = document.createElement('style');
    style.textContent = `
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
      }
      input, textarea {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
      img {
        -webkit-user-drag: none !important;
        -khtml-user-drag: none !important;
        -moz-user-drag: none !important;
        -o-user-drag: none !important;
        user-drag: none !important;
        pointer-events: none !important;
      }
      @media print {
        body {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.removeEventListener('copy', preventCopy, true);
      document.removeEventListener('cut', preventCopy, true);
      document.removeEventListener('paste', preventCopy, true);
      document.removeEventListener('contextmenu', preventContextMenu, true);
      document.removeEventListener('keydown', preventKeyDown, true);
      document.removeEventListener('keydown', preventPrintScreen, true);
      document.removeEventListener('dragstart', preventDrag, true);
      document.removeEventListener('selectstart', preventSelectStart, true);
      document.removeEventListener('drop', preventDrop, true);
      document.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.head.removeChild(style);
      if (watermark.parentNode) {
        document.body.removeChild(watermark);
      }
    };
  }, [enabled]);

  return <>{children}</>;
}
