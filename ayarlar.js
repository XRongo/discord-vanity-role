module.exports = {
    bot_token: "", // Bot tokeninizi buraya giriyorsunuz.
    bot_status: "", // Botun durumunda yazacak yazı

    url_rol_sistemi: {
        durum: false, // true yaparsanız sistemi açar false yaparsanız kapatır
        rol_id: "", // Duruma yazıyı yazınca verilecek rolün ID'si
        sunucu_id: "", // Sistemi Kullanacağınız Sunucunun ID'si
        kanal_id: "", // Log Kanalının ID'si
        yazılar: [""] // Rolün verilmesi için duruma yazılması gereken yazı
    }
}
