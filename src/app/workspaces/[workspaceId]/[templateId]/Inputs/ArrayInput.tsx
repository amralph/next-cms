import { RichTextArea } from '@/components/RichTextArea';
import { isReferenceObject } from '@/lib/helpers';
import { Field, SignedFile, SignedReference } from '@/types/types';
import { useState } from 'react';
import { ReferenceInput } from './ReferenceInput';
import { FileInput } from './FileInput';

export const ArrayInput = ({
  workspaceId,
  field,
  values,
  signedValues,
  files,
}: {
  workspaceId: string;
  field: Field;
  values: unknown[];
  signedValues: unknown[];
  files: SignedFile[];
}) => {
  const [inputCount, setInputCount] = useState(values?.length || 0);

  function makeInputName(field: Field, i: number) {
    // i is needed to differentiate elements in array
    return `${field.type}::${field.arrayOf}::${field.key}::${i}`;
  }

  return (
    <div className='space-y-1'>
      <ol className='space-y-1'>
        {Array.from({ length: inputCount }, (_, i) => {
          if (field.arrayOf === 'string') {
            return (
              <li className='space-x-2' key={i}>
                <label>{i + 1}</label>
                <input
                  type='text'
                  name={makeInputName(field, i)}
                  defaultValue={
                    typeof values?.[i] === 'string' ? values[i] : ''
                  }
                />
              </li>
            );
          } else if (field.arrayOf === 'richText') {
            return (
              <li className='space-x-2' key={i}>
                <label>{i + 1}</label>

                <RichTextArea
                  name={makeInputName(field, i)}
                  value={typeof values?.[i] === 'string' ? values[i] : ''}
                ></RichTextArea>
              </li>
            );
          } else if (field.arrayOf === 'number') {
            return (
              <li className='space-x-2' key={i}>
                <label>{i + 1}</label>
                <input
                  type='number'
                  name={makeInputName(field, i)}
                  defaultValue={
                    typeof values?.[i] === 'number'
                      ? Number(values[i])
                      : undefined
                  }
                />
              </li>
            );
          } else if (field.arrayOf === 'boolean') {
            return (
              <li className='space-x-2' key={i}>
                <label>{i + 1}</label>
                <input
                  type='hidden'
                  name={makeInputName(field, i)}
                  value='false'
                />
                <input
                  type='checkbox'
                  name={makeInputName(field, i)}
                  value='true'
                  defaultChecked={
                    typeof values?.[i] === 'boolean' ? values[i] : false
                  }
                />
              </li>
            );
          } else if (field.arrayOf === 'date') {
            return (
              <li className='space-x-2' key={i}>
                <label>{i + 1}</label>
                <input
                  type='date'
                  name={makeInputName(field, i)}
                  defaultValue={
                    typeof values?.[i] === 'string' ? values[i] : ''
                  }
                />
              </li>
            );
          } else if (field.arrayOf === 'dateTime') {
            return (
              <li className='space-x-2' key={i}>
                <label>{i + 1}</label>
                <input
                  type='dateTime-local'
                  name={makeInputName(field, i)}
                  defaultValue={
                    typeof values?.[i] === 'string' ? values[i] : ''
                  }
                />
              </li>
            );
          } else if (field.arrayOf === 'time') {
            return (
              <li className='space-x-2' key={i}>
                <label>{i + 1}</label>
                <input
                  type='time'
                  name={makeInputName(field, i)}
                  defaultValue={
                    typeof values?.[i] === 'string' ? values[i] : ''
                  }
                />
              </li>
            );
          } else if (field.arrayOf === 'file') {
            return (
              <li className='space-x-2 flex' key={i}>
                <label>{i + 1}</label>

                <FileInput
                  value={signedValues?.[i] as SignedReference}
                  name={makeInputName(field, i)}
                  files={files}
                />
              </li>
            );
          } else if (field.arrayOf === 'reference') {
            return (
              <li className='space-x-2' key={i}>
                <label>{i + 1}</label>
                <ReferenceInput
                  templateIds={field.referenceTo as string[]}
                  workspaceId={workspaceId}
                  name={makeInputName(field, i)}
                  defaultValue={
                    isReferenceObject(values?.[i]) ? values[i]._referenceId : ''
                  }
                ></ReferenceInput>
              </li>
            );
          }
        })}
      </ol>
      <div className='space-x-2'>
        <button
          type='button'
          onClick={() => setInputCount((inputCount) => inputCount + 1)}
        >
          Add
        </button>
        {inputCount > 0 && (
          <button
            type='button'
            onClick={() =>
              setInputCount((inputCount) => {
                if (inputCount > 0) {
                  return inputCount - 1;
                } else {
                  return inputCount;
                }
              })
            }
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
};
