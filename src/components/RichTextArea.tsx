import { useState } from 'react';
import Editor from 'react-simple-wysiwyg';

export const RichTextArea = ({
  name,
  value,
}: {
  name: string;
  value?: string;
}) => {
  const [html, setHtml] = useState(value);

  function onChange(e: React.FormEvent<HTMLTextAreaElement>) {
    setHtml((e.target as HTMLTextAreaElement).value);
  }

  return (
    <>
      <Editor value={html} onChange={onChange} name={name} />
      <textarea name={name} value={html} readOnly hidden />
    </>
  );
};
