import { FieldType } from '@/types/types';
import {
  TemplateJSONWithIdFields,
  FieldWithId,
} from './NewTemplate/TemplateData';
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
  const data: FieldWithId = {
    key: '',
    type: 'string',
    name: '',
    id: `${nanoid()}`,
  };
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
    const newTemplate = {
      ...templateJSON,
      fields: [...templateJSON.fields, data],
    };

    setTemplateJSON(newTemplate);
  } catch (e) {
    console.error(e);
    alert('Could not parse JSON template. Try again');
  }
}
