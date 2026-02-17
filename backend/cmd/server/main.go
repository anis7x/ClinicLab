package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	"github.com/anis7x/cliniclab/internal/auth"
	"github.com/anis7x/cliniclab/internal/config"
	"github.com/anis7x/cliniclab/internal/database"
	"github.com/anis7x/cliniclab/internal/handlers"
	"github.com/anis7x/cliniclab/internal/middleware"
	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func main() {
	// Load config
	cfg := config.Load()

	// Init JWT
	auth.InitJWT(cfg.JWTSecret)

	// Connect to database
	if err := database.Connect(cfg.DBUrl); err != nil {
		log.Fatalf("❌ Database connection failed: %v", err)
	}
	defer database.Close()

	// Run migrations
	execPath, _ := os.Executable()
	backendDir := filepath.Dir(filepath.Dir(filepath.Dir(execPath)))
	// Try to find migrations relative to working directory first
	migrationsDir := "migrations"
	if _, err := os.Stat(migrationsDir); os.IsNotExist(err) {
		migrationsDir = filepath.Join(backendDir, "migrations")
	}

	if err := database.RunMigrations(migrationsDir); err != nil {
		log.Fatalf("❌ Migration failed: %v", err)
	}

	// Seed data from frontend JSON files
	dataDir := "../src/data"
	if _, err := os.Stat(dataDir); os.IsNotExist(err) {
		dataDir = filepath.Join(backendDir, "..", "src", "data")
	}
	if err := database.SeedData(dataDir); err != nil {
		log.Printf("⚠️ Seed warning: %v (continuing anyway)", err)
	}

	// Setup router
	r := chi.NewRouter()

	// Middleware
	r.Use(chimw.Logger)
	r.Use(chimw.Recoverer)
	r.Use(chimw.RealIP)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "http://localhost:3000", "https://anis7x.github.io"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Routes
	r.Route("/api", func(r chi.Router) {
		// Auth routes (public)
		r.Route("/auth", func(r chi.Router) {
			r.Post("/register/patient", handlers.RegisterPatient)
			r.Post("/register/professional", handlers.RegisterProfessional)
			r.Post("/login", handlers.Login)

			// Protected
			r.Group(func(r chi.Router) {
				r.Use(middleware.AuthRequired)
				r.Get("/me", handlers.GetMe)
			})
		})

		// Provider/search routes (public)
		r.Get("/providers/search", handlers.SearchProviders)
		r.Get("/providers/{id}", handlers.GetProvider)

		// Data routes (public)
		r.Get("/wilayas", handlers.GetWilayas)
		r.Get("/services", handlers.GetServices)

		// Health check
		r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.Write([]byte(`{"status":"ok","service":"cliniclab"}`))
		})
	})

	// Server
	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Graceful shutdown
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
		<-sigChan

		log.Println("🛑 Shutting down server...")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		srv.Shutdown(ctx)
	}()

	fmt.Printf("\n🚀 ClinicLab API Server running on http://localhost:%s\n", cfg.Port)
	fmt.Println("   Routes:")
	fmt.Println("   POST /api/auth/register/patient")
	fmt.Println("   POST /api/auth/register/professional")
	fmt.Println("   POST /api/auth/login")
	fmt.Println("   GET  /api/auth/me")
	fmt.Println("   GET  /api/providers/search?wilaya=&service=")
	fmt.Println("   GET  /api/providers/{id}")
	fmt.Println("   GET  /api/wilayas")
	fmt.Println("   GET  /api/services")
	fmt.Println("   GET  /api/health")
	fmt.Println()

	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("❌ Server failed: %v", err)
	}
}
