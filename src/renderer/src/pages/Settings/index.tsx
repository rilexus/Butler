import { PageRoot } from "../../components/PageRoot";
import { SettingsRoot, Section, SectionTitle, Row } from "./styles";
import Switch from "../../ui/Switch";
import { useThemeStore } from "../../store/ThemeStore";

const SettingsPage = () => {
  const { isDark, toggleTheme } = useThemeStore();

  return (
    <PageRoot>
      <SettingsRoot>
        <Section>
          <SectionTitle>Appearance</SectionTitle>
          <Row>
            <Switch label="Dark mode" checked={isDark} onChange={toggleTheme} />
          </Row>
        </Section>
      </SettingsRoot>
    </PageRoot>
  );
};

export default SettingsPage;
