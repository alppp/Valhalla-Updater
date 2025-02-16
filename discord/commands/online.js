/*
 * File: online.js
 * Project: valhalla-updater
 * File Created: Thursday, 13th June 2024 3:22:15 pm
 * Author: flaasz
 * -----
 * Last Modified: Thursday, 13th June 2024 10:40:52 pm
 * Modified By: flaasz
 * -----
 * Copyright 2024 flaasz
 */

const {
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');
const velocityMetrics = require('../../modules/velocityMetrics');
const mongo = require('../../modules/mongo');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('online')
        .setDescription('Shows online players!'),
    async execute(interaction) {
        await interaction.deferReply();
        const servers = await mongo.getServers();

        let data = await velocityMetrics.getPlayers();

        //console.log(data);

        const embed = new EmbedBuilder()
            .setColor(0x9c59b6)
            .setTimestamp()
            .setFooter({
                text: "To see all available servers use /servers"
            });

        let onlineCount = 0;
        let serverCount = 0;



        for (let server in data) {
            const fullName = server;
            
            let serv = servers.find(s => s.name.trim() === server);

            if (!serv) continue;
            let tag = serv.tag;
            //if (server.status == "success") serverCount++;

            let onlinePlayerCount = data[server].length;

            onlineCount += onlinePlayerCount;

            if (onlinePlayerCount > 0) {

                if (serv.excludeFromServerList) {
                    embed.addFields({
                        name: `${fullName} - **${onlinePlayerCount}**`,
                        value: `${data[server].toString().replace(/,/g, ", ").replace(/_/g, "\\_")}`
                    });

                } else {
                    embed.addFields({
                        name: `**[${tag.toUpperCase()}]** ${fullName} - **${onlinePlayerCount}**`,
                        value: `${data[server].toString().replace(/,/g, ", ").replace(/_/g, "\\_")}\n*${tag.toLowerCase()}.valhallamc.io*`
                    });
                }
            }
        }


        if (onlineCount == 0) {
            embed.addFields({
                name: `**Oops**`,
                value: `Looks like the servers are empty :c`
            });
        }

        embed.setTitle(`Players online: ${onlineCount}`);
        //embed.setDescription(`Servers online: ${serverCount}`);

        return await interaction.editReply({
            embeds: [embed]
        });

    },
};