import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface MarkdownProps {
  children: string;
  className?: string;
  /**
   * Render as inline phrasing content (no wrapping <p>), so this can be
   * embedded inside headings, buttons, or spans without invalid nesting.
   */
  inline?: boolean;
}

export default function Markdown({ children, className, inline }: MarkdownProps) {
  const Wrapper = inline ? "span" : "div";

  return (
    <Wrapper className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={inline ? { p: ({ children }) => <>{children}</> } : undefined}
      >
        {children}
      </ReactMarkdown>
    </Wrapper>
  );
}
