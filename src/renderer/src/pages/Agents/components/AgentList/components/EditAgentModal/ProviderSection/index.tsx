import Select from "@ui/Select";

type Provider = { id: string; name: string };

type Props = {
  providerId: string;
  providers: Provider[];
  onChange: (value: string) => void;
};

const ProviderSection = ({ providerId, providers, onChange }: Props) => {
  const options = providers.map(({ id, name }) => ({ value: id, label: name }));
  return <Select label="Provider" options={options} value={providerId} onChange={onChange} />;
};

export default ProviderSection;
