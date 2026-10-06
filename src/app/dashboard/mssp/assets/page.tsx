import { MsspAssets } from "@/components/mssp/MsspAssets";
import { getMsspAssetsDemo } from "@/services/mssp-demo-provider";

export default function AssetsPage() {
  return <MsspAssets demo={getMsspAssetsDemo()} />;
}
