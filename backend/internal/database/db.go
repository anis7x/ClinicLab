package database

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
)

var Pool *pgxpool.Pool

// Connect creates a connection pool to PostgreSQL.
func Connect(dbURL string) error {
	var err error
	Pool, err = pgxpool.New(context.Background(), dbURL)
	if err != nil {
		return fmt.Errorf("unable to connect to database: %w", err)
	}

	if err := Pool.Ping(context.Background()); err != nil {
		return fmt.Errorf("unable to ping database: %w", err)
	}

	log.Println("✅ Connected to PostgreSQL")
	return nil
}

// RunMigrations executes all SQL files in the migrations directory.
func RunMigrations(migrationsDir string) error {
	entries, err := os.ReadDir(migrationsDir)
	if err != nil {
		return fmt.Errorf("cannot read migrations directory: %w", err)
	}

	// Sort by filename to ensure correct order
	var sqlFiles []string
	for _, e := range entries {
		if !e.IsDir() && strings.HasSuffix(e.Name(), ".sql") {
			sqlFiles = append(sqlFiles, e.Name())
		}
	}
	sort.Strings(sqlFiles)

	for _, f := range sqlFiles {
		path := filepath.Join(migrationsDir, f)
		content, err := os.ReadFile(path)
		if err != nil {
			return fmt.Errorf("cannot read migration %s: %w", f, err)
		}

		_, err = Pool.Exec(context.Background(), string(content))
		if err != nil {
			return fmt.Errorf("migration %s failed: %w", f, err)
		}

		log.Printf("✅ Migration applied: %s", f)
	}

	return nil
}

// Close shuts down the connection pool.
func Close() {
	if Pool != nil {
		Pool.Close()
	}
}
