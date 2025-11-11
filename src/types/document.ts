import { Content } from './extendsRowDataPacket';
import { Template } from './template';

export interface DocumentContainer {
  id: string;
  content: Content;
  template: Template;
}
