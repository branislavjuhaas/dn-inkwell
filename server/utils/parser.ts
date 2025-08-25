export const parseTextFromHtml = (html: string): string => {
  return html
    .replace(/<\/?(style|script)[^>]*>.*?<\/\1>/gs, "")
    .replace(/<\/?[^>]+(>|$)/g, "");
};
