// Bu script için .env dosyanızda 1.,2.,3.,4.,5. satırların dolu olması gerekmektedir.
// Script, cover_art dosyalarını output/anime & output/manga klasörüne çıkartır.
// Bu dosyaları direkt olarak FFs node-server/image klasörüne atabilirsiniz.
// NOT: Bulunamayan resimler de olacaktır. Bu dosyalar, hemen tespit edilsin diye silinmiyor,
// 0 byte olarak kalıyor.
require('dotenv').config()
const CreateMetadataCanvas = require('./create_metadata_canvas')
const { getPool } = require('./database')

async function getAnimeMetadataArts() {
    const animes = await getPool(`SELECT * FROM anime`)
    for await (const anime of animes) {
        let { slug } = anime

        console.log(slug)

        await CreateMetadataCanvas({ type: "anime", slug })
    }
}

async function getMangaMetadataArts() {
    const mangas = await getPool(`SELECT * FROM manga`)
    for await (const manga of mangas) {
        let { slug } = manga

        console.log(slug)

        await CreateMetadataCanvas({ type: "manga", slug })
    }
}

async function getAllMetadataArts() {
    await getAnimeMetadataArts()
    await getMangaMetadataArts()
}

getAllMetadataArts()

module.exports = { getPool }