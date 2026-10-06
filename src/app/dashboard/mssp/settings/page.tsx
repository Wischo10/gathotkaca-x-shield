import packageInfo from "../../../../../package.json";
import { MsspSettings } from "@/components/mssp/MsspSettings";
import { getMsspSettingsDemo } from "@/services/mssp-demo-provider";

export default function SettingsPage() {
  return <MsspSettings platformVersion={packageInfo.version} demo={getMsspSettingsDemo()} />;
}
