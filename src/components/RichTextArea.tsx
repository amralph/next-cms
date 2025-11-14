import { useState } from 'react';
import Editor from 'react-simple-wysiwyg';

export const RichTextArea = ({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: string;
}) => {
  const [html, setHtml] = useState(defaultValue);

  function onChange(e: React.FormEvent<HTMLTextAreaElement>) {
    setHtml((e.target as HTMLTextAreaElement).value);
  }

  return (
    <>
      <Editor
        value={html}
        onChange={onChange}
        name={name}
        defaultValue={defaultValue}
      />
      <textarea
        name={name}
        value={html}
        defaultValue={defaultValue}
        readOnly
        hidden
      />
    </>
  );
};
