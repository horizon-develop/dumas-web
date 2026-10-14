import imageCompression from 'browser-image-compression';

// VALIDATION & COMPRESSION FOR FIREBASE STORAGE UPLOADS
const ALLOWED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

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
