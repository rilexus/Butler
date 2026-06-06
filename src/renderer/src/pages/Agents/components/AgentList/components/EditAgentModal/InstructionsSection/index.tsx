import TextField from "@ui/TextField";

type Props = {
  instructions: string;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
};

const InstructionsSection = ({ instructions, onChange }: Props) => (
  <TextField
    multiline
    label="Instructions"
    value={instructions}
    rows={6}
    onChange={onChange}
  />
);

export default InstructionsSection;
