import { useState } from 'react';

export default function PhotoGallery({ photos = [] }) {
  const [lightbox, setLightbox] = useState(null);

  if (!photos.length) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        No photos attached
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {photos.map((src, i) => (
          <button
            key={i}
            onClick={() => setLightbox(i)}
            className="aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-[#1a6b3c] focus:outline-none focus:ring-2 focus:ring-[#1a6b3c] transition-all"
            aria-label={`View photo ${i + 1}`}
          >
            <img
              src={src}
              alt={`Report photo ${i + 1}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
            />
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-2">{photos.length} photo{photos.length !== 1 ? 's' : ''} — click to enlarge</p>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={photos[lightbox]}
              alt={`Photo ${lightbox + 1}`}
              className="w-full max-h-[80vh] object-contain rounded-xl"
            />
            {/* Nav */}
            <div className="flex items-center justify-between mt-3">
              <button
                onClick={() => setLightbox((l) => (l > 0 ? l - 1 : photos.length - 1))}
                className="px-4 py-2 bg-white/20 text-white rounded-lg text-sm hover:bg-white/30"
              >
                ← Prev
              </button>
              <span className="text-white text-sm">{lightbox + 1} / {photos.length}</span>
              <button
                onClick={() => setLightbox((l) => (l < photos.length - 1 ? l + 1 : 0))}
                className="px-4 py-2 bg-white/20 text-white rounded-lg text-sm hover:bg-white/30"
              >
                Next →
              </button>
            </div>
            <button
              className="absolute top-3 right-3 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
              onClick={() => setLightbox(null)}
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
