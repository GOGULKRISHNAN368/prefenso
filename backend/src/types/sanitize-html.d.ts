declare module 'sanitize-html' {
  type Options = { allowedTags?: string[]; allowedAttributes?: Record<string, string[]> };
  function sanitizeHtml(input: string, options?: Options): string;
  export default sanitizeHtml;
}
