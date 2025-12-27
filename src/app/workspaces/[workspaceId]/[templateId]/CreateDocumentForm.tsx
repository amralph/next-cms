import { Button } from '@/components/Button';
import { SignedDocumentRow } from '@/types/types';
import { useState, ReactNode } from 'react';
import { createDocument } from './actions';
import { useDocumentsPageContext } from './Providers/DocumentsPageProvider';

export const CreateDocumentForm = ({
  setDocumentsState,
  children, // child will handle file management
}: {
  setDocumentsState: React.Dispatch<React.SetStateAction<SignedDocumentRow[]>>;
  children: ReactNode;
}) => {
  const { workspaceId, workspaceName, templateId, template } =
    useDocumentsPageContext();

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const result = await createDocument(
      formData,
      workspaceId,
      templateId,
      template.key
    );

    if (result.success) {
      setDocumentsState((docs) => [
        {
          id: result.result?.documentId!,
          content: result.result?.content,
          template,
          signedContent: result.result?.signedContent,
        },
        ...docs,
      ]);
    } else {
      alert('Error creating document');
    }

    setLoading(false);
  };

  return (
    <div className='border border-white p-2 space-y-2'>
      <h2>Create {template.name}</h2>
      <form onSubmit={handleSubmit} className='space-y-2'>
        {children}{' '}
        {/* Children like DocumentFormContents can now access workspaceId & template */}
        <Button loading={loading}>Create {template.name}</Button>
      </form>
    </div>
  );
};
