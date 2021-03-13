// Bu script için .env dosyanızda 1.,2.,3.,4.,5. satırların dolu olması gerekmektedir.
// Script, cover_art dosyalarını output/anime & output/manga klasörüne çıkartır.
// Bu dosyaları direkt olarak FFs node-server/image klasörüne atabilirsiniz.
// NOT: Bulunamayan resimler de olacaktır. Bu dosyalar, hemen tespit edilsin diye silinmiyor,
// 0 byte olarak kalıyor.
require("dotenv").config();
const CreateMetadataCanvas = require("./create_metadata_canvas");
const { getPool } = require("./database");

async function getAnimeMetadataArts() {
    const animes = await getPool(`SELECT * FROM anime`);
    for await (const anime of animes) {
        let { slug } = anime;

        console.log(`${slug}-anime için metadata görseli oluşturuluyor.`);

        try {
            await CreateMetadataCanvas({ type: "anime", slug });
        } catch (err) {
            console.log(`${slug}-anime için metadata görseli oluşturulamadı.`);
        }
    }
}

async function getMangaMetadataArts() {
    const mangas = await getPool(`SELECT * FROM manga`);
    for await (const manga of mangas) {
        let { slug } = manga;

        console.log(`${slug}-manga için metadata görseli oluşturuluyor.`);

        try {
            await CreateMetadataCanvas({ type: "manga", slug });
        } catch (err) {
            console.log(`${slug}-manga için metadata görseli oluşturulamadı.`);
        }
    }
}

async function getAllMetadataArts() {
    await getAnimeMetadataArts();
    await getMangaMetadataArts();

    console.log("\n\n\nİşlem tamamlandı.");
}

getAllMetadataArts();

module.exports = { getPool };
