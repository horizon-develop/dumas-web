import imageCompression from 'browser-image-compression';

// VALIDATION & COMPRESSION FOR FIREBASE STORAGE UPLOADS
const ALLOWED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_MB = 1;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const validateImage = (file: File): string | null => {
  if (!ALLOWED_FORMATS.includes(file.type)) {
    return `Formato no permitido. Usa JPG, PNG o WebP.`;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `La imagen supera el límite de ${MAX_FILE_SIZE_MB} MB. Se comprimirá automáticamente.`;
  }
  return null;
};

export const isAllowedFormat = (file: File): boolean => {
  return ALLOWED_FORMATS.includes(file.type);
};

export const compressImage = async (
  file: File,
): Promise<File> => {
  const options = {
    maxSizeMB: 0.3,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    fileType: 'image/webp' as const,
  };

  const compressedBlob = await imageCompression(file, options);

  const originalName = file.name.replace(/\.[^.]+$/, '');
  return new File([compressedBlob], `${originalName}.webp`, {
    type: 'image/webp',
  });
};
