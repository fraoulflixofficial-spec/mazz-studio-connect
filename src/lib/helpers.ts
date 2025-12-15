export const extractYouTubeId = (url: string | undefined | null): string | null => {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

export const isYouTubeUrl = (url: string | undefined | null): boolean => {
  if (!url) return false;
  return extractYouTubeId(url) !== null;
};

export const getYouTubeEmbedUrl = (url: string | undefined | null): string | null => {
  if (!url) return null;
  const id = extractYouTubeId(url);
  if (!id) return null;
  return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&showinfo=0`;
};

export const formatPrice = (price: number): string => {
  return `৳${price.toLocaleString('en-BD')}`;
};

export const generateOrderId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `MZ-${timestamp}-${random}`.toUpperCase();
};
