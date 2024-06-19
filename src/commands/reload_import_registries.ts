import { wrapCommand } from "nova-utils";

export default function registerReloadImportRegistries(client: LanguageClient) {
	return nova.commands.register(
		"co.gwil.deno.commands.reloadImportRegistries",
		wrapCommand(reloadImportRegistries),
	);

	async function reloadImportRegistries() {
		await client.sendRequest("workspace/executeCommand", {
			command: "deno.reloadImportRegistries",
		});
	}
}
