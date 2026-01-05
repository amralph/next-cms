import { Button } from '@/components/Button';
import { FieldWithId } from './TemplateData';
import { TemplateFieldInput } from '../Inputs/TemplateFieldInput';

export const Field = ({
  field,
  removeField,
  updateField,
  workspaceId,
}: {
  field: FieldWithId;
  removeField: (fieldKey: string) => void;
  updateField?: (
    value: string | string[],
    fieldId: string,
    inputName: string
  ) => void;
  workspaceId: string;
}) => {
  return (
    <div className='flex flex-col border border-white p-2'>
      <TemplateFieldInput
        field={field}
        workspaceId={workspaceId}
        updateField={updateField}
      ></TemplateFieldInput>

      <Button
        type='button'
        onClick={() => removeField(field.key)}
        className='self-start mt-1'
      >
        Remove
      </Button>
    </div>
  );
};
