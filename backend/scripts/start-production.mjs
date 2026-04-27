import { spawn } from "node:child_process";

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      env: process.env,
      stdio: "inherit",
      shell: process.platform === "win32",
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} exited with code ${code ?? 1}`));
    });

    child.on("error", reject);
  });
}

async function main() {
  await runCommand("npx", ["prisma", "migrate", "deploy", "--schema", "prisma/schema.prisma"]);
  await runCommand("node", ["dist/server.js"]);
}

main().catch((error) => {
  console.error("Failed to start SecureBoard production server");
  console.error(error);
  process.exit(1);
});