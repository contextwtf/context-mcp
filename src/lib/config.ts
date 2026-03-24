import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const CONFIG_DIR = join(homedir(), ".config", "context");
const CONFIG_FILE = join(CONFIG_DIR, "config.env");

/** Display-friendly path to the config file. */
export function configPath(): string {
  return "~/.config/context/config.env";
}

/** Parse a KEY=VALUE env file, stripping comments, blanks, and surrounding quotes. */
function parseEnvFile(content: string): Record<string, string> {
  const entries: Record<string, string> = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    let value = trimmed.slice(eq + 1);
    // Strip surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    entries[key] = value;
  }
  return entries;
}

/** Serialize key-value pairs as KEY="VALUE" lines. */
function serializeEnvFile(data: Record<string, string>): string {
  return Object.entries(data)
    .map(([k, v]) => `${k}="${v}"`)
    .join("\n") + "\n";
}

/** Load config from ~/.config/context/config.env. Returns {} if missing. */
export function loadConfig(): Record<string, string> {
  try {
    return parseEnvFile(readFileSync(CONFIG_FILE, "utf-8"));
  } catch {
    return {};
  }
}

/** Save values to ~/.config/context/config.env, merging with existing. chmod 600. */
export function saveConfig(values: Record<string, string>): void {
  mkdirSync(CONFIG_DIR, { recursive: true });
  const existing = loadConfig();
  const merged = { ...existing, ...values };
  writeFileSync(CONFIG_FILE, serializeEnvFile(merged), { mode: 0o600 });
}
