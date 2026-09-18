import rateLimit from "express-rate-limit";

// Rate limiter global
export const globalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // janela de tempo: 15 minutos
    max: 100,                 // máximo de 100 requisições por IP nesse período
    message: {
        success: false,
        message: "Muitas requisições. Tente novamente em 15 minutos.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});