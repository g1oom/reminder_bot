module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		client.db.sync();
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};