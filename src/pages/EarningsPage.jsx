import PlaceholderPage from "../components/common/PlaceholderPage";
import { useLocale } from "../context/LocaleContext";

function EarningsPage() {
  const { dict } = useLocale();
  return <PlaceholderPage title={dict.nav.earnings} message={dict.common.placeholder} />;
}

export default EarningsPage;
