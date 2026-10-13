import { useState } from 'react';
import { Camera, ArrowLeft, ArrowRight, X } from 'lucide-react';

export default function PhotoGallery({ photos = [] }) {
  const [lightbox, setLightbox] = useState(null);

  if (!photos.length) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
        <Camera className="w-5 h-5" />
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
                className="px-4 py-2 bg-white/20 text-white rounded-lg text-sm hover:bg-white/30 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Prev
              </button>
              <span className="text-white text-sm">{lightbox + 1} / {photos.length}</span>
              <button
                onClick={() => setLightbox((l) => (l < photos.length - 1 ? l + 1 : 0))}
                className="px-4 py-2 bg-white/20 text-white rounded-lg text-sm hover:bg-white/30 flex items-center gap-2"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <button
              className="absolute top-3 right-3 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
              onClick={() => setLightbox(null)}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
