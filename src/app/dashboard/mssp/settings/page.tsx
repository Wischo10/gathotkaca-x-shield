import packageInfo from "../../../../../package.json";
import { MsspSettings } from "@/components/mssp/MsspSettings";

export default function SettingsPage() {
  return <MsspSettings platformVersion={packageInfo.version} />;
}
