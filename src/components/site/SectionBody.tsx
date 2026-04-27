import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  children: string;
  className?: string;
};

/**
 * Renders user-authored markdown body copy with consistent prose styling.
 * Supports bold, italic, headings, bullet/numbered lists, links, blockquotes, code.
 */
export function SectionBody({ children, className = "" }: Props) {
  return (
    <div className={`prose-rich ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
