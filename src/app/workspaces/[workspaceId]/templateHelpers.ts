import { FieldType, TemplateJSON } from '@/types/template';

export type Field = {
  key: string;
  name: string;
  description?: string;
  type: FieldType;
  arrayOf?: Exclude<FieldType, 'array'>;
};

export function handleAddField(
  e: React.FormEvent<HTMLFormElement>,
  template: TemplateJSON,
  setTemplate: (value: React.SetStateAction<TemplateJSON>) => void
) {
  e.preventDefault();
  const formData = new FormData(e.target as HTMLFormElement);
  const data = Object.fromEntries(formData.entries()) as Field;

  if (data.description === '') {
    delete data.description;
  }

  try {
    const parsedTemplate = template;

    const newTemplate = {
      ...parsedTemplate,
      fields: [...parsedTemplate.fields, data],
    };

    setTemplate(newTemplate);
  } catch (e) {
    console.error(e);
    alert('Could not parse JSON template. Try again');
  }
}
