import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Quote from '@editorjs/quote';
import Code from '@editorjs/code';
import Marker from '@editorjs/marker';
import type { Answer, Question } from '../types';

export interface EditorConfig {
  holder: HTMLElement;
  question: Question;
  answer: Answer | undefined;
  onAnswer: (answer: Answer) => void;
  onPreviewUpdate: (html: string) => void;
}

export class EditorService {
  private editor: EditorJS | null = null;
  private saveTimeout: number | null = null;
  private config: EditorConfig;

  constructor(config: EditorConfig) {
    this.config = config;
  }

  private getInitialData() {
    if (!this.config.answer?.value?.[0] && !this.config.answer?.data?.editorData) {
      return {
        blocks: [
          {
            type: 'paragraph',
            data: {
              text: ''
            }
          }
        ]
      };
    }

    if (this.config.answer?.data?.editorData) {
      try {
        return JSON.parse(this.config.answer.data.editorData);
      } catch (error) {
        console.warn('Failed to parse editor data, falling back to markdown content');
      }
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

  private editorDataToMarkdown(data: any): string {
    let markdown = '';
    
    data.blocks.forEach((block: any) => {
      switch (block.type) {
        case 'header':
          markdown += '#'.repeat(block.data.level) + ' ' + block.data.text + '\n\n';
          break;
        case 'paragraph':
          markdown += block.data.text + '\n\n';
          break;
        case 'list':
          block.data.items.forEach((item: string, index: number) => {
            const prefix = block.data.style === 'ordered' ? `${index + 1}.` : '-';
            markdown += `${prefix} ${item}\n`;
          });
          markdown += '\n';
          break;
        case 'quote':
          markdown += `> ${block.data.text}\n\n`;
          break;
        case 'code':
          markdown += '```\n' + block.data.code + '\n```\n\n';
          break;
        default:
          markdown += block.data.text + '\n\n';
      }
    });

    return markdown.trim();
  }

  async initialize(): Promise<void> {
    if (this.editor) {
      await this.destroy();
    }

    const initialData = this.getInitialData();

    this.editor = new EditorJS({
      holder: this.config.holder,
      tools: {
        header: {
          class: Header,
          config: {
            levels: [1, 2, 3],
            defaultLevel: 1
          }
        },
        list: {
          class: List,
          inlineToolbar: true,
          config: {
            defaultStyle: 'unordered'
          }
        },
        quote: {
          class: Quote,
          inlineToolbar: true
        },
        code: Code,
        marker: Marker
      },
      data: initialData,
      onChange: async () => {
        if (this.saveTimeout) {
          clearTimeout(this.saveTimeout);
        }

        this.saveTimeout = setTimeout(async () => {
          try {
            const data = await this.editor?.save();
            if (data) {
              const markdown = this.editorDataToMarkdown(data);
              this.config.onPreviewUpdate(markdown);
              this.config.onAnswer({
                questionId: this.config.question.id,
                value: [markdown],
                data: {
                  editorData: JSON.stringify(data)
                }
              });
            }
          } catch (error) {
            console.error('Error saving editor data:', error);
          }
        }, 300) as unknown as number;
      },
      placeholder: 'Write your answer here...',
      onReady: () => {
        // Update preview with initial content
        if (this.config.answer?.value?.[0]) {
          this.config.onPreviewUpdate(this.config.answer.value[0]);
        }
      }
    });
  }

  async destroy(): Promise<void> {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }

    if (this.editor) {
      await this.editor.destroy();
      this.editor = null;
    }
  }
}