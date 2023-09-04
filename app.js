const express = require("express");
const multer = require("multer");
const path = require("path");
const db = require("./db/db");
const cors = require("cors"); // Importe o pacote cors

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

// Configuração do Multer para o upload de arquivos MP3
const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname +
        "-" +
        Date.now() +
        "-" +
        file.originalname.split(".")[0] +
        path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });

// Rota para fazer upload de arquivos MP3
app.post("/upload", upload.single("audio"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("Nenhum arquivo enviado.");
  }

  const { originalname, filename } = req.file;
  const { nivel } = req.body;

  console.log("originalname:", originalname);
  console.log("filename:", filename);
  console.log("nivel:", nivel);

  if (!nivel || !["facil", "intermediario", "dificil"].includes(nivel)) {
    return res.status(400).send('Campo "nivel" inválido.');
  }

  // Insira informações sobre o arquivo no banco de dados
  const sql =
    "INSERT INTO audios (originalname, filename, nivel) VALUES (?, ?, ?)";
  db.run(sql, [originalname, filename, nivel], (err) => {
    if (err) {
      console.error(
        "Erro ao inserir o arquivo no banco de dados:",
        err.message
      );
      return res
        .status(500)
        .send("Erro ao inserir o arquivo no banco de dados.");
    }
    console.log("Arquivo inserido no banco de dados com sucesso.");
    res.status(200).send("Arquivo enviado com sucesso.");
  });
});

// Rota para listar áudios por nível
app.get("/audios/:nivel", (req, res) => {
  const { nivel } = req.params;
  if (!["facil", "intermediario", "dificil"].includes(nivel)) {
    return res.status(400).send("Nível inválido.");
  }

  const sql = "SELECT * FROM audios WHERE nivel = ?";
  db.all(sql, [nivel], (err, rows) => {
    if (err) {
      return res.status(500).send("Erro ao buscar áudios.");
    }
    res.json(rows);
  });
});

// Rota para buscar e retornar um arquivo de áudio
app.get("/audio/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, "uploads", filename);

  // Use a função "res.sendFile" do Express para enviar o arquivo de áudio
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Erro ao enviar o arquivo de áudio:", err);
      res.status(500).send("Erro ao enviar o arquivo de áudio.");
    }
  });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor ouvindo na porta ${port}`);
});
