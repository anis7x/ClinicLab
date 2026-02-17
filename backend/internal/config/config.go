package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port      string
	DBUrl     string
	JWTSecret string
}

func Load() *Config {
	// Load .env from backend directory (best-effort)
	godotenv.Load()

	return &Config{
		Port:      getEnv("PORT", "8080"),
		DBUrl:     getEnv("DB_URL", "postgres://postgres:postgres@localhost:5432/cliniclab?sslmode=disable"),
		JWTSecret: getEnv("JWT_SECRET", "cliniclab-dev-secret"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
