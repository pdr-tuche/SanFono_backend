const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");

const dbFile = "./db/database.sqlite3";

const dbExists = fs.existsSync(dbFile);

const db = new sqlite3.Database("./db/database.sqlite3", (err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err.message);
  } else {
    console.log("Conectado ao banco de dados SQLite3");
    // Cria a coluna 'nivel' na tabela 'audios' se ela não existir
    if (!dbExists) {
      // Se o banco de dados não existir, crie o esquema
      db.run(`
          /* PRAGMA foreign_keys = OFF;
          BEGIN TRANSACTION;*/
          CREATE TABLE audios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            originalname TEXT,
            filename TEXT,
            nivel TEXT
          );
          /* COMMIT;
           PRAGMA foreign_keys = ON;*/
        `);
    }
  }
});

module.exports = db;
