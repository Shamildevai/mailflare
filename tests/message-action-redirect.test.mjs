import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import test, { after } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const directory = mkdtempSync(join(root, "node_modules", "mailflare-message-actions-"));
after(() => rmSync(directory, { recursive: true, force: true }));
await build({
	stdin: {
		contents: `export { getMessageActionRedirect } from "./src/components/message-actions/utils.ts";`,
		resolveDir: root,
		sourcefile: "message-action-redirect-entry.ts",
	},
	outfile: join(directory, "entry.mjs"),
	bundle: true,
	platform: "node",
	format: "esm",
	target: "node24",
	tsconfig: join(root, "tsconfig.json"),
	packages: "external",
	logLevel: "silent",
});
const { getMessageActionRedirect } = await import(pathToFileURL(join(directory, "entry.mjs")).href);

test("moving a message sends the reader back to the list they opened it from", () => {
	for (const action of ["trash", "spam", "archive", "inbox"]) {
		assert.equal(getMessageActionRedirect(action, "/inbox"), "/inbox");
		assert.equal(getMessageActionRedirect(action, "/spam"), "/spam");
	}
});

test("actions that leave the message in place do not navigate", () => {
	for (const action of ["read", "unread", "delete"]) assert.equal(getMessageActionRedirect(action, "/inbox"), null);
});
