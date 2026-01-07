import { BaseField, Field, FieldType, TemplateJSON } from '@/types/types';
import { TemplateJSONWithIdFields } from './NewTemplate/TemplateData';
import { nanoid } from 'nanoid';

export function handleAddField(
  e: React.FormEvent<HTMLFormElement>,
  templateJSON: TemplateJSONWithIdFields,
  setTemplateJSON: (
    value: React.SetStateAction<TemplateJSONWithIdFields>
  ) => void
) {
  e.preventDefault();
  const formData = new FormData(e.target as HTMLFormElement);
  const data: unknown = {
    key: '',
    type: '',
    name: '',
    id: `${nanoid()}`,
  };
  for (const [key, value] of formData.entries()) {
    if (key === 'referenceTo') {
      const refField = data as BaseField & {
        type: 'reference';
        referenceTo: string[];
      };

      refField.type = 'reference';

      // Initialize array if it doesn't exist yet
      if (!refField.referenceTo) {
        refField.referenceTo = [];
      }

      refField.referenceTo.push(value as string);
    } else {
      if (key === 'type') {
        (data as Field)[key] = value as FieldType;
      } else {
        (data as Field)[key as 'key' | 'name' | 'description'] =
          value as string;
      }
    }
  }

  if ((data as Field).description === '') {
    delete (data as Field).description;
  }

  try {
    const newTemplate = {
      ...templateJSON,
      fields: [...templateJSON.fields, data],
    };

    setTemplateJSON(newTemplate as TemplateJSONWithIdFields);
  } catch (e) {
    console.error(e);
    alert('Could not parse JSON template. Try again');
  }
}
