const ytsr = require('ytsr');
const Discord = require('discord.js');

module.exports = async (client, message, msg, player, searchQuery, playlist) => {
	let tries = 0;
	async function load(search) {

		const res = await client.music.search(search, message.author);
		if (res.loadType !== 'NO_MATCHES' && res.loadType !== 'LOAD_FAILED' && res.tracks.length > 0) {
			if (res.loadType == 'TRACK_LOADED' || res.loadType == 'SEARCH_RESULT') {
				player.queue.add(res.tracks[0]);
				if (!playlist && msg) msg.edit('', client.queuedEmbed(
					res.tracks[0].title,
					res.tracks[0].uri,
					res.tracks[0].duration,
					null,
					res.tracks[0].requester,
				));
				if (!player.playing && !player.paused && !player.queue.length) player.play();
			}
			else if (res.loadType == 'PLAYLIST_LOADED') {

				for (const track of res.playlist.tracks) {
					player.queue.add(track);
					if (!player.playing && !player.paused && !player.queue.length) player.play();
				}
				msg.edit('', client.queuedEmbed(
					res.playlist.info.name,
					res.playlist.info.uri,
					res.playlist.tracks.reduce((acc, cure) => ({
						duration: acc.duration + cure.duration,
					})).duration,
					res.playlist.tracks.length,
					res.playlist.tracks[0].requester.id,
				));
			}
			return;
		}
		else {
			const args = message.content.trim().split(/ +/g);

			const tries = 5;
			for(let i = 0; i < tries; i++) {
			const res = await client.music.search(args.join(' '), message.author);
			if(res.loadType != 'NO_MATCHES') {
				if (res.loadType == 'TRACK_LOADED') {
					player.queue.add(res.tracks[0]);
					msg.edit('', client.queuedEmbed(
						res.tracks[0].title,
						res.tracks[0].uri,
						res.tracks[0].duration,
						null,
						res.tracks[0].requester,
					));
					if (!player.playing) player.play();
					break;
				}
				else if (res.loadType == 'SEARCH_RESULT') {
					let n = 0;
					const tracks = res.tracks.slice(0, 10);

					const results = res.tracks
						.slice(0, 10)
						.map(result => `**${++n} -** [${result.title}](${result.uri})`)
						.join('\n');

					const embed = new Discord.MessageEmbed()
						.setAuthor('Song Selection.', message.author.displayAvatarURL())
						.setDescription(results)
						.setFooter('Your response time closes within the next 30 seconds. Type "cancel" to cancel the selection, type "queueall" to queue all songs.')
						.setColor(client.colors.main);
					await msg.edit('', embed);

					const filter = m =>
						(message.author.id === m.author.id) &&
						((parseInt(m.content) >= 1 && parseInt(m.content) <= tracks.length) || m.content.toLowerCase() === 'queueall' || m.content.toLowerCase() === 'cancel');

					try {
						const response = await message.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] });
						const entry = response.first().content.toLowerCase();
						if (entry === 'queueall') {
							for (const track of tracks) {
								player.queue.add(track);
							}
							msg.edit('', client.queuedEmbed(
								null,
								null,
								null,
								tracks.length,
								tracks[0].requester,
							));
						}
						else if(entry === 'cancel') {
							message.channel.send('Cancelled selection');
						}
						else {
							const track = tracks[entry - 1];
							player.queue.add(track);
							msg.edit('', client.queuedEmbed(
								res.tracks[entry - 1].title,
								res.tracks[entry - 1].uri,
								track.duration,
								null,
								res.tracks[entry - 1].requester,
							));
						}
						if (!player.playing) player.play();
					}
					catch (err) {
						message.channel.send('Cancelled selection.');
					}
					break;
				}
				else if (res.loadType == 'PLAYLIST_LOADED') {
					res.playlist.tracks.forEach(track => player.queue.add(track));
					msg.edit('', client.queuedEmbed(
						res.playlist.info.name,
						res.playlist.info.uri,
						res.playlist.tracks.reduce((acc, cure) => ({
							duration: acc.duration + cure.duration,
						})).duration,
						res.playlist.tracks.length,
						res.playlist.tracks[0].requester.id,
					));
					if (!player.playing) player.play();
					break;
				}
				else if(res.loadType == 'LOAD_FAILED') {
					msg.edit('An error occured. Please try again.');
					break;
				}
			}
			else if(i >= 4 && res.loadType != 'PLAYLIST_LOADED') msg.edit('No tracks found.');
		}
		}
	}
	return load(searchQuery);
};