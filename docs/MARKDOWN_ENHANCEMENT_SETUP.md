# Markdown Enhancement Setup

This document describes the enhanced Markdown rendering features and how to enable them.

## Features

The enhanced Markdown renderer (`MarkdownRenderer`) includes:

1. **LaTeX Math Rendering**: Supports inline math `$...$` and block math `$$...$$`
2. **Syntax Highlighting**: Code blocks with language-specific syntax highlighting
3. **GitHub Flavored Markdown**: Tables, strikethrough, task lists, etc.

## Installation

To enable LaTeX math and syntax highlighting, install the required packages:

```bash
npm install remark-math rehype-katex katex prismjs @types/prismjs
```

## Usage

The `MarkdownRenderer` component is used throughout the application:

- **NoteForm**: Markdown editor preview
- **CourseDetailPage**: Lesson content rendering
- **ChatbotPage**: Message content rendering

### Basic Usage

```tsx
import MarkdownRenderer from './components/molecules/MarkdownRenderer';

<MarkdownRenderer content={markdownContent} />;
```

### With Custom Components

```tsx
<MarkdownRenderer
  content={markdownContent}
  components={{
    a: ({ href, children }) => <Link to={href}>{children}</Link>,
  }}
/>
```

## Math Syntax

### Inline Math

```
The quadratic formula is $x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}$
```

### Block Math

```
$$
\int_0^1 x^2 \,dx = \frac{1}{3}
$$
```

## Code Blocks

### With Syntax Highlighting

````markdown
```javascript
function greet(name) {
  return `Hello, ${name}!`;
}
```
````

Supported languages include: JavaScript, TypeScript, Python, Java, C++, C, C#, Go, Rust, PHP, Ruby, Swift, Kotlin, SQL, Bash, JSON, YAML, Markdown, CSS, HTML, JSX, TSX, and more.

## Notes

- The component gracefully handles missing packages (math and syntax highlighting will be disabled)
- KaTeX CSS is automatically imported when available
- Prism CSS is automatically imported when available
- Dark mode is fully supported for both math and code blocks
