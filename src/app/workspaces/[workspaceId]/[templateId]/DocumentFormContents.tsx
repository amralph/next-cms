import { TemplateJSON } from '@/types/template';
import { ArrayInput } from './ArrayInput';
import { RichTextArea } from '@/components/RichTextArea';
import { getStringField, hasKey, isReferenceObject } from '@/lib/helpers';

export const DocumentFormContents = ({
  template,
  content,
  signedContent,
}: {
  template: TemplateJSON;
  content?: unknown;
  signedContent?: unknown;
}) => {
  return (
    <>
      {template.fields?.map((field) => {
        if (field.type === 'string') {
          return (
            <div className='space-x-2' key={field.key}>
              <label>{field.name}</label>
              <input
                type='text'
                name={`${field.type}::${field.key}`}
                defaultValue={getStringField(content, field.key)}
              />
              {field.description && (
                <p className='text-xs'>{field.description}</p>
              )}
            </div>
          );
        } else if (field.type === 'richText') {
          return (
            <div className='space-x-2' key={field.key}>
              <label>{field.name}</label>
              <RichTextArea
                name={`${field.type}::${field.key}`}
                value={getStringField(content, field.key)}
              ></RichTextArea>
              {field.description && (
                <p className='text-xs'>{field.description}</p>
              )}
            </div>
          );
        } else if (field.type === 'number') {
          return (
            <div className='space-x-2' key={field.key}>
              <label>{field.name}</label>
              <input
                type='number'
                name={`${field.type}::${field.key}`}
                defaultValue={getStringField(content, field.key)}
              />
              {field.description && (
                <p className='text-xs'>{field.description}</p>
              )}
            </div>
          );
        } else if (field.type === 'boolean') {
          return (
            <div className='space-x-2' key={field.key}>
              <label>{field.name}</label>
              <input
                type='hidden'
                name={`${field.type}::${field.key}`}
                value='false'
              />
              <input
                type='checkbox'
                name={`${field.type}::${field.key}`}
                value='true'
                defaultChecked={
                  getStringField(content, field.key) === 'true' ? true : false
                }
              />
              {field.description && (
                <p className='text-xs'>{field.description}</p>
              )}
            </div>
          );
        } else if (field.type === 'date') {
          return (
            <div className='space-x-2' key={field.key}>
              <label>{field.name}</label>
              <input
                type='date'
                name={`${field.type}::${field.key}`}
                defaultValue={getStringField(content, field.key)}
              />
              {field.description && (
                <p className='text-xs'>{field.description}</p>
              )}
            </div>
          );
        } else if (field.type === 'time') {
          return (
            <div className='space-x-2' key={field.key}>
              <label>{field.name}</label>
              <input
                type='time'
                name={`${field.type}::${field.key}`}
                defaultValue={getStringField(content, field.key)}
              />
              {field.description && (
                <p className='text-xs'>{field.description}</p>
              )}
            </div>
          );
        } else if (field.type === 'dateTime') {
          return (
            <div className='space-x-2' key={field.key}>
              <label>{field.name}</label>
              <input
                type='datetime-local'
                name={`${field.type}::${field.key}`}
                defaultValue={getStringField(content, field.key)}
              />
              {field.description && (
                <p className='text-xs'>{field.description}</p>
              )}
            </div>
          );
        } else if (field.type === 'file') {
          return (
            <div className='space-x-2 flex' key={field.key}>
              <div>
                <label>{field.name}</label>
                <input type='file' name={`${field.type}::${field.key}`} />
                {field.description && (
                  <p className='text-xs'>{field.description}</p>
                )}
              </div>

              {getStringField(signedContent, field.key) &&
                (() => {
                  if (hasKey(signedContent, field.key)) {
                    const fieldValue = signedContent[field.key];
                    if (isReferenceObject(fieldValue)) {
                      if (fieldValue.__signedUrl) {
                        return (
                          <a
                            href={fieldValue.__signedUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            Open file
                          </a>
                        );
                      } else {
                        return <p>File missing</p>;
                      }
                    }
                  }

                  return null;
                })()}
            </div>
          );
        } else if (field.type === 'reference') {
          return (
            <div className='space-x-2' key={field.key}>
              <label>{field.name}</label>
              <input
                type='text'
                name={`${field.type}::${field.key}::${template.key}`}
                defaultValue={(() => {
                  if (hasKey(content, field.key)) {
                    const fieldValue = content[field.key];
                    if (isReferenceObject(fieldValue)) {
                      return fieldValue._referenceId;
                    }
                  }
                  return undefined;
                })()}
              />
              {field.description && (
                <p className='text-xs'>{field.description}</p>
              )}
            </div>
          );
        } else if (field.type === 'array') {
          return (
            <div className='space-x-2' key={field.key}>
              <label>{field.name}</label>
              <ArrayInput
                field={field}
                values={(() => {
                  if (hasKey(content, field.key)) {
                    const value = content[field.key];
                    if (Array.isArray(value)) {
                      return value;
                    }
                  }
                  return [];
                })()}
                signedValues={(() => {
                  if (hasKey(signedContent, field.key)) {
                    const value = signedContent[field.key];
                    if (Array.isArray(value)) {
                      return value;
                    }
                  }
                  return [];
                })()}
              />
              {field.description && (
                <p className='text-xs'>{field.description}</p>
              )}
            </div>
          );
        }
      })}
    </>
  );
};
