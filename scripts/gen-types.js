import { execSync } from "node:child_process";

const [projectId, outputPath] = process.argv.slice(2);

if (!projectId || !outputPath) {
    console.error("Usage: npm run gen:types <projectId> <outputPath>");
    process.exit(1);
}

const cmd = `bunx supabase gen types typescript --project-id ${projectId} --schema public > ${outputPath}`;
execSync(cmd, { stdio: "inherit", shell: true });
