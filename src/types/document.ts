import { Content } from './extendsRowDataPacket';
import { TemplateJSON } from './template';

export interface DocumentContainer {
  id: string;
  content: Content;
  template: TemplateJSON;
}
