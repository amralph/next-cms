import { RichTextArea } from '@/components/RichTextArea';
import { isReferenceObject } from '@/lib/helpers';
import { Field } from '@/types/template';
import React, { useState } from 'react';

export const ArrayInput = ({
  field,
  values,
}: {
  field: Field;
  values: unknown[];
}) => {
  const [inputCount, setInputCount] = useState(values?.length || 0);

  function makeInputName(field: Field, i: number) {
    // i is needed to differentiate fields
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
                <input type='file' name={makeInputName(field, i)} />
                {(values?.[i] as { _referenceId?: string })?._referenceId ? (
                  <a
                    href={
                      isReferenceObject(values?.[i])
                        ? values[i]._referenceId
                        : undefined
                    }
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    Open file
                  </a>
                ) : (
                  <p>File missing</p>
                )}
              </li>
            );
          } else if (field.arrayOf === 'reference') {
            return (
              <li className='space-x-2' key={i}>
                <label>{i + 1}</label>
                <input
                  type='text'
                  name={makeInputName(field, i)}
                  defaultValue={
                    isReferenceObject(values?.[i]) ? values[i]._referenceId : ''
                  }
                />
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
