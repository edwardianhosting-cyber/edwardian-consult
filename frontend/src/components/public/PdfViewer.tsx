'use client';
import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc =
  'https://unpkg.com/pdfjs-dist@4.8.69/build/pdf.worker.min.js';

export default function PdfViewer({ src }: { src: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [pages, setPages] = useState(0);
  const [error, setError] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={boxRef}
      onContextMenu={(e) => e.preventDefault()}
      className="w-full max-w-[794px] mx-auto aspect-[1/1.414] overflow-y-auto overflow-x-hidden
                 bg-white border border-gray-200 rounded-lg select-none"
    >
      {error ? (
        <p className="text-center text-red-500 py-10 px-4 text-sm">
          Syllabus not available. {errMsg}
        </p>
      ) : (
        <Document
          file={src}
          onLoadSuccess={({ numPages }) => setPages(numPages)}
          onLoadError={(e) => {
            console.error('PDF load error:', e);
            setErrMsg(e.message);
            setError(true);
          }}
          onSourceError={(e) => {
            console.error('PDF source error:', e);
            setErrMsg(e.message);
            setError(true);
          }}
          loading={<p className="text-center text-gray-500 py-10">Loading…</p>}
        >
          {Array.from({ length: pages }, (_, i) => (
            <Page
              key={i}
              pageNumber={i + 1}
              width={width}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          ))}
        </Document>
      )}
    </div>
  );
}
