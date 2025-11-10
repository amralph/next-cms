import { Field } from '@/types/template';
import React, { useState } from 'react';

export const ArrayInput = ({
  field,
  values,
}: {
  field: Field;
  values?: string[] | boolean[] | number[];
}) => {
  const [inputCount, setInputCount] = useState(values?.length || 0);

  console.log(values);

  function makeInputName(field: Field, i: number) {
    return `${field.type}::${field.arrayOf}::${i}::${field.key}`;
  }

  return (
    <div className='space-y-1'>
      {Array.from({ length: inputCount }, (_, i) => {
        if (field.arrayOf === 'string') {
          return (
            <div className='space-x-2' key={field.key}>
              <label>{i + 1}</label>
              <input
                type='text'
                name={makeInputName(field, i)}
                defaultValue={values?.[i] as string}
              />
              {field.description && (
                <p className='text-xs'>{field.description}</p>
              )}
            </div>
          );
        }

        if (field.arrayOf === 'number') {
          return (
            <div className='space-x-2' key={field.key}>
              <label>{i + 1}</label>
              <input
                type='number'
                name={makeInputName(field, i)}
                defaultValue={values?.[i] as number}
              />
              {field.description && (
                <p className='text-xs'>{field.description}</p>
              )}
            </div>
          );
        }

        if (field.arrayOf === 'boolean') {
          return (
            <div className='space-x-2' key={field.key}>
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
                defaultChecked={values?.[i] as boolean}
              />
              {field.description && (
                <p className='text-xs'>{field.description}</p>
              )}
            </div>
          );
        }

        if (field.arrayOf === 'date') {
          return (
            <div className='space-x-2' key={field.key}>
              <label>{i + 1}</label>
              <input
                type='date'
                name={makeInputName(field, i)}
                defaultValue={values?.[i] as string}
              />
              {field.description && (
                <p className='text-xs'>{field.description}</p>
              )}
            </div>
          );
        }

        if (field.arrayOf === 'file') {
          return (
            <div className='space-x-2' key={field.key}>
              <label>{i + 1}</label>
              <input type='file' name={makeInputName(field, i)} />
              {field.description && (
                <p className='text-xs'>{field.description}</p>
              )}
            </div>
          );
        }

        if (field.arrayOf === 'reference') {
          return (
            <div className='space-x-2' key={field.key}>
              <label>{i + 1}</label>
              <input
                type='text'
                name={makeInputName(field, i)}
                defaultValue={(values?.[i] as string) || ''}
              />
              {field.description && (
                <p className='text-xs'>{field.description}</p>
              )}
            </div>
          );
        }
      })}
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
