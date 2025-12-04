import { FieldType } from '@/types/template';

export type Field = {
  key: string;
  name: string;
  description?: string;
  type: FieldType;
  arrayOf?: Exclude<FieldType, 'array'>;
};

export function handleAddField(
  e: React.FormEvent<HTMLFormElement>,
  templateString: string,
  setTemplateString: (value: React.SetStateAction<string>) => void
) {
  e.preventDefault();
  const formData = new FormData(e.target as HTMLFormElement);
  const data = Object.fromEntries(formData.entries()) as Field;

  if (data.description === '') {
    delete data.description;
  }

  try {
    const parsedTemplate = JSON.parse(templateString);

    const newTemplate = {
      ...parsedTemplate,
      fields: [...parsedTemplate.fields, data],
    };

    setTemplateString(JSON.stringify(newTemplate, null, 2));
  } catch (e) {
    console.error(e);
    alert('Could not parse JSON template. Try again');
  }
}
