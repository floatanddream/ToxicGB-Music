export const shouldTruncate = (text: string | undefined) => {
  return text && text.length > 100;
};
export const getTruncatedDesc = (text: string | undefined) => {
  if (!text) return '';
  return shouldTruncate(text) ? text.slice(0, 100) + '...' : text;
};