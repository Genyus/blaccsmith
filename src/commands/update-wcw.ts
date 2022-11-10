import { CommandInteraction, CacheType, GuildMember } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { CONSTANTS } from '../constants';
import { addTopic } from '../lib/addTopic';
import logger from '../utils/logger';

export const data = new SlashCommandBuilder()
    .setName('update-wcw')
    .setDescription('Add a topic for Water Cooler Wednesdays 💦')
    .addStringOption(option =>
        option.setName('topic').setDescription('Your topic').setRequired(true),
    );

export async function execute(interaction: CommandInteraction<CacheType>) {
    const topic = interaction.options.getString('topic') as string;
    const member = interaction.member as GuildMember;

    if (!member.roles.cache.has(CONSTANTS.MODERATOR_ROLE_ID)) {
        await interaction.reply({
            content: '🚨 You do not have privileges to add WCW topics',
            ephemeral: true,
        });
        return;
    }
    // ask user to confirm topic
    await interaction.reply({
        content: `Are you sure you want to add the topic: ${topic}?`,
        components: [
            {
                type: 'ACTION_ROW',
                components: [
                    {
                        type: 'BUTTON',
                        style: 'SUCCESS',
                        customId: 'confirm',
                        label: 'Confirm',
                    },
                    {
                        type: 'BUTTON',
                        style: 'DANGER',
                        customId: 'cancel',
                        label: 'Cancel',
                    },
                ],
            },
        ],
    });

    // wait for user to confirm or cancel
    const filter = (i: any) => i.customId === 'confirm' || i.customId === 'cancel';
    const collector = interaction.channel?.createMessageComponentCollector({ filter, time: 15000 });

    collector?.on('collect', async (i: any) => {
        if (i.customId === 'confirm') {
            await Promise.all([
                // addTopic(topic),
                interaction.editReply({
                    content: `✅ Topic added: ${topic}`,
                    components: [],
                }),
                logger({
                    project: 'blacc',
                    channel: 'general',
                    event: 'WCW topic added',
                    description: `Called by ${member.id}`,
                    icon: '🟢',
                    notify: true,
                }),
            ]);
        } else if (i.customId === 'cancel') {
            await Promise.all([
                interaction.editReply({
                    content: `❌ Topic not added: ${topic}`,
                    components: [],
                }),
                logger({
                    project: 'blacc',
                    channel: 'general',
                    event: 'adding wcw topic cancelled',
                    description: `called by ${member.id}`,
                    icon: '🔴',
                    notify: true,
                }),
            ]);
        }
    });

    collector?.on('end', async collected => {
        if (collected.size === 0) {
            await Promise.all([
                interaction.editReply({
                    content: '❌ You did not confirm or cancel in time',
                    components: [],
                }),
                logger({
                    project: 'blacc',
                    channel: 'general',
                    event: 'adding wcw topic cancelled',
                    description: `called by ${member.id}`,
                    icon: '🔴',
                    notify: true,
                }),
            ]);
        }
    });
    // await Promise.all([
    //     addTopic(topic),
    //     interaction.reply({
    //         content: 'Topic has been added ✅',
    //         ephemeral: true,
    //     }),
    //     logger({
    //         project: 'blacc',
    //         channel: 'general',
    //         event: 'WCW topic added',
    //         description: `Called by ${member.id}`,
    //         icon: '🟢',
    //         notify: true,
    //     }),
    // ]);
}
