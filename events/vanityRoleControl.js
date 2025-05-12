const Discord = require("discord.js")
const ayarlar = require(`../ayarlar.js`)

module.exports = {
    name: Discord.Events.ClientReady,
    once: true,

    async execute(client) {
        try {
            const SİSTEM_DURUMU = ayarlar.url_rol_sistemi.durum
            if (!SİSTEM_DURUMU) return;

            const ROL_ID = ayarlar.url_rol_sistemi.rol_id
            const SUNUCU_ID = ayarlar.url_rol_sistemi.sunucu_id
            const KANAL_ID = ayarlar.url_rol_sistemi.kanal_id
            const YAZILAR = ayarlar.url_rol_sistemi.yazılar
            const SUNUCU = await client.guilds.fetch(SUNUCU_ID).catch(() => null)
            const ROL = await SUNUCU.roles.fetch(ROL_ID).catch(() => null)
            const LOG_KANALI = await SUNUCU.channels.fetch(KANAL_ID).catch(() => null)

            if (ROL_ID.length < 0 || SUNUCU_ID.length < 0 || KANAL_ID.length < 0 || YAZILAR.length < 0 || YAZILAR[0].length < 0) return client.error('[VANITY ROLE SYSTEM] Ayarlar dosyasında eksiklik var. Lütfen kontrol edin.');

            if (!SUNUCU) return client.error('[VANITY ROLE SYSTEM] Sunucu bulunamadı.');
            if (!ROL) return client.error('[VANITY ROLE SYSTEM] Rol bulunamadı.');
            if (!LOG_KANALI) return client.error('[VANITY ROLE SYSTEM] Kanal bulunamadı.');

            const members = await SUNUCU.members.fetch().catch(() => null)
            if (!members) return client.error('[VANITY ROLE SYSTEM] Üyeler bulunamadı.');

            for (const SUNUCU_KULLANICI of members.values()) {
                if (SUNUCU_KULLANICI.user.bot) continue;
                if (SUNUCU_KULLANICI?.presence?.activities?.length === 0 && SUNUCU_KULLANICI.roles.cache.has(ROL_ID)) {
                    if (!SUNUCU_KULLANICI.roles.cache.has(ROL_ID)) return;
                    await vanityRole(SUNUCU_KULLANICI, false)
                }
                if (SUNUCU_KULLANICI.presence?.status === 'offline' || (SUNUCU_KULLANICI.presence?.status === 'invisible' && SUNUCU_KULLANICI.roles.cache.has(ROL_ID))) {
                    if (!SUNUCU_KULLANICI.roles.cache.has(ROL_ID)) return;
                    await vanityRole(SUNUCU_KULLANICI, false)
                }
                if (!SUNUCU_KULLANICI.presence?.activities[0]) return;
                if (SUNUCU_KULLANICI.presence?.activities[0]?.state === '') return;
                if (SUNUCU_KULLANICI.presence?.activities[0]?.state === null && SUNUCU_KULLANICI.roles.cache.has(ROL_ID)) {
                    if (!SUNUCU_KULLANICI.roles.cache.has(ROL_ID)) return;
                    await vanityRole(SUNUCU_KULLANICI, false)
                }
                if (SUNUCU_KULLANICI.presence?.activities?.some((AKTİVİTE) => AKTİVİTE.type === 4 && AKTİVİTE.state && YAZILAR.includes(AKTİVİTE.state)) && !SUNUCU_KULLANICI.roles.cache.has(ROL_ID)) {
                    if (SUNUCU_KULLANICI.roles.cache.has(ROL_ID)) return;
                    await vanityRole(SUNUCU_KULLANICI, true)
                } else {
                    if (!SUNUCU_KULLANICI.presence?.activities?.some((AKTİVİTE) => AKTİVİTE.type === 4 && AKTİVİTE.state && YAZILAR.includes(AKTİVİTE.state)) && SUNUCU_KULLANICI.roles.cache.has(ROL_ID)) {
                        if (SUNUCU_KULLANICI.status === 'offline' || SUNUCU_KULLANICI.status === 'invisible') {
                            await vanityRole(SUNUCU_KULLANICI, false)
                        }
                        if (!SUNUCU_KULLANICI.presence?.activities?.some((AKTİVİTE) => AKTİVİTE.type === 4 && AKTİVİTE.state && YAZILAR.includes(AKTİVİTE.state))) {
                            await vanityRole(SUNUCU_KULLANICI, false)
                        }
                    }
                }
            }

            async function vanityRole(SUNUCU_KULLANICI, boolean) {
                if (boolean) await SUNUCU_KULLANICI.roles.add(ROL);
                else await SUNUCU_KULLANICI.roles.remove(ROL);

                const { user } = SUNUCU_KULLANICI
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