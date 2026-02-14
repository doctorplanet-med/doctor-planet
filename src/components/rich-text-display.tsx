import React from 'react'

interface RichTextDisplayProps {
  content: string
  className?: string
}

export default function RichTextDisplay({ content, className = '' }: RichTextDisplayProps) {
  return (
    <>
      <div
        className={`rich-text-content ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
      <style jsx global>{`
        .rich-text-content {
          line-height: 1.75;
        }
        
        .rich-text-content h1 {
          font-size: 2em;
          font-weight: bold;
          margin-bottom: 0.5em;
          color: #1e293b;
        }
        
        .rich-text-content h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin-bottom: 0.5em;
          margin-top: 1em;
          color: #1e293b;
        }
        
        .rich-text-content h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin-bottom: 0.5em;
          margin-top: 0.75em;
          color: #1e293b;
        }
        
        .rich-text-content p {
          margin-bottom: 1em;
        }
        
        .rich-text-content strong {
          font-weight: 600;
          color: #0f172a;
        }
        
        .rich-text-content em {
          font-style: italic;
        }
        
        .rich-text-content u {
          text-decoration: underline;
        }
        
        .rich-text-content s {
          text-decoration: line-through;
        }
        
        .rich-text-content ul {
          list-style-type: disc;
          padding-left: 1.5em;
          margin-bottom: 1em;
        }
        
        .rich-text-content ol {
          list-style-type: decimal;
          padding-left: 1.5em;
          margin-bottom: 1em;
        }
        
        .rich-text-content li {
          margin-bottom: 0.5em;
          padding-left: 0.25em;
        }
        
        .rich-text-content ul ul,
        .rich-text-content ol ol,
        .rich-text-content ul ol,
        .rich-text-content ol ul {
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        
        .rich-text-content a {
          color: #0ea5e9;
          text-decoration: underline;
          transition: color 0.2s;
        }
        
        .rich-text-content a:hover {
          color: #0284c7;
        }
        
        .rich-text-content .ql-align-center {
          text-align: center;
        }
        
        .rich-text-content .ql-align-right {
          text-align: right;
        }
        
        .rich-text-content .ql-align-justify {
          text-align: justify;
        }
        
        .rich-text-content .ql-indent-1 {
          padding-left: 3em;
        }
        
        .rich-text-content .ql-indent-2 {
          padding-left: 6em;
        }
        
        .rich-text-content .ql-indent-3 {
          padding-left: 9em;
        }
      `}</style>
    </>
  )
}
