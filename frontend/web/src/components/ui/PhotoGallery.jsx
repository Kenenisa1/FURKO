import { useState } from 'react';
import { Camera, ArrowLeft, ArrowRight, X, ExternalLink, AlertCircle } from 'lucide-react';

function resolvePhotoUrl(src) {
  if (!src) return '';
  if (typeof src === 'object') {
    src = src.file_url || src.url || src.path || '';
  }
  if (typeof src !== 'string') return '';
  // If it's already a full HTTP or Data URL, use as-is
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
    return src;
  }
  // If relative path
  if (src.startsWith('/')) {
    return src;
  }
  if (src.startsWith('uploads/')) {
    return `/${src}`;
  }
  return src;
}

export default function PhotoGallery({ photos = [] }) {
  const [lightbox, setLightbox] = useState(null);
  const [loadErrors, setLoadErrors] = useState({});

  const validPhotos = Array.isArray(photos) ? photos.filter(Boolean) : [];

  if (!validPhotos.length) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
        <Camera className="w-5 h-5" />
        No photos attached
      </div>
    );
  }

  const handleImageError = (index) => {
    setLoadErrors((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {validPhotos.map((item, i) => {
          const resolvedSrc = resolvePhotoUrl(item);
          const isFileUri = typeof resolvedSrc === 'string' && resolvedSrc.startsWith('file://');
          const isFailed = loadErrors[i] || isFileUri;

          return (
            <button
              key={i}
              onClick={() => setLightbox(i)}
              className="aspect-square rounded-xl overflow-hidden border border-gray-200 hover:border-[#1a6b3c] focus:outline-none focus:ring-2 focus:ring-[#1a6b3c] transition-all bg-gray-50 relative group"
              aria-label={`View photo ${i + 1}`}
            >
              {isFailed ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gray-50 border border-dashed border-gray-200">
                  <Camera className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="text-[11px] font-semibold text-gray-600">Attached Photo</span>
                  <span className="text-[9px] text-gray-400 mt-0.5">
                    {isFileUri ? 'Captured on mobile' : 'Preview unavailable'}
                  </span>
                </div>
              ) : (
                <img
                  src={resolvedSrc}
                  alt={`Report photo ${i + 1}`}
                  onError={() => handleImageError(i)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              )}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-400 mt-2">
        {validPhotos.length} photo{validPhotos.length !== 1 ? 's' : ''} — click to enlarge
      </p>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[60] bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-4xl w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            {loadErrors[lightbox] || resolvePhotoUrl(validPhotos[lightbox]).startsWith('file://') ? (
              <div className="w-full max-w-md bg-white rounded-2xl p-6 text-center shadow-xl">
                <Camera className="w-12 h-12 text-[#1a6b3c] mx-auto mb-3" />
                <h3 className="text-base font-bold text-gray-900 mb-1">Evidence Photo Reference</h3>
                <p className="text-xs text-gray-500 mb-4 font-mono break-all bg-gray-50 p-2 rounded-lg border border-gray-200">
                  {resolvePhotoUrl(validPhotos[lightbox])}
                </p>
                <p className="text-xs text-gray-400">
                  This photo was captured locally during the mobile reporting flow.
                </p>
              </div>
            ) : (
              <img
                src={resolvePhotoUrl(validPhotos[lightbox])}
                alt={`Photo ${lightbox + 1}`}
                className="w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
              />
            )}

            {/* Nav & Action Controls */}
            <div className="flex items-center justify-between w-full max-w-lg mt-4 px-2">
              <button
                onClick={() => setLightbox((l) => (l > 0 ? l - 1 : validPhotos.length - 1))}
                className="px-4 py-2 bg-white/20 text-white rounded-lg text-sm hover:bg-white/30 flex items-center gap-2 backdrop-blur-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Prev
              </button>
              <div className="flex items-center gap-3">
                <span className="text-white text-sm font-medium">
                  {lightbox + 1} / {validPhotos.length}
                </span>
                {!resolvePhotoUrl(validPhotos[lightbox]).startsWith('file://') && (
                  <a
                    href={resolvePhotoUrl(validPhotos[lightbox])}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center gap-1 text-xs"
                    title="Open full size"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              <button
                onClick={() => setLightbox((l) => (l < validPhotos.length - 1 ? l + 1 : 0))}
                className="px-4 py-2 bg-white/20 text-white rounded-lg text-sm hover:bg-white/30 flex items-center gap-2 backdrop-blur-sm transition-colors"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <button
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors p-1"
              onClick={() => setLightbox(null)}
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
