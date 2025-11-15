import { RichTextArea } from '@/components/RichTextArea';
import { Content } from '@/types/extendsRowDataPacket';
import { Field } from '@/types/template';
import React, { useState } from 'react';

export const ArrayInput = ({
  field,
  values,
}: {
  field: Field;
  values: Content[];
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
                    typeof values?.[i] === 'string' ? values[i] : undefined
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
                  defaultValue={
                    typeof values?.[i] === 'string' ? values[i] : undefined
                  }
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
                    typeof values?.[i] === 'string' ? values[i] : undefined
                  }
                />
              </li>
            );
          } else if (field.arrayOf === 'file') {
            return (
              <li className='space-x-2' key={i}>
                <label>{i + 1}</label>
                <input type='file' name={makeInputName(field, i)} />
                {values[i] && (
                  <a
                    href={
                      typeof values?.[i]?._referenceId === 'string'
                        ? values[i]?._referenceId
                        : undefined
                    }
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    Open file
                  </a>
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
                    typeof values?.[i]?._referenceId === 'string'
                      ? values[i]?._referenceId
                      : undefined
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
      </div>
    </div>
  );
};
