import PlaceholderPage from "../components/common/PlaceholderPage";
import { useLocale } from "../context/LocaleContext";

function SettingsPage() {
  const { dict } = useLocale();
  return <PlaceholderPage title={dict.nav.settings} message={dict.common.placeholder} />;
}

export default SettingsPage;
