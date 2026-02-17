package handlers

import (
	"context"
	"net/http"
	"strings"

	"github.com/anis7x/cliniclab/internal/auth"
	"github.com/anis7x/cliniclab/internal/database"
	"github.com/anis7x/cliniclab/internal/middleware"
	"github.com/anis7x/cliniclab/internal/models"
)

// RegisterPatient handles POST /api/auth/register/patient
func RegisterPatient(w http.ResponseWriter, r *http.Request) {
	var req models.RegisterPatientRequest
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validation
	if req.FullName == "" || req.Email == "" || req.Password == "" {
		writeError(w, http.StatusBadRequest, "الاسم، البريد الإلكتروني وكلمة المرور مطلوبة")
		return
	}
	if len(req.Password) < 6 {
		writeError(w, http.StatusBadRequest, "كلمة المرور يجب أن تكون 6 أحرف على الأقل")
		return
	}

	// Check if email already exists
	var exists bool
	err := database.Pool.QueryRow(context.Background(),
		"SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)", strings.ToLower(req.Email)).Scan(&exists)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "حدث خطأ في الخادم")
		return
	}
	if exists {
		writeError(w, http.StatusConflict, "هذا البريد الإلكتروني مسجل بالفعل")
		return
	}

	// Hash password
	hash, err := auth.HashPassword(req.Password)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "خطأ في معالجة كلمة المرور")
		return
	}

	// Insert user + profile in a transaction
	tx, err := database.Pool.Begin(context.Background())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "خطأ في الخادم")
		return
	}
	defer tx.Rollback(context.Background())

	var userID string
	err = tx.QueryRow(context.Background(),
		`INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'PATIENT') RETURNING id`,
		strings.ToLower(req.Email), hash).Scan(&userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "خطأ في إنشاء الحساب")
		return
	}

	_, err = tx.Exec(context.Background(),
		`INSERT INTO profiles_patient (user_id, full_name, phone, date_of_birth, gender)
		 VALUES ($1, $2, $3, NULLIF($4, '')::DATE, NULLIF($5, ''))`,
		userID, req.FullName, req.Phone, req.DateOfBirth, req.Gender)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "خطأ في إنشاء الملف الشخصي")
		return
	}

	if err := tx.Commit(context.Background()); err != nil {
		writeError(w, http.StatusInternalServerError, "خطأ في حفظ البيانات")
		return
	}

	// Generate JWT
	token, err := auth.GenerateToken(userID, req.Email, string(models.RolePatient))
	if err != nil {
		writeError(w, http.StatusInternalServerError, "خطأ في إنشاء التوكن")
		return
	}

	writeJSON(w, http.StatusCreated, models.AuthResponse{
		Token: token,
		User: map[string]interface{}{
			"id":        userID,
			"email":     req.Email,
			"role":      models.RolePatient,
			"full_name": req.FullName,
		},
	})
}

// RegisterProfessional handles POST /api/auth/register/professional
func RegisterProfessional(w http.ResponseWriter, r *http.Request) {
	var req models.RegisterProfessionalRequest
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validation
	if req.BusinessName == "" || req.Email == "" || req.Password == "" {
		writeError(w, http.StatusBadRequest, "اسم المؤسسة، البريد الإلكتروني وكلمة المرور مطلوبة")
		return
	}
	if len(req.Password) < 6 {
		writeError(w, http.StatusBadRequest, "كلمة المرور يجب أن تكون 6 أحرف على الأقل")
		return
	}
	if req.Password != req.ConfirmPass {
		writeError(w, http.StatusBadRequest, "كلمة المرور غير متطابقة")
		return
	}
	if req.AccountType != "clinic" && req.AccountType != "lab" {
		writeError(w, http.StatusBadRequest, "نوع الحساب غير صالح")
		return
	}

	// Check duplicate email
	var exists bool
	err := database.Pool.QueryRow(context.Background(),
		"SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)", strings.ToLower(req.Email)).Scan(&exists)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "حدث خطأ في الخادم")
		return
	}
	if exists {
		writeError(w, http.StatusConflict, "هذا البريد الإلكتروني مسجل بالفعل")
		return
	}

	hash, err := auth.HashPassword(req.Password)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "خطأ في معالجة كلمة المرور")
		return
	}

	// Map account type to role
	role := models.RoleClinicAdmin
	if req.AccountType == "lab" {
		role = models.RoleLabAdmin
	}

	tx, err := database.Pool.Begin(context.Background())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "خطأ في الخادم")
		return
	}
	defer tx.Rollback(context.Background())

	var userID string
	err = tx.QueryRow(context.Background(),
		`INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id`,
		strings.ToLower(req.Email), hash, role).Scan(&userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "خطأ في إنشاء الحساب")
		return
	}

	_, err = tx.Exec(context.Background(),
		`INSERT INTO profiles_professional (user_id, business_name, account_type, phone_number, address_text)
		 VALUES ($1, $2, $3, $4, NULLIF($5, ''))`,
		userID, req.BusinessName, req.AccountType, req.Phone, req.Address)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "خطأ في إنشاء الملف المهني")
		return
	}

	if err := tx.Commit(context.Background()); err != nil {
		writeError(w, http.StatusInternalServerError, "خطأ في حفظ البيانات")
		return
	}

	token, err := auth.GenerateToken(userID, req.Email, string(role))
	if err != nil {
		writeError(w, http.StatusInternalServerError, "خطأ في إنشاء التوكن")
		return
	}

	writeJSON(w, http.StatusCreated, models.AuthResponse{
		Token: token,
		User: map[string]interface{}{
			"id":            userID,
			"email":         req.Email,
			"role":          role,
			"business_name": req.BusinessName,
			"account_type":  req.AccountType,
		},
	})
}

// Login handles POST /api/auth/login
func Login(w http.ResponseWriter, r *http.Request) {
	var req models.LoginRequest
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.Email == "" || req.Password == "" {
		writeError(w, http.StatusBadRequest, "البريد الإلكتروني وكلمة المرور مطلوبة")
		return
	}

	var user models.User
	err := database.Pool.QueryRow(context.Background(),
		`SELECT id, email, password_hash, role, is_verified FROM users WHERE email = $1`,
		strings.ToLower(req.Email)).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.Role, &user.IsVerified)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "البريد الإلكتروني أو كلمة المرور غير صحيحة")
		return
	}

	if !auth.CheckPassword(req.Password, user.PasswordHash) {
		writeError(w, http.StatusUnauthorized, "البريد الإلكتروني أو كلمة المرور غير صحيحة")
		return
	}

	token, err := auth.GenerateToken(user.ID, user.Email, string(user.Role))
	if err != nil {
		writeError(w, http.StatusInternalServerError, "خطأ في إنشاء التوكن")
		return
	}

	// Build user response based on role
	userResp := map[string]interface{}{
		"id":    user.ID,
		"email": user.Email,
		"role":  user.Role,
	}

	// Fetch profile based on role
	switch user.Role {
	case models.RolePatient:
		var p models.PatientProfile
		database.Pool.QueryRow(context.Background(),
			`SELECT full_name, COALESCE(phone, '') FROM profiles_patient WHERE user_id = $1`,
			user.ID).Scan(&p.FullName, &p.Phone)
		userResp["full_name"] = p.FullName
	case models.RoleClinicAdmin, models.RoleLabAdmin:
		var p models.ProfessionalProfile
		database.Pool.QueryRow(context.Background(),
			`SELECT business_name, account_type FROM profiles_professional WHERE user_id = $1`,
			user.ID).Scan(&p.BusinessName, &p.AccountType)
		userResp["business_name"] = p.BusinessName
		userResp["account_type"] = p.AccountType
	}

	writeJSON(w, http.StatusOK, models.AuthResponse{
		Token: token,
		User:  userResp,
	})
}

// GetMe handles GET /api/auth/me (requires JWT)
func GetMe(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetClaims(r)
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "غير مصرح")
		return
	}

	var user models.User
	err := database.Pool.QueryRow(context.Background(),
		`SELECT id, email, role, is_verified, created_at FROM users WHERE id = $1`,
		claims.UserID).Scan(&user.ID, &user.Email, &user.Role, &user.IsVerified, &user.CreatedAt)
	if err != nil {
		writeError(w, http.StatusNotFound, "المستخدم غير موجود")
		return
	}

	resp := models.MeResponse{User: user}

	switch user.Role {
	case models.RolePatient:
		var p models.PatientProfile
		database.Pool.QueryRow(context.Background(),
			`SELECT id, user_id, full_name, COALESCE(phone, ''), date_of_birth, gender FROM profiles_patient WHERE user_id = $1`,
			user.ID).Scan(&p.ID, &p.UserID, &p.FullName, &p.Phone, &p.DateOfBirth, &p.Gender)
		resp.Profile = p
	case models.RoleClinicAdmin, models.RoleLabAdmin:
		var p models.ProfessionalProfile
		database.Pool.QueryRow(context.Background(),
			`SELECT id, user_id, business_name, account_type, COALESCE(phone_number, ''), subscription_tier, subscription_status
			 FROM profiles_professional WHERE user_id = $1`,
			user.ID).Scan(&p.ID, &p.UserID, &p.BusinessName, &p.AccountType, &p.PhoneNumber, &p.SubscriptionTier, &p.SubscriptionStatus)
		resp.Profile = p
	}

	writeJSON(w, http.StatusOK, resp)
}
