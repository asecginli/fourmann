import { marked } from 'marked';
import type { Page, Question, QuizConfig, Section } from '$lib/types';

export class QuestionnaireService {
  private static instance: QuestionnaireService;
  private config: QuizConfig;
  private xmlContent: string = '';
  
  private constructor(config: QuizConfig) {
    this.config = config;
  }
  
  static getInstance(config: QuizConfig): QuestionnaireService {
    if (!QuestionnaireService.instance) {
      QuestionnaireService.instance = new QuestionnaireService(config);
    }
    return QuestionnaireService.instance;
  }

  private getFilenameFromUrl(url: string): string {
    return url.split('/').pop() || url;
  }

  private generateSubmissionId(filename: string): string {
    return btoa(filename);
  }
  
  async loadQuestionnaire(): Promise<Page[]> {
    try {
      const url = this.config.source || '/questions.xml';
      const response = await fetch(url);
      this.xmlContent = await response.text();

      if (!this.config.submission_id) {
        const filename = this.getFilenameFromUrl(url);
        this.config.submission_id = this.generateSubmissionId(filename);
      }

      return this.parseQuestionnaireXml(this.xmlContent);
    } catch (error) {
      console.error('Error loading questions:', error);
      throw error;
    }
  }
  
  private parseQuestionnaireXml(xmlText: string): Page[] {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    const pageElements = xmlDoc.getElementsByTagName('page');
    return Array.from(pageElements).map((p) => ({
      id: p.getAttribute('id') || crypto.randomUUID(),
      title: p.getAttribute('title') || '',
      submit: p.getAttribute('submit') === 'true',
      submitRemarks: p.getAttribute('submit-remarks') || 'This is the last page. Click \'Submit\' to send your answers.',
      sections: this.parseSections(p)
    }));
  }

  private parseSections(pageElement: Element): Section[] {
    const sectionElements = pageElement.getElementsByTagName('section');
    return Array.from(sectionElements).map(section => {
      const children = Array.from(section.children);
      const sectionContent = this.calculateWidths(children);
      
      return {
        content: sectionContent.map(item => {
          if (item.element.tagName.toLowerCase() === 'markdown') {
            return {
              type: 'markdown' as const,
              content: this.parseContent(item.element),
              width: item.width
            };
          } else {
            return {
              type: 'questions' as const,
              questions: this.parseQuestions(item.element, pageElement.getAttribute('id') || ''),
              width: item.width
            };
          }
        })
      };
    });
  }

  private calculateWidths(elements: Element[]): Array<{ element: Element, width: number }> {
    const totalElements = elements.length;
    let remainingWidth = 100;
    let unassignedElements = totalElements;

    // First pass: collect explicitly defined widths
    const results = elements.map(element => {
      const definedWidth = parseInt(element.getAttribute('width') || '0');
      if (definedWidth > 0) {
        remainingWidth -= definedWidth;
        unassignedElements--;
      }
      return { element, width: definedWidth };
    });

    // Second pass: distribute remaining width
    if (unassignedElements > 0) {
      const widthPerElement = Math.floor(remainingWidth / unassignedElements);
      results.forEach(item => {
        if (item.width === 0) {
          item.width = widthPerElement;
        }
      });
    }

    return results;
  }

  private parseQuestions(questionsElement: Element, pageId: string): Question[] {
    return Array.from(questionsElement.getElementsByTagName('question')).map((q, index) => {
      const questionText = q.getElementsByTagName('text')[0]?.textContent || '';
      const generatedId = btoa(`${pageId}${questionText}${index}`);
      
      return {
        id: q.getAttribute('id') || generatedId,
        type: q.getAttribute('type') as Question['type'],
        text: questionText,
        name: q.getAttribute('name') || questionText,
        required: q.getAttribute('required') === 'true',
        choices: Array.from(q.getElementsByTagName('choice')).map((c) => ({
          value: c.getAttribute('value') || crypto.randomUUID(),
          text: c.textContent || '',
          other: c.getAttribute('other') === 'true'
        })),
        allowMultiple: q.getAttribute('allowMultiple') === 'true',
        minValue: parseFloat(q.getAttribute('minValue') || 'NaN'),
        maxValue: parseFloat(q.getAttribute('maxValue') || 'NaN')
      };
    });
  }

  private parseContent(contentElement: Element | null): string | undefined {
    if (!contentElement) return undefined;
    
    const content = contentElement.textContent?.trim();
    if (!content) return undefined;
    
    return marked.parse(content) as string;
  }

  getConfig(): QuizConfig {
    return this.config;
  }
}