import packageMetadata from "../../../../../package.json";
import { SecurityDataSettings } from "@/components/security-data/SecurityDataSettings";

export default function SecurityDataSettingsPage(){
  return <SecurityDataSettings platformVersion={packageMetadata.version}/>;
}
