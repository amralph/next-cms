import { Button } from '@/components/Button';
import { TemplateJSON, TemplateRow } from '@/types/types';
import React, { Dispatch, SetStateAction, useState } from 'react';

export const AIPrompt = ({
  references,
  setNewTemplate,
}: {
  references: TemplateRow[];
  setNewTemplate: Dispatch<SetStateAction<TemplateJSON>>;
}) => {
  const [loading, setLoading] = useState(false);

  async function generate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);

    const res = await fetch(
      `/api/openai?prompt=${encodeURI(formData.get('prompt') as string)}`,
      { method: 'post', body: JSON.stringify({ references }) }
    );

    const data = await res.json();

    setNewTemplate(
      JSON.parse(
        data.response.output_text.slice(
          data.response.output_text.indexOf('{'),
          data.response.output_text.lastIndexOf('}') + 1
        )
      )
    );

    setLoading(false);
  }

  return (
    <form
      onSubmit={generate}
      className='flex space-x-2 align-middle items-center'
    >
      <label>Generate a template with AI</label>
      <textarea name='prompt'></textarea>
      <Button loading={loading}>Generate</Button>
    </form>
  );
};
