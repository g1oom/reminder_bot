const fs = require('fs');
const { Sequelize, Op, INTEGER } = require('sequelize');
const { CronJob } = require('cron');
const { DateTime } = require('luxon');
const { Client, Collection, Intents } = require('discord.js');
const { guildId, token } = require('./config.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

const Reminders = sequelize.define('reminders', {
	username: Sequelize.STRING,
	reminder: Sequelize.TEXT,
	date: Sequelize.STRING,
	channelId: Sequelize.STRING,
});
client.db = Reminders;

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

const checkReminder = new CronJob('0 0 * * *', async () => {
	const date = DateTime.now().toISODate();
	
	const currentReminders = await client.db.findAll({
		where: {
			date: {
				[Op.lte]: date
			}
		}
	});

	if (currentReminders.length == 0) return;

	for (const currentReminder of currentReminders) {
		const guild = await client.guilds.fetch(guildId);
		const channel = guild.channels.cache.get(currentReminder.channelId);
		channel.send(`From: ${currentReminder.username}\nReminder: ${currentReminder.reminder}`);
	}

	await client.db.destroy({
		where: {
			date: {
				[Op.lte]: date
			}
		}
	});
});

client.login(token);

checkReminder.start();