export default function PolicyContent({ html }: { html: string }) {
  return (
    <div
      className="policy-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
