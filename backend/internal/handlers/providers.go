package handlers

import (
	"context"
	"net/http"
	"strconv"

	"github.com/anis7x/cliniclab/internal/database"
	"github.com/anis7x/cliniclab/internal/models"
	"github.com/go-chi/chi/v5"
)

// SearchProviders handles GET /api/providers/search?wilaya=&service=&sort=
func SearchProviders(w http.ResponseWriter, r *http.Request) {
	wilaya := r.URL.Query().Get("wilaya")
	service := r.URL.Query().Get("service")
	sortBy := r.URL.Query().Get("sort")
	if sortBy == "" {
		sortBy = "rating"
	}

	// Build the query to fetch providers
	query := `
		SELECT DISTINCT p.id, p.name, COALESCE(p.name_en, ''), p.type, p.wilaya, p.wilaya_id,
			   COALESCE(p.city, ''), COALESCE(p.address, ''), COALESCE(p.phone, ''),
			   p.rating, p.reviews_count, COALESCE(p.image, ''), COALESCE(p.open_hours, '')
		FROM providers p
		LEFT JOIN provider_services ps ON ps.provider_id = p.id
		WHERE 1=1
	`
	args := []interface{}{}
	argIdx := 1

	if wilaya != "" {
		query += ` AND (p.wilaya LIKE '%' || $` + itoa(argIdx) + ` || '%' OR p.wilaya_id = $` + itoa(argIdx) + `)`
		args = append(args, wilaya)
		argIdx++
	}
	if service != "" {
		query += ` AND ps.name LIKE '%' || $` + itoa(argIdx) + ` || '%'`
		args = append(args, service)
		argIdx++
	}

	// Order
	switch sortBy {
	case "price":
		query += ` ORDER BY p.rating DESC` // price ordering needs service context, fallback to rating
	case "name":
		query += ` ORDER BY p.name ASC`
	default:
		query += ` ORDER BY p.rating DESC`
	}

	rows, err := database.Pool.Query(context.Background(), query, args...)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "خطأ في البحث")
		return
	}
	defer rows.Close()

	providers := []models.Provider{}
	for rows.Next() {
		var p models.Provider
		err := rows.Scan(&p.ID, &p.Name, &p.NameEn, &p.Type, &p.Wilaya, &p.WilayaID,
			&p.City, &p.Address, &p.Phone, &p.Rating, &p.ReviewsCount, &p.Image, &p.OpenHours)
		if err != nil {
			continue
		}

		// Fetch services for this provider (filtered if service search term provided)
		svcQuery := `
			SELECT COALESCE(service_id, ''), name, price, COALESCE(turnaround, ''),
				   COALESCE(doctor_name, ''), COALESCE(doctor_specialty, ''), COALESCE(doctor_experience, ''),
				   COALESCE(equipment_name, ''), COALESCE(equipment_type, ''), COALESCE(equipment_origin, '')
			FROM provider_services WHERE provider_id = $1
		`
		svcArgs := []interface{}{p.ID}
		if service != "" {
			svcQuery += ` AND name LIKE '%' || $2 || '%'`
			svcArgs = append(svcArgs, service)
		}

		svcRows, err := database.Pool.Query(context.Background(), svcQuery, svcArgs...)
		if err != nil {
			continue
		}

		for svcRows.Next() {
			var s models.ProviderService
			var dName, dSpec, dExp, eName, eType, eOrigin string
			svcRows.Scan(&s.ServiceID, &s.Name, &s.Price, &s.Turnaround,
				&dName, &dSpec, &dExp, &eName, &eType, &eOrigin)

			if dName != "" {
				s.Doctor = &models.Doctor{Name: dName, Specialty: dSpec, Experience: dExp}
			}
			if eName != "" {
				s.Equipment = &models.Equipment{Name: eName, Type: eType, Origin: eOrigin}
			}
			p.Services = append(p.Services, s)
		}
		svcRows.Close()

		if p.Services == nil {
			p.Services = []models.ProviderService{}
		}

		providers = append(providers, p)
	}

	writeJSON(w, http.StatusOK, providers)
}

// GetProvider handles GET /api/providers/{id}
func GetProvider(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		writeError(w, http.StatusBadRequest, "معرف المزود مطلوب")
		return
	}

	var p models.Provider
	err := database.Pool.QueryRow(context.Background(),
		`SELECT id, name, COALESCE(name_en, ''), type, wilaya, wilaya_id,
			    COALESCE(city, ''), COALESCE(address, ''), COALESCE(phone, ''),
			    rating, reviews_count, COALESCE(image, ''), COALESCE(open_hours, '')
		 FROM providers WHERE id = $1`, id).Scan(
		&p.ID, &p.Name, &p.NameEn, &p.Type, &p.Wilaya, &p.WilayaID,
		&p.City, &p.Address, &p.Phone, &p.Rating, &p.ReviewsCount, &p.Image, &p.OpenHours)
	if err != nil {
		writeError(w, http.StatusNotFound, "المزود غير موجود")
		return
	}

	// Fetch all services
	svcRows, err := database.Pool.Query(context.Background(),
		`SELECT COALESCE(service_id, ''), name, price, COALESCE(turnaround, ''),
			    COALESCE(doctor_name, ''), COALESCE(doctor_specialty, ''), COALESCE(doctor_experience, ''),
			    COALESCE(equipment_name, ''), COALESCE(equipment_type, ''), COALESCE(equipment_origin, '')
		 FROM provider_services WHERE provider_id = $1`, id)
	if err == nil {
		defer svcRows.Close()
		for svcRows.Next() {
			var s models.ProviderService
			var dName, dSpec, dExp, eName, eType, eOrigin string
			svcRows.Scan(&s.ServiceID, &s.Name, &s.Price, &s.Turnaround,
				&dName, &dSpec, &dExp, &eName, &eType, &eOrigin)
			if dName != "" {
				s.Doctor = &models.Doctor{Name: dName, Specialty: dSpec, Experience: dExp}
			}
			if eName != "" {
				s.Equipment = &models.Equipment{Name: eName, Type: eType, Origin: eOrigin}
			}
			p.Services = append(p.Services, s)
		}
	}
	if p.Services == nil {
		p.Services = []models.ProviderService{}
	}

	writeJSON(w, http.StatusOK, p)
}

// GetWilayas handles GET /api/wilayas
func GetWilayas(w http.ResponseWriter, r *http.Request) {
	rows, err := database.Pool.Query(context.Background(),
		`SELECT id, name, ar_name FROM wilayas ORDER BY id`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "خطأ في جلب الولايات")
		return
	}
	defer rows.Close()

	result := []models.Wilaya{}
	for rows.Next() {
		var wil models.Wilaya
		rows.Scan(&wil.ID, &wil.Name, &wil.ArName)
		result = append(result, wil)
	}
	writeJSON(w, http.StatusOK, result)
}

// GetServices handles GET /api/services
func GetServices(w http.ResponseWriter, r *http.Request) {
	rows, err := database.Pool.Query(context.Background(),
		`SELECT id, name, category FROM medical_services ORDER BY id`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "خطأ في جلب الخدمات")
		return
	}
	defer rows.Close()

	services := []models.MedicalService{}
	for rows.Next() {
		var s models.MedicalService
		rows.Scan(&s.ID, &s.Name, &s.Category)
		services = append(services, s)
	}
	writeJSON(w, http.StatusOK, services)
}

// itoa converts an int to string for query building.
func itoa(i int) string {
	return strconv.Itoa(i)
}
