import { Field, FieldType } from '@/types/template';

export function handleAddField(
  e: React.FormEvent<HTMLFormElement>,
  templateString: string,
  setTemplateString: (value: React.SetStateAction<string>) => void
) {
  e.preventDefault();
  const formData = new FormData(e.target as HTMLFormElement);
  const data: Field = { key: '', type: 'string', name: '' };
  for (const [key, value] of formData.entries()) {
    if (key === 'referenceTo') {
      // Initialize array if it doesn't exist yet
      if (!data.referenceTo) {
        data.referenceTo = [];
      }
      data.referenceTo.push(value as string);
    } else {
      if (key === 'type') {
        data[key] = value as FieldType;
      } else {
        data[key as 'key' | 'name' | 'description'] = value as string;
      }
    }
  }

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
