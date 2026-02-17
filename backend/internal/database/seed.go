package database

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/anis7x/cliniclab/internal/models"
)

// SeedData loads JSON data files from the frontend into the database.
func SeedData(dataDir string) error {
	ctx := context.Background()

	// Check if data already seeded
	var count int
	Pool.QueryRow(ctx, "SELECT COUNT(*) FROM wilayas").Scan(&count)
	if count > 0 {
		log.Println("📦 Data already seeded, skipping")
		return nil
	}

	log.Println("🌱 Seeding database...")

	// 1. Seed wilayas
	if err := seedWilayas(ctx, dataDir+"/wilayas.json"); err != nil {
		return fmt.Errorf("seeding wilayas: %w", err)
	}

	// 2. Seed medical services
	if err := seedServices(ctx, dataDir+"/medical_services.json"); err != nil {
		return fmt.Errorf("seeding services: %w", err)
	}

	// 3. Seed providers
	if err := seedProviders(ctx, dataDir+"/mock_providers.json"); err != nil {
		return fmt.Errorf("seeding providers: %w", err)
	}

	log.Println("✅ Database seeded successfully")
	return nil
}

func seedWilayas(ctx context.Context, path string) error {
	data, err := os.ReadFile(path)
	if err != nil {
		return err
	}

	var wilayas []models.Wilaya
	if err := json.Unmarshal(data, &wilayas); err != nil {
		return err
	}

	for _, w := range wilayas {
		_, err := Pool.Exec(ctx,
			`INSERT INTO wilayas (id, name, ar_name) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING`,
			w.ID, w.Name, w.ArName)
		if err != nil {
			return err
		}
	}
	log.Printf("   Loaded %d wilayas", len(wilayas))
	return nil
}

func seedServices(ctx context.Context, path string) error {
	data, err := os.ReadFile(path)
	if err != nil {
		return err
	}

	var services []models.MedicalService
	if err := json.Unmarshal(data, &services); err != nil {
		return err
	}

	for _, s := range services {
		_, err := Pool.Exec(ctx,
			`INSERT INTO medical_services (id, name, category) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING`,
			s.ID, s.Name, s.Category)
		if err != nil {
			return err
		}
	}
	log.Printf("   Loaded %d medical services", len(services))
	return nil
}

func seedProviders(ctx context.Context, path string) error {
	data, err := os.ReadFile(path)
	if err != nil {
		return err
	}

	var providers []models.Provider
	if err := json.Unmarshal(data, &providers); err != nil {
		return err
	}

	for _, p := range providers {
		_, err := Pool.Exec(ctx,
			`INSERT INTO providers (id, name, name_en, type, wilaya, wilaya_id, city, address, phone, rating, reviews_count, image, open_hours)
			 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
			 ON CONFLICT (id) DO NOTHING`,
			p.ID, p.Name, p.NameEn, p.Type, p.Wilaya, p.WilayaID,
			p.City, p.Address, p.Phone, p.Rating, p.ReviewsCount, p.Image, p.OpenHours)
		if err != nil {
			return fmt.Errorf("inserting provider %s: %w", p.ID, err)
		}

		// Insert services
		for _, s := range p.Services {
			var dName, dSpec, dExp, eName, eType, eOrigin string
			if s.Doctor != nil {
				dName = s.Doctor.Name
				dSpec = s.Doctor.Specialty
				dExp = s.Doctor.Experience
			}
			if s.Equipment != nil {
				eName = s.Equipment.Name
				eType = s.Equipment.Type
				eOrigin = s.Equipment.Origin
			}

			_, err := Pool.Exec(ctx,
				`INSERT INTO provider_services (provider_id, service_id, name, price, turnaround,
				 doctor_name, doctor_specialty, doctor_experience, equipment_name, equipment_type, equipment_origin)
				 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
				p.ID, s.ServiceID, s.Name, s.Price, s.Turnaround,
				dName, dSpec, dExp, eName, eType, eOrigin)
			if err != nil {
				log.Printf("   Warning: inserting service for %s: %v", p.ID, err)
			}
		}
	}

	log.Printf("   Loaded %d providers", len(providers))
	return nil
}
