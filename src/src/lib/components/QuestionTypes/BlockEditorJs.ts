import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Quote from '@editorjs/quote';
import Code from '@editorjs/code';
import Image from '@editorjs/image';
import type { Answer, Question } from '$lib/types';

export interface BlockEditorConfig {
  holder: HTMLElement;
  question: Question;
  answer: Answer | undefined;
  onAnswer: (answer: Answer) => void;
  onPreviewUpdate: (html: string) => void;
}

export class BlockEditorJs {
  private editor: EditorJS | null = null;
  private config: BlockEditorConfig;

  constructor(config: BlockEditorConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    if (this.editor) {
      await this.destroy();
    }

    this.editor = new EditorJS({
      holder: this.config.holder,
      tools: {
        header: Header,
        list: {
          class: List,
          inlineToolbar: true,
          config: {
            defaultStyle: 'unordered',
            onBackspace: async (event: KeyboardEvent) => {
              const selection = window.getSelection();
              if (!selection || !selection.anchorNode) return false;

              // Get the current list item element
              const listItem = selection.anchorNode.nodeType === Node.TEXT_NODE
                ? selection.anchorNode.parentElement?.closest('.cdx-list__item')
                : selection.anchorNode.closest('.cdx-list__item');

              if (!listItem) return false;

              // Check if cursor is at the start of the list item
              const isAtStart = selection.anchorOffset === 0;
              
              // Check if list item is empty or cursor is at start
              if (listItem.textContent?.trim() === '' || isAtStart) {
                event.preventDefault();
                
                const list = listItem.closest('.cdx-list');
                if (!list) return false;

                const items = Array.from(list.querySelectorAll('.cdx-list__item'));
                const currentIndex = items.indexOf(listItem);

                // Get current block index
                const currentBlockIndex = this.editor?.blocks.getCurrentBlockIndex();
                if (currentBlockIndex === undefined) return false;

                if (items.length <= 1) {
                  // If this is the last item, convert to paragraph
                  await this.editor?.blocks.delete(currentBlockIndex);
                  await this.editor?.blocks.insert('paragraph', {
                    text: ''
                  }, undefined, currentBlockIndex, true);
                  return true;
                } else {
                  // Get the block instance
                  const block = this.editor?.blocks.getBlockByIndex(currentBlockIndex);
                  if (!block) return false;

                  // Remove just this item
                  const listData = await block.save();
                  const newItems = listData.data.items.filter((_: any, i: number) => i !== currentIndex);
                  
                  // Update the list with remaining items
                  await block.save({
                    style: listData.data.style,
                    items: newItems
                  });

                  // Move cursor to end of previous item if available
                  if (currentIndex > 0) {
                    const prevItem = items[currentIndex - 1];
                    const range = document.createRange();
                    range.selectNodeContents(prevItem);
                    range.collapse(false);
                    selection.removeAllRanges();
                    selection.addRange(range);
                  }

                  return true;
                }
              }
              return false;
            }
          }
        },
        quote: Quote,
        code: Code,
        image: {
          class: Image,
          config: {
            uploader: {
              uploadByFile(file: File): Promise<{ success: number; file: { url: string } }> {
                return new Promise((resolve) => {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    resolve({
                      success: 1,
                      file: {
                        url: e.target?.result as string
                      }
                    });
                  };
                  reader.readAsDataURL(file);
                });
              },
              uploadByUrl(url: string): Promise<{ success: number; file: { url: string } }> {
                return Promise.resolve({
                  success: 1,
                  file: {
                    url
                  }
                });
              }
            }
          }
        }
      },
      data: this.getInitialData(),
      onChange: async () => {
        const data = await this.editor?.save();
        if (data) {
          const markdown = this.editorDataToMarkdown(data);
          this.config.onPreviewUpdate(markdown);
          this.config.onAnswer({
            questionId: this.config.question.id,
            value: [markdown],
            data: {
              editorData: data
            }
          });
        }
      },
      placeholder: 'Write your answer here...',
      onReady: () => {
        if (this.config.answer?.value?.[0]) {
          this.config.onPreviewUpdate(this.config.answer.value[0]);
        }
      }
    });
  }

  private getInitialData() {
    if (this.config.answer?.data?.editorData) {
      return this.config.answer.data.editorData;
    }

    return {
      blocks: [
        {
          type: 'paragraph',
          data: {
            text: this.config.answer?.value?.[0] || ''
          }
        }
      ]
    };
  }

  private cleanHtmlTags(text: string): string {
    text = text.replace(/<a href="([^"]+)">([^<]+)<\/a>/g, '[$2]($1)');
    return text
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<[^>]+>/g, '');
  }

  private editorDataToMarkdown(data: any): string {
    let markdown = '';
    
    data.blocks.forEach((block: any) => {
      switch (block.type) {
        case 'header':
          markdown += '#'.repeat(block.data.level) + ' ' + this.cleanHtmlTags(block.data.text) + '\n\n';
          break;
        case 'paragraph':
          markdown += this.cleanHtmlTags(block.data.text) + '\n\n';
          break;
        case 'list':
          block.data.items.forEach((item: string, index: number) => {
            const prefix = block.data.style === 'ordered' ? `${index + 1}.` : '-';
            markdown += `${prefix} ${this.cleanHtmlTags(item)}\n`;
          });
          markdown += '\n';
          break;
        case 'quote':
          markdown += `> ${this.cleanHtmlTags(block.data.text)}\n\n`;
          break;
        case 'code':
          markdown += '```\n' + block.data.code + '\n```\n\n';
          break;
        case 'image':
          const caption = block.data.caption ? ` "${this.cleanHtmlTags(block.data.caption)}"` : '';
          markdown += `![${this.cleanHtmlTags(block.data.caption || 'image')}](${block.data.file.url}${caption})\n\n`;
          break;
      }
    });

    return markdown.trim();
  }

  async save(): Promise<{ markdown: string }> {
    const data = await this.editor?.save();
    if (data) {
      return {
        markdown: this.editorDataToMarkdown(data)
      };
    }
    return { markdown: '' };
  }

  async destroy(): Promise<void> {
    if (this.editor) {
      await this.editor.destroy();
      this.editor = null;
    }
  }
}