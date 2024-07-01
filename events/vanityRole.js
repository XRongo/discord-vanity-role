const Discord = require("discord.js")
const ayarlar = require(`../ayarlar.js`)

module.exports = {
    name: Discord.Events.PresenceUpdate,

    async execute(client, oldPresence, newPresence) {
        try {
            const SİSTEM_DURUMU = ayarlar.url_rol_sistemi.durum
            if (!SİSTEM_DURUMU) return;

            const ROL_ID = ayarlar.url_rol_sistemi.rol_id
            const SUNUCU_ID = ayarlar.url_rol_sistemi.sunucu_id
            const KANAL_ID = ayarlar.url_rol_sistemi.kanal_id
            const YAZILAR = ayarlar.url_rol_sistemi.yazılar
            const ROL = await newPresence.guild.roles.fetch(ROL_ID).catch(() => null)
            const LOG_KANALI = await newPresence.guild.channels.fetch(KANAL_ID).catch(() => null)

            if (ROL_ID.length < 0 || SUNUCU_ID.length < 0 || KANAL_ID.length < 0 || YAZILAR.length < 0 || YAZILAR[0].length < 0) return client.error('[VANITY ROLE SYSTEM] Ayarlar dosyasında eksiklik var. Lütfen kontrol edin.');

            if (newPresence.guild.id !== SUNUCU_ID) return;

            if (!ROL) return client.error('[VANITY ROLE SYSTEM] Rol bulunamadı.');
            if (!LOG_KANALI) return client.error('[VANITY ROLE SYSTEM] Kanal bulunamadı.');

            if (newPresence.activities.length === 0 && newPresence.member.roles.cache.has(ROL_ID)) {
                if (!newPresence.member.roles.cache.has(ROL_ID)) return;
                await vanityRole(false)
            }
            if (newPresence.member.presence.status === 'offline' || (newPresence.member.presence.status === 'invisible' && newPresence.member.roles.cache.has(ROL_ID))) {
                if (!newPresence.member.roles.cache.has(ROL_ID)) return;
                await vanityRole(false)
            }
            if (!newPresence.member.presence.activities[0]) return;
            if (newPresence.member.presence.activities[0].state === '') return;
            if (newPresence.member.presence.activities[0].state === null && newPresence.member.roles.cache.has(ROL_ID)) {
                if (!newPresence.member.roles.cache.has(ROL_ID)) return;
                await vanityRole(false)
            }
            if (newPresence.activities.some((AKTİVİTE) => AKTİVİTE.type === 4 && AKTİVİTE.state && YAZILAR.includes(AKTİVİTE.state)) && !newPresence.member.roles.cache.has(ROL_ID)) {
                if (newPresence.member.roles.cache.has(ROL_ID)) return;
                await vanityRole(true)
            } else {
                if (!newPresence.activities.some((AKTİVİTE) => AKTİVİTE.type === 4 && AKTİVİTE.state && YAZILAR.includes(AKTİVİTE.state)) && newPresence.member.roles.cache.has(ROL_ID)) {
                    if (newPresence.status === 'offline' || newPresence.status === 'invisible') {
                        await vanityRole(false)
                    }
                    if (!newPresence.activities.some((AKTİVİTE) => AKTİVİTE.type === 4 && AKTİVİTE.state && YAZILAR.includes(AKTİVİTE.state))) {
                        await vanityRole(false)
                    }
                }
            }

            async function vanityRole(boolean) {
                if (boolean) await newPresence.member.roles.add(ROL);
                else await newPresence.member.roles.remove(ROL);

                const { user } = newPresence.member
                const rol = `<@&${ayarlar.url_rol_sistemi.rol_id}>`
                const embed = new Discord.EmbedBuilder()
                    .setTitle('Vanity Role System')
                    .setColor(boolean ? Discord.Colors.Green : Discord.Colors.Red)
                    .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL({ extension: 'png' }), url: "https://github.com/XRongo" })
                    .addFields([
                        { name: 'Kullanıcı', value: user.toString() },
                        { name: 'Durum', value: boolean ? `${rol} rolü verildi.` : `${rol} rolü alındı.` },
                    ])
                    .setFooter({ text: `${client.user.username}`, iconURL: client.user.displayAvatarURL({ extension: 'png' }) })
                    .setTimestamp()
                await LOG_KANALI.send({ embeds: [embed] })
            }
        } catch (error) {
            if (error.message.includes('Missing')) return client.error('[VANITY ROLE SYSTEM] Gerekli yetkilerim yok.');
            client.error(`[VANITY ROLE SYSTEM] ${error.message}`)
        }
    }
}


