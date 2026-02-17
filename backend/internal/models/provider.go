package models

// Provider represents a clinic or lab in search results.
type Provider struct {
	ID           string            `json:"id"`
	Name         string            `json:"name"`
	NameEn       string            `json:"nameEn,omitempty"`
	Type         string            `json:"type"` // "clinic" or "lab"
	Wilaya       string            `json:"wilaya"`
	WilayaID     string            `json:"wilayaId"`
	City         string            `json:"city"`
	Address      string            `json:"address"`
	Phone        string            `json:"phone"`
	Rating       float64           `json:"rating"`
	ReviewsCount int               `json:"reviewsCount"`
	Image        string            `json:"image"`
	OpenHours    string            `json:"openHours"`
	Services     []ProviderService `json:"services"`
}

type ProviderService struct {
	ServiceID  string     `json:"serviceId"`
	Name       string     `json:"name"`
	Price      int        `json:"price"`
	Turnaround string     `json:"turnaround"`
	Doctor     *Doctor    `json:"doctor,omitempty"`
	Equipment  *Equipment `json:"equipment,omitempty"`
}

type Doctor struct {
	Name       string `json:"name"`
	Specialty  string `json:"specialty"`
	Experience string `json:"experience"`
}

type Equipment struct {
	Name   string `json:"name"`
	Type   string `json:"type"`
	Origin string `json:"origin"`
}

// Wilaya represents an Algerian administrative division.
type Wilaya struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	ArName string `json:"ar_name"`
}

// MedicalService represents a medical test or procedure.
type MedicalService struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Category string `json:"category"`
}

// SearchQuery holds parsed search parameters.
type SearchQuery struct {
	Wilaya  string
	Service string
	SortBy  string // "rating", "price", "name"
}
