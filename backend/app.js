import "dotenv/config";
import express from "express";
import cors from "cors";
import sequelize from "./config/database.js";

const app = express();
app.use(cors());
app.use(express.json());

// Rotas da aplicação devem ser registradas aqui, antes dos handlers de 404/erro abaixo.

app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Rota não encontrada: ${req.method} ${req.originalUrl}`
    });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        success: false,
        message: "Erro interno inesperado."
    });
});

async function iniciarServidor() {
    try {
        await sequelize.authenticate();
        console.log("Banco de dados conectado!");
        await sequelize.sync({ alter: true });
        console.log("Tabelas sincronizadas!");
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Servidor rodando em http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("Erro ao iniciar a aplicação:");
        console.error(error);
    }
}

iniciarServidor();

export default app;