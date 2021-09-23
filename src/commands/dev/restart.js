const Command = require('../../structures/Command');

module.exports = class Shutdown extends Command {
	constructor(client) {
		super(client, {
			name: 'restart',
			description: 'Restart the bot.',
			permission: 'dev',
		});
	}
	async run(client, message) {
		const msg = await message.channel.send('Restart...');

		try {
			process.exit();
		}
		catch (e) {
			client.error(e, true, msg);
		}
	}
};