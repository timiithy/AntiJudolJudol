const fs = require('fs');
const csv = require('csv-parser');

const uploadCSV = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'File CSV tidak ditemukan!' });
  }

  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (row) => {
      // Setiap baris CSV masuk jd object
      results.push(row);
    })
    .on('end', async () => {
      fs.unlinkSync(req.file.path);

      // KERJAIN SETELAH ADA DB ===> Modifikasi jadi logic insert ke database
      // Contoh struktur data yang masuk:
      // results = [
      //   { post_text: '...', url: 'http://...', keyword: 'judol' },
      //   ...
      // ]

      console.log(`${results.length} baris berhasil dibaca dari CSV`);

      // KERJAIN SETELAH ADA DB ===> Insert ke tabel post, url, keyword_match
      // await db.post.insertMany(results);
      // Lalu trigger analysis pipeline
      // await triggerAnalysis(results);

      return res.status(200).json({
        message: `${results.length} data berhasil diupload!`,
        data: results, // Hapus baris ini di production
      });
    })
    .on('error', (err) => {
      return res.status(500).json({ message: 'Gagal membaca CSV', error: err.message });
    });
};

module.exports = { uploadCSV };