import { Content } from './extendsRowDataPacket';
import { Template } from './template';

export type DocumentContainer = {
  id: string;
  content: Content;
  template: Template;
};
