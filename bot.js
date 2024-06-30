require('advanced-logs')
console.setConfig({
    timestamp: true,
    background: false
})

const ayarlar = require('./ayarlar.js')

const { Client, Partials, ActivityType, Events, GatewayIntentBits, EmbedBuilder, Colors } = require('discord.js')

const client = new Client({
    intents: [
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.Guilds,
    ],
    partials: [
        Partials.GuildMember,
        Partials.User
    ],
    allowedMentions: {
        parse: ['users', 'roles'],
        repliedUser: false
    },
    presence: {
        activities: [{
            name: ayarlar.bot_status,
            type: ActivityType.Custom,
            state: ayarlar.bot_status
        }],
        status: 'dnd'
    },
    shards: 'auto',
})

client.on(Events.ClientReady, async () => {
    console.success('', '[CLIENT] Bota başarıyla giriş yapıldı.')
})

client.on(Events.PresenceUpdate, async (oldPresence, newPresence) => {
    const SİSTEM_DURUMU = ayarlar.url_rol_sistemi.durum
    if (!SİSTEM_DURUMU) return;

    const ROL_ID = ayarlar.url_rol_sistemi.rol_id
    const SUNUCU_ID = ayarlar.url_rol_sistemi.sunucu_id
    const KANAL_ID = ayarlar.url_rol_sistemi.kanal_id
    const YAZI = ayarlar.url_rol_sistemi.yazı
    const ROL = await newPresence.guild.roles.fetch(ROL_ID).catch(() => null)
    const LOG_KANALI = await newPresence.guild.channels.fetch(KANAL_ID).catch(() => null)

    if (ROL_ID.length < 0 || SUNUCU_ID.length < 0 || KANAL_ID.length < 0 || YAZI.length < 0) return console.error('', '[VANITY ROLE SYSTEM] Config dosyasında eksiklik var. Lütfen kontrol edin.');

    if (newPresence.guild.id !== SUNUCU_ID) return;

    if (!ROL) return console.error('', '[VANITY ROLE SYSTEM] Rol bulunamadı.');
    if (!LOG_KANALI) return console.error('', '[VANITY ROLE SYSTEM] Kanal bulunamadı.');

    if (newPresence.activities.length === 0 && newPresence.member.roles.cache.has(ROL_ID)) {
        if (!newPresence.member.roles.cache.has(ROL_ID)) return;
        await vanityRole(newPresence.member, false)
    }
    if (newPresence.member.presence.status === 'offline' || (newPresence.member.presence.status === 'invisible' && newPresence.member.roles.cache.has(ROL_ID))) {
        if (!newPresence.member.roles.cache.has(ROL_ID)) return;
        await vanityRole(newPresence.member, false)
    }
    if (!newPresence.member.presence.activities[0]) return;
    if (newPresence.member.presence.activities[0].state === '') return;
    if (newPresence.member.presence.activities[0].state === null && newPresence.member.roles.cache.has(ROL_ID)) {
        if (!newPresence.member.roles.cache.has(ROL_ID)) return;
        await vanityRole(newPresence.member, false)
    }
    if (newPresence.activities.some((AKTİVİTE) => AKTİVİTE.type === 4 && AKTİVİTE.state && AKTİVİTE.state === YAZI) && !newPresence.member.roles.cache.has(ROL_ID)) {
        if (newPresence.member.roles.cache.has(ROL_ID)) return;
        await vanityRole(newPresence.member, true)
    } else {
        if (!newPresence.activities.some((AKTİVİTE) => AKTİVİTE.type === 4 && AKTİVİTE.state && AKTİVİTE.state === YAZI) && newPresence.member.roles.cache.has(ROL_ID)) {
            if (newPresence.status === 'offline' || newPresence.status === 'invisible') {
                await vanityRole(newPresence.member, false)
            }
            if (!newPresence.activities.some((AKTİVİTE) => AKTİVİTE.type === 4 && AKTİVİTE.state && AKTİVİTE.state === YAZI)) {
                await vanityRole(newPresence.member, false)
            }
        }
    }
})

client.login(ayarlar.bot_token)

process.on('unhandledRejection', (error) => {
    console.error('', `${error}`)
})
process.on('uncaughtException', (error) => {
    console.error('', `${error}`)
})
process.on('warning', (warning) => {
    console.warn('', `${warning}`)
})

async function vanityRole(member, boolean) {
    if (boolean) {
        if (!member.roles.cache.has(ayarlar.url_rol_sistemi.rol_id)) {
            await member.roles.add(ayarlar.url_rol_sistemi.rol_id)
        }
    } else {
        if (member.roles.cache.has(ayarlar.url_rol_sistemi.rol_id)) {
            await member.roles.remove(ayarlar.url_rol_sistemi.rol_id)
        }
    }
    const { user } = member
    const LOG_KANALI = await member.guild.channels.fetch(ayarlar.url_rol_sistemi.kanal_id).catch(() => null)
    const rol = `<@&${ayarlar.url_rol_sistemi.rol_id}>`
    const embed = new EmbedBuilder()
        .setTitle('Vanity Role System')
        .setColor(boolean ? Colors.Green : Colors.Red)
        .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL({ extension: 'png' }), url: "https://github.com/XRongo" })
        .addFields([
            { name: 'Kullanıcı', value: user.toString() },
            { name: 'Durum', value: boolean ? `${rol} rolü verildi.` : `${rol} rolü alındı.` },
            { name: 'Tarih', value: `<t:${Math.round(Date.now() / 1000)}:R>` },
            { name: 'Yazı', value: `${ayarlar.url_rol_sistemi.yazı}` }
        ])
        .setFooter({ text: `${client.user.username}`, iconURL: client.user.displayAvatarURL({ extension: 'png' }) })
        .setTimestamp()
    await LOG_KANALI.send({ embeds: [embed] })
}