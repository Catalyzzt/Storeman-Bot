import { GuildMember, ChatInputCommandInteraction, PermissionsBitField, ButtonInteraction } from "discord.js"
import { getCollections } from './../mongoDB'

const checkPermissions = async (interaction: ChatInputCommandInteraction | ButtonInteraction, roleType: "admin" | "user", member: GuildMember) => {
    const collections = process.env.STOCKPILER_MULTI_SERVER === "true" ? getCollections(interaction.guildId) : getCollections()
    const permsInfo = (await collections.config.findOne({}, { projection: { admin: 1, user: 1 } }))!
    let permsLevel = 0

    if ("admin" in permsInfo) {
        for (let i = 0; i < permsInfo.admin.length; i++) {
            if (member.roles.cache.has(permsInfo.admin[i])) permsLevel = 2
        }
    }

    if (member.permissions.has(PermissionsBitField.Flags.Administrator)|| member.id === member.guild.ownerId) permsLevel = 2
    if ("user" in permsInfo && permsLevel === 0) {
        for (let i = 0; i < permsInfo.user.length; i++) {
            if (member.roles.cache.has(permsInfo.user[i])) permsLevel = 1
        }
    }

    if (roleType === "admin") {
        if (permsLevel === 2) return true
        else {
            interaction.editReply({ content: "Insufficient perms, you need at least '" + roleType + "'👨‍⚖️  to use this command" })
            return false
        }

    }
    else {
        if (permsLevel >= 1) return true
        else {
            interaction.editReply({ content: "Insufficient perms, you need at least '" + roleType + "'🙍‍♂️ to use this command" })
            return false
        }

    }
}

export default checkPermissions