const cron = require('node-cron');
import { TextChannel } from 'discord.js';
import { client } from '../index';
import { CONSTANTS } from '../constants';
import { formatISO } from 'date-fns';
import { scheduledEvent } from '../utils/scheduled-event';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

/**
 * Water Cooler Wednesdays
 */
export const run = () => {
    const prisma = new PrismaClient();

    cron.schedule('0 * * * MON', async () => {
        const data = await prisma.wcwTopic.findFirst({
            where: { used: false },
        });

        if (!data) {
            const channel = client.channels.cache.get(
                CONSTANTS.MODERATOR_CHANNEL_ID,
            ) as TextChannel;
            return await channel.send(
                "All Water Cooler Wednesday topics have been used ❗️ Add a new one with `/update-wcw` command",
            );
        }
    });

    scheduledEvent({
        scheduling: '0 8 * * TUE',
        scheduledStartTime: new Date(Date.now() + 1000 * 3600 * 8),
        scheduledEndTime: new Date(Date.now() + 1000 * 3600 * 16),
        name: 'Water Cooler Wednesday 💦',
        description: `It's 💦 Water Cooler Wednesday 🥳 Today, we're chatting about What was your summer highlight? 👀 Have an interesting opinion or something you want to share, let us know!`,
        channel: CONSTANTS.GENERAL_CHANNEL_ID,
        entityType: 'EXTERNAL',
        entityMetadata: { location: '#general channel' },
    });

    cron.schedule('0 8 * * WED', async () => {
        const date = formatISO(new Date(), { representation: 'date' });
        const guild = client.guilds.cache.get(CONSTANTS.GUILD_ID);
        const channel = guild?.channels.cache.get(CONSTANTS.GENERAL_CHANNEL_ID) as TextChannel;
        const data = await prisma.wcwTopic.findFirst({
            where: { used: false },
        });

        if (!data) {
            const channel = client.channels.cache.get(
                CONSTANTS.MODERATOR_CHANNEL_ID,
            ) as TextChannel;

            await Promise.allSettled([
                channel.send(
                    'All Water Cooler Wednesday topics have been used ❗️ You will need to manually create the thread',
                ),
                logger({
                    project: 'blacc',
                    channel: 'general',
                    event: 'Failed WCW thread',
                    description: 'No topic available for Water Cooler Wednesday',
                    icon: '🔴',
                    notify: true,
                }),
            ]);

            return;
        }

        const createdMessage = await channel.send({
            content: `It's 💦 Water Cooler Wednesday <@&${CONSTANTS.MEMBER_ROLE_ID}> 🥳 Today, we're chatting about \`${data.topic}?\` 👀 Have an interesting opinion or something you want to share, let us know!`,
        });

        await Promise.allSettled([
            createdMessage.startThread({
                name: `💦 Water Cooler Wednesday ${date}`,
                reason: 'Engaging topics for members',
            }),
            prisma.wcwTopic.update({
                where: { id: data.id },
                data: { used: true },
            }),
        ]);
    });
};
