package models

import "time"

type UserRole string

const (
	RolePatient       UserRole = "PATIENT"
	RoleLabAdmin      UserRole = "LAB_ADMIN"
	RoleClinicAdmin   UserRole = "CLINIC_ADMIN"
	RolePlatformAdmin UserRole = "PLATFORM_ADMIN"
)

// User represents the core authentication entity.
type User struct {
	ID           string    `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"` // never expose
	Role         UserRole  `json:"role"`
	IsVerified   bool      `json:"is_verified"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// PatientProfile holds patient-specific data.
type PatientProfile struct {
	ID          string  `json:"id"`
	UserID      string  `json:"user_id"`
	FullName    string  `json:"full_name"`
	Phone       string  `json:"phone"`
	DateOfBirth *string `json:"date_of_birth,omitempty"`
	Gender      *string `json:"gender,omitempty"`
	BloodType   *string `json:"blood_type,omitempty"`
	CreatedAt   string  `json:"created_at"`
}

// ProfessionalProfile holds clinic/lab profile data.
type ProfessionalProfile struct {
	ID                 string  `json:"id"`
	UserID             string  `json:"user_id"`
	BusinessName       string  `json:"business_name"`
	AccountType        string  `json:"account_type"` // "clinic" or "lab"
	PhoneNumber        string  `json:"phone_number"`
	AddressText        *string `json:"address_text,omitempty"`
	SubscriptionTier   string  `json:"subscription_tier"`
	SubscriptionStatus string  `json:"subscription_status"`
	CreatedAt          string  `json:"created_at"`
}

// --- Request/Response DTOs ---

type RegisterPatientRequest struct {
	FullName    string `json:"full_name"`
	Email       string `json:"email"`
	Password    string `json:"password"`
	Phone       string `json:"phone"`
	DateOfBirth string `json:"date_of_birth,omitempty"`
	Gender      string `json:"gender,omitempty"`
}

type RegisterProfessionalRequest struct {
	BusinessName string `json:"business_name"`
	Email        string `json:"email"`
	Password     string `json:"password"`
	ConfirmPass  string `json:"confirm_password"`
	Phone        string `json:"phone"`
	AccountType  string `json:"account_type"` // "clinic" or "lab"
	Address      string `json:"address,omitempty"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Token string      `json:"token"`
	User  interface{} `json:"user"`
}

type MeResponse struct {
	User    User        `json:"user"`
	Profile interface{} `json:"profile"`
}
