export function htmlToMarkdown(html: string): string {
  // First, normalize line endings and remove extra spaces
  let markdown = html.trim()
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n');

  // Convert headings
  markdown = markdown
    .replace(/<h1>(.*?)<\/h1>/g, '# $1\n\n')
    .replace(/<h2>(.*?)<\/h2>/g, '## $1\n\n')
    .replace(/<h3>(.*?)<\/h3>/g, '### $1\n\n');

  // Convert tables
  markdown = markdown.replace(/<table>([\s\S]*?)<\/table>/g, (match, content) => {
    let result = '';
    const rows = content.match(/<tr>([\s\S]*?)<\/tr>/g) || [];
    
    rows.forEach((row: string, rowIndex: number) => {
      const cells = row.match(/<t[hd]>([\s\S]*?)<\/t[hd]>/g) || [];
      const processedCells = cells.map((cell: string) => {
        return cell.replace(/<t[hd]>([\s\S]*?)<\/t[hd]>/g, '$1').trim();
      });
      
      result += '| ' + processedCells.join(' | ') + ' |\n';
      
      // Add separator after header row
      if (rowIndex === 0) {
        result += '| ' + processedCells.map(() => '---').join(' | ') + ' |\n';
      }
    });
    
    return result + '\n';
  });

  // Handle lists with proper indentation and spacing
  markdown = markdown.replace(/<ul>([\s\S]*?)<\/ul>/g, (match, content) => {
    return content
      .replace(/<li>([\s\S]*?)<\/li>/g, (_, item) => {
        const processedItem = item
          .replace(/<p>([\s\S]*?)<\/p>/g, '$1')
          .trim();
        return `- ${processedItem}\n`;
      })
      .trim() + '\n\n';
  });

  markdown = markdown.replace(/<ol>([\s\S]*?)<\/ol>/g, (match, content) => {
    let counter = 1;
    return content
      .replace(/<li>([\s\S]*?)<\/li>/g, (_, item) => {
        const processedItem = item
          .replace(/<p>([\s\S]*?)<\/p>/g, '$1')
          .trim();
        return `${counter++}. ${processedItem}\n`;
      })
      .trim() + '\n\n';
  });

  // Convert links
  markdown = markdown.replace(/<a href="(.*?)">(.*?)<\/a>/g, '[$2]($1)');

  // Convert paragraphs
  markdown = markdown.replace(/<p>([\s\S]*?)<\/p>/g, '$1\n\n');

  // Convert code blocks
  markdown = markdown.replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g, '```\n$1\n```\n\n');

  // Convert inline code
  markdown = markdown.replace(/<code>(.*?)<\/code>/g, '`$1`');

  // Convert blockquotes
  markdown = markdown.replace(/<blockquote>([\s\S]*?)<\/blockquote>/g, (match, content) => {
    return content
      .split('\n')
      .map(line => `> ${line}`)
      .join('\n') + '\n\n';
  });

  // Convert bold and italic
  markdown = markdown
    .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
    .replace(/<em>(.*?)<\/em>/g, '*$1*')
    .replace(/<s>(.*?)<\/s>/g, '~~$1~~');

  // Convert line breaks
  markdown = markdown.replace(/<br\s*\/?>/g, '\n');

  // Remove any remaining HTML tags
  markdown = markdown.replace(/<[^>]+>/g, '');

  // Decode HTML entities
  markdown = markdown
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Clean up extra whitespace and normalize line endings
  markdown = markdown
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+|\s+$/g, '');

  return markdown;
}