const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remind')
		.setDescription('Set a reminder.')
		.addStringOption((option) => 
			option
				.setName('reminder')
				.setDescription('Enter reminder.')
				.setRequired(true)
		)
		.addStringOption((option) => 
			option
				.setName('date')
				.setDescription('Enter date of reminder (YYYY-MM-DD).')
				.setRequired(true)
		),

	async execute(interaction) {
		const newReminder = interaction.options.getString('reminder');
		const newDate = interaction.options.getString('date');

		try {
			const reminderInput = await interaction.client.db.create({
				username: interaction.user.username,
				reminder: newReminder,
				date: newDate,
				channelId: interaction.channelId,
			});

			return interaction.reply('Reminder added.');
		}
		catch (error) {
			return interaction.reply('Something went wrong with adding the reminder.');
		}
	},
};