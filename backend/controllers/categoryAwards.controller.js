// Controller de premiações por categoria
// Traduz o resultado (ou erro) do service em resposta HTTP

import { getWinsByCategory as getWinsByCategoryService } from "../services/categoryAwards.service.js";

export async function getWinsByCategory(_req, res) {
    try {
        const data = await getWinsByCategoryService();

        return res.status(200).json({
            success: true,
            total: data.length,
            data
        });
    } catch (err) {
        if (err instanceof Error) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        console.error(err)
        return res.status(500).json({
            success: false,
            message: "Erro interno inesperado."
        });
    }
}