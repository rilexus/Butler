import TextField from "@ui/TextField";

type Props = {
  name: string;
  description: string;
  onChangeName: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onChangeDescription: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  >;
};

const GeneralSection = ({
  name,
  description,
  onChangeName,
  onChangeDescription,
}: Props) => (
  <>
    <TextField label="Name" value={name} onChange={onChangeName} />
    <TextField
      label="Description"
      value={description}
      onChange={onChangeDescription}
    />
  </>
);

export default GeneralSection;
