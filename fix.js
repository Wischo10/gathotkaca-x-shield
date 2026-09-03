const fs = require('fs');

const pages = [
  'src/app/dashboard/ciso/page.tsx',
  'src/app/dashboard/vulnerability/page.tsx',
  'src/app/dashboard/soc/page.tsx',
  'src/app/dashboard/soc-l2/page.tsx',
  'src/app/dashboard/mssp/page.tsx',
  'src/app/dashboard/executive/page.tsx',
  'src/app/dashboard/data-hub/page.tsx',
  'src/app/dashboard/compliance/page.tsx',
  'src/app/dashboard/copilot/page.tsx'
];

for (const p of pages) {
  let content = fs.readFileSync(p, 'utf8');
  content = content.replace(/from "@\/app\/dashboard\/layout"/g, 'from "@/app/dashboard/SidebarContext"');
  fs.writeFileSync(p, content);
}

let layoutContent = fs.readFileSync('src/app/dashboard/layout.tsx', 'utf8');
layoutContent = layoutContent.replace(/import \{ createContext, useContext \} from "react";\n\nexport const SidebarToggleContext = createContext<\(\) => void>\(\(\) => \{\}\);\nexport function useSidebarToggle\(\) \{\n  return useContext\(SidebarToggleContext\);\n\}\n/, 'import { SidebarToggleContext } from "./SidebarContext";\n');
fs.writeFileSync('src/app/dashboard/layout.tsx', layoutContent);
console.log('done');
