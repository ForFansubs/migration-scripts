// Bu script için .env dosyanızda 1.,2.,3.,4.,5. satırların dolu olması gerekmektedir.
// Script, cover_art dosyalarını output/anime & output/manga klasörüne çıkartır.
// Bu dosyaları direkt olarak FFs node-server/image klasörüne atabilirsiniz.
// NOT: Bulunamayan resimler de olacaktır. Bu dosyalar, hemen tespit edilsin diye silinmiyor,
// 0 byte olarak kalıyor.
require('dotenv').config()
const mariadb = require('mariadb');
const fs = require('fs')
const axios = require('axios')
const Path = require('path')
const standartSlugify = require('standard-slugify')

const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: process.env.DB_CONNECTION_LIMIT
})

function getAnimeLink(slug) {
    return `https://kitsu.io/api/edge/anime?filter[slug]=${slug}`
}

function getMangaLink(slug) {
    return `https://kitsu.io/api/edge/manga?filter[slug]=${slug}`
}

async function getPool(query) {
    let conn;
    let rows
    try {
        conn = await pool.getConnection()
        rows = await conn.query(query)
        return rows
    } catch (err) {
        throw err
    } finally {
        if (conn) conn.release()
    }
}

async function getAnimeCoverArts() {
    const animes = await getPool(`SELECT * FROM anime`)
    for await (const anime of animes) {
        let image_link, image_data
        let { slug } = anime

        slug = standartSlugify(slug)

        const filePath = Path.resolve(__dirname, "./output/anime", `${slug}-cover.jpeg`)
        writer = fs.createWriteStream(filePath, { flags: 'w' })

        console.log(`${slug} için kitsu.io üzerinden link aranıyor.`)

        try {
            const res = await axios.get(getAnimeLink(slug))
            console.log(res.data.data[0].attributes.posterImage.original)
            image_link = res.data.data[0].attributes.posterImage.original
            console.log(`${slug} için ${image_link} linki alındı.`)
        } catch (err) {
            console.log(`${slug} için kitsu.io bağlantısında sorun var.`)
            writer.destroy()
            continue
        }

        try {
            image_data = await axios.get(image_link, { responseType: 'stream' })
            console.log("Resim datası alındı. Yazıma başlanıyor.")
        } catch (err) {
            writer.destroy()
            console.log(err)
            continue
        }

        await image_data.data.pipe(writer)

        writer.on('data', (chunk) => {
            console.log(chunk)
            writer.destroy()
        }).on('end', () => {
            console.log("Okuma tamamlandı.")
        }).on('close', () => {
            console.log("Yazım durduruldu ve dosya başarıyla kapatıldı.")
        }).on('error', (err) => {
            console.log(err)
        })

        await setTimeout(() => null, 2000)
    }
}

async function getMangaCoverArts() {
    const mangas = await getPool(`SELECT * FROM manga`)
    for await (const manga of mangas) {
        let image_link, image_data
        let { slug } = manga

        slug = standartSlugify(slug)

        const filePath = Path.resolve(__dirname, "./output/manga", `${slug}-cover.jpeg`)
        writer = fs.createWriteStream(filePath, { flags: 'w' })

        console.log(`${slug} için kitsu.io üzerinden link aranıyor.`)

        try {
            const res = await axios.get(getMangaLink(slug))
            console.log(res.data.data[0].attributes.posterImage.large)
            image_link = res.data.data[0].attributes.posterImage.large
            console.log(`${slug} için ${image_link} linki alındı.`)
        } catch (err) {
            console.log(`${slug} için kitsu.io bağlantısında sorun var.`)
            writer.destroy()
            continue
        }

        try {
            image_data = await axios.get(image_link, { responseType: 'stream' })
            console.log("Resim datası alındı. Yazıma başlanıyor.")
        } catch (err) {
            writer.destroy()
            console.log(err)
            continue
        }

        await image_data.data.pipe(writer)

        writer.on('data', (chunk) => {
            console.log(chunk)
            writer.destroy()
        }).on('end', () => {
            console.log("Okuma tamamlandı.")
        }).on('close', () => {
            console.log("Yazım durduruldu ve dosya başarıyla kapatıldı.")
        }).on('error', (err) => {
            console.log(err)
        })

        await setTimeout(() => null, 2000)
    }
}

async function getAllCoverArts() {
    await getAnimeCoverArts()
    await getMangaCoverArts()
}

getAllCoverArts()