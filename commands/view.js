const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('view')
		.setDescription('View list of reminders.'),
	
	async execute(interaction) {
		const rList = await interaction.client.db.findAll({ attributes: ['reminder'] });
		const rString = rList.map(r => r.reminder).join(', ') || 'No reminders found.';
		await interaction.reply(`List of reminders: ${rString}`);
	},
};