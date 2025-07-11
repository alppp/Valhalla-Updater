/*
 * File: cakeDrop.js
 * Project: valhalla-updater
 * File Created: Monday, 27th May 2024 8:35:46 pm
 * Author: flaasz
 * -----
 * Last Modified: Monday, 16th September 2024 1:31:16 am
 * Modified By: flaasz
 * -----
 * Copyright 2024 flaasz
 */

const functions = require("../modules/functions");
const mongo = require("../modules/mongo");
const pterodactyl = require("../modules/pterodactyl");
const velocityMetrics = require("../modules/velocityMetrics");
const sessionLogger = require("../modules/sessionLogger");
const {
    alertCakeDrop
} = require("../config/messages.json");

module.exports = {
    name: "cakeDrop",
    defaultConfig: {
        "active": true,
        "interval": 120,
        "min": 1,
        "max": 10,
        "chance": 3,
        "exclude": []
    },

    /**
     * Starts a scheduler that has a chance to give players on the servers a random amount of cake.
     * @param {object} options Object containing options for the scheduler.
     */
    start: async function (options) {
        //dropCake();
        setInterval(() => this.dropCake(options), options.interval * 60 * 1000);
    },

    dropCake: async function (options) {

        const randomNumber = Math.random();

        if (randomNumber < 1 / options.chance) {
            sessionLogger.info('CakeDrop', "Attempting to drop cake... Dropping cake!");

            let cakeAmount = Math.floor(Math.random() * (options.max - options.min + 1)) + options.min;

            let servers = await mongo.getServers();
            let playerData = await velocityMetrics.getPlayers();

            let totalAmount = 0;
            let totalPlayers = 0;

            for (let serverName in playerData) {
                let server = servers.find(s => s.name.trim() === serverName);

                for (let player of playerData[serverName]) {
                    if (require("../config/config.json").scheduler.cakeDrop.exclude.includes(player)) continue;
                    await pterodactyl.sendCommand(server.serverId, alertCakeDrop.replace("[RECIEVERS]", player));
                    if (server.serverId === "dff4e4d4") {
                        await pterodactyl.sendCommand(server.serverId, `give ${player} tfc:cake ${cakeAmount}`);

                    } else {
                        await pterodactyl.sendCommand(server.serverId, `give ${player} minecraft:cake ${cakeAmount}`);
                    }
                    totalAmount += cakeAmount;
                    totalPlayers++;
                    await functions.sleep(100);
                }
            }
            sessionLogger.info('CakeDrop', `Dropped ${totalAmount} cakes to ${totalPlayers} players!`);
        } else {
            sessionLogger.info('CakeDrop', "Attempting to drop cake... No cake dropped.");
        }
    },

    dropCakeManual: async function (cakeAmount) {
        let servers = await mongo.getServers();
        let playerData = await velocityMetrics.getPlayers();

        let totalAmount = 0;
        let totalPlayers = 0;

        for (let serverName in playerData) {
            let server = servers.find(s => s.name.trim() === serverName);

            for (let player of playerData[serverName]) {
                if (require("../config/config.json").scheduler.cakeDrop.exclude.includes(player)) continue;
                await pterodactyl.sendCommand(server.serverId, alertCakeDrop.replace("[RECIEVERS]", player));
                if (server.serverId === "dff4e4d4") {
                    await pterodactyl.sendCommand(server.serverId, `give ${player} tfc:cake ${cakeAmount}`);

                } else {
                    await pterodactyl.sendCommand(server.serverId, `give ${player} minecraft:cake ${cakeAmount}`);
                }
                totalAmount += cakeAmount;
                totalPlayers++;
                await functions.sleep(100);
            }
        }
        sessionLogger.info('CakeDrop', `Dropped ${totalAmount} cakes to ${totalPlayers} players!`);
        return `Done! Dropped **${totalAmount}** cakes to **${totalPlayers}** players!`;
    }

};