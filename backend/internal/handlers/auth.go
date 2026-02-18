package handlers

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/anis7x/cliniclab/internal/auth"
	"github.com/anis7x/cliniclab/internal/database"
	"github.com/anis7x/cliniclab/internal/middleware"
	"github.com/anis7x/cliniclab/internal/models"
	"github.com/jackc/pgx/v5"
)

const (
	maxLoginAttempts = 5
	lockoutDuration  = 15 * time.Minute
)

// RegisterPatient handles POST /api/auth/register/patient
func RegisterPatient(w http.ResponseWriter, r *http.Request) {
	var req models.RegisterPatientRequest
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.FullName == "" || req.Email == "" || req.Password == "" {
		writeError(w, http.StatusBadRequest, "الاسم، البريد الإلكتروني وكلمة المرور مطلوبة")
		return
	}
	if len(req.Password) < 8 {
		writeError(w, http.StatusBadRequest, "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
		return
	}

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
// Creates user + professional profile + organization (multi-tenant) + TOTP secret
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
	if len(req.Password) < 8 {
		writeError(w, http.StatusBadRequest, "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
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

	// Generate TOTP secret for 2FA setup
	totpSecret, totpURI, err := auth.GenerateTOTP(req.Email)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "خطأ في إنشاء رمز المصادقة")
		return
	}

	// Map account type
	role := models.RoleClinicAdmin
	orgType := "CLINIC"
	if req.AccountType == "lab" {
		role = models.RoleLabAdmin
		orgType = "LAB"
	}

	tx, err := database.Pool.Begin(context.Background())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "خطأ في الخادم")
		return
	}
	defer tx.Rollback(context.Background())

	// 1. Create user with TOTP secret
	var userID string
	err = tx.QueryRow(context.Background(),
		`INSERT INTO users (email, password_hash, role, totp_secret)
		 VALUES ($1, $2, $3, $4) RETURNING id`,
		strings.ToLower(req.Email), hash, role, totpSecret).Scan(&userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "خطأ في إنشاء الحساب")
		return
	}

	// 2. Create organization (tenant — from اسم المؤسسة)
	var orgID string
	err = tx.QueryRow(context.Background(),
		`INSERT INTO organizations (owner_id, name, org_type, phone, address)
		 VALUES ($1, $2, $3, $4, NULLIF($5, ''))
		 RETURNING id`,
		userID, req.BusinessName, orgType, req.Phone, req.Address).Scan(&orgID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "خطأ في إنشاء المؤسسة")
		return
	}

	// 3. Link user to organization as ADMIN member
	_, err = tx.Exec(context.Background(),
		`INSERT INTO org_members (org_id, user_id, role) VALUES ($1, $2, 'ADMIN')`,
		orgID, userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "خطأ في ربط المستخدم بالمؤسسة")
		return
	}

	// 4. Set active org on user
	_, err = tx.Exec(context.Background(),
		`UPDATE users SET active_org_id = $1 WHERE id = $2`, orgID, userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "خطأ في تحديث المستخدم")
		return
	}

	// 5. Create professional profile (legacy compatibility)
	_, err = tx.Exec(context.Background(),
		`INSERT INTO profiles_professional (user_id, business_name, account_type, phone_number, address_text)
		 VALUES ($1, $2, $3, $4, NULLIF($5, ''))`,
		userID, req.BusinessName, req.AccountType, req.Phone, req.Address)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "خطأ في إنشاء الملف المهني")
		return
	}

	// 6. Seed default departments for new org
	seedOrgDefaults(tx, orgID, orgType)

	if err := tx.Commit(context.Background()); err != nil {
		writeError(w, http.StatusInternalServerError, "خطأ في حفظ البيانات")
		return
	}

	// Generate JWT
	token, err := auth.GenerateToken(userID, req.Email, string(role))
	if err != nil {
		writeError(w, http.StatusInternalServerError, "خطأ في إنشاء التوكن")
		return
	}

	writeJSON(w, http.StatusCreated, models.AuthResponse{
		Token:   token,
		TOTPUri: totpURI, // Client uses this to display QR code
		User: map[string]interface{}{
			"id":             userID,
			"email":          req.Email,
			"role":           role,
			"business_name":  req.BusinessName,
			"account_type":   req.AccountType,
			"is_2fa_enabled": false,
		},
		Org: map[string]interface{}{
			"id":       orgID,
			"name":     req.BusinessName,
			"org_type": orgType,
		},
	})
}

// seedOrgDefaults creates default departments for a new organization
func seedOrgDefaults(tx pgx.Tx, orgID string, orgType string) {
	type dep struct{ ar, fr, code string }

	deps := []dep{
		{"الاستقبال", "Accueil", "RECEPTION"},
		{"الطب العام", "Médecine Générale", "MED_GEN"},
		{"الطوارئ", "Urgences", "URGENCE"},
		{"العيادات الخارجية", "Consultations Externes", "CONSULT"},
	}

	if orgType == "CLINIC" {
		deps = append(deps,
			dep{"الجراحة العامة", "Chirurgie Générale", "CHIR_GEN"},
			dep{"أمراض النساء والتوليد", "Gynécologie-Obstétrique", "GYNAECO"},
			dep{"طب الأطفال", "Pédiatrie", "PEDIATR"},
			dep{"أمراض القلب", "Cardiologie", "CARDIO"},
			dep{"الأشعة", "Radiologie", "RADIO"},
			dep{"التخدير والإنعاش", "Anesthésie-Réanimation", "ANESTH"},
		)
	}

	if orgType == "LAB" || orgType == "CLINIC" {
		deps = append(deps, dep{"المختبر", "Laboratoire", "LAB"})
	}

	for _, d := range deps {
		tx.Exec(context.Background(),
			`INSERT INTO departments (org_id, name_ar, name_fr, code) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
			orgID, d.ar, d.fr, d.code)
	}
}

// Login handles POST /api/auth/login with rate limiting and 2FA support
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

	// Fetch user with security fields
	var user models.User
	var totpSecret *string
	var is2FA bool
	var failedAttempts int
	var lockedUntil *time.Time

	err := database.Pool.QueryRow(context.Background(),
		`SELECT id, email, password_hash, role, is_verified,
		        COALESCE(totp_secret, ''), COALESCE(is_2fa_enabled, false),
		        COALESCE(failed_login_attempts, 0), locked_until,
		        active_org_id
		 FROM users WHERE email = $1`,
		strings.ToLower(req.Email)).Scan(
		&user.ID, &user.Email, &user.PasswordHash, &user.Role, &user.IsVerified,
		&totpSecret, &is2FA,
		&failedAttempts, &lockedUntil,
		&user.ActiveOrgID)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "البريد الإلكتروني أو كلمة المرور غير صحيحة")
		return
	}

	// Check account lockout
	if lockedUntil != nil && time.Now().Before(*lockedUntil) {
		remaining := time.Until(*lockedUntil).Minutes()
		writeJSON(w, http.StatusTooManyRequests, map[string]interface{}{
			"error":             "الحساب مقفل مؤقتاً بسبب محاولات فاشلة متعددة",
			"locked":            true,
			"minutes_remaining": int(remaining) + 1,
		})
		return
	}

	// Verify password
	if !auth.CheckPassword(req.Password, user.PasswordHash) {
		// Increment failed attempts
		newAttempts := failedAttempts + 1
		if newAttempts >= maxLoginAttempts {
			lockUntil := time.Now().Add(lockoutDuration)
			database.Pool.Exec(context.Background(),
				`UPDATE users SET failed_login_attempts = $1, locked_until = $2 WHERE id = $3`,
				newAttempts, lockUntil, user.ID)
			writeJSON(w, http.StatusTooManyRequests, map[string]interface{}{
				"error":             "تم قفل الحساب لمدة 15 دقيقة بسبب محاولات فاشلة متعددة",
				"locked":            true,
				"minutes_remaining": 15,
			})
		} else {
			database.Pool.Exec(context.Background(),
				`UPDATE users SET failed_login_attempts = $1 WHERE id = $2`,
				newAttempts, user.ID)
			writeError(w, http.StatusUnauthorized, "البريد الإلكتروني أو كلمة المرور غير صحيحة")
		}
		return
	}

	// Reset failed attempts on successful password
	database.Pool.Exec(context.Background(),
		`UPDATE users SET failed_login_attempts = 0, locked_until = NULL,
		 last_login_at = NOW(), last_login_ip = $1 WHERE id = $2`,
		r.RemoteAddr, user.ID)

	// Check if 2FA is enabled
	if is2FA && totpSecret != nil && *totpSecret != "" {
		// Check for trusted device cookie
		deviceToken := r.Header.Get("X-Device-Token")
		if deviceToken != "" {
			var valid bool
			database.Pool.QueryRow(context.Background(),
				`SELECT EXISTS(SELECT 1 FROM trusted_devices WHERE device_token = $1 AND user_id = $2 AND expires_at > NOW())`,
				deviceToken, user.ID).Scan(&valid)
			if valid {
				// Trusted device — skip 2FA
				goto issueToken
			}
		}

		// Generate short-lived temp token (5 min) for 2FA step
		tempToken, err := auth.GenerateTempToken(user.ID, user.Email, string(user.Role))
		if err != nil {
			writeError(w, http.StatusInternalServerError, "خطأ في إنشاء التوكن")
			return
		}

		writeJSON(w, http.StatusOK, models.AuthResponse{
			Requires2FA: true,
			TempToken:   tempToken,
			User: map[string]interface{}{
				"id":    user.ID,
				"email": user.Email,
				"role":  user.Role,
			},
		})
		return
	}

issueToken:
	token, err := auth.GenerateToken(user.ID, user.Email, string(user.Role))
	if err != nil {
		writeError(w, http.StatusInternalServerError, "خطأ في إنشاء التوكن")
		return
	}

	// Build response with org info
	userResp := map[string]interface{}{
		"id":             user.ID,
		"email":          user.Email,
		"role":           user.Role,
		"is_2fa_enabled": is2FA,
	}

	var orgResp interface{}

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

		// Fetch org info
		if user.ActiveOrgID != nil {
			var org models.Organization
			database.Pool.QueryRow(context.Background(),
				`SELECT id, name, org_type, COALESCE(phone, ''), COALESCE(default_language, 'ar'), COALESCE(currency, 'DZD'), is_active
				 FROM organizations WHERE id = $1`,
				*user.ActiveOrgID).Scan(&org.ID, &org.Name, &org.OrgType, &org.Phone, &org.DefaultLanguage, &org.Currency, &org.IsActive)
			orgResp = org
		}
	}

	writeJSON(w, http.StatusOK, models.AuthResponse{
		Token: token,
		User:  userResp,
		Org:   orgResp,
	})
}

// Setup2FA handles POST /api/auth/setup-2fa (confirms 2FA with first valid code)
func Setup2FA(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetClaims(r)
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "غير مصرح")
		return
	}

	var req models.Setup2FARequest
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.Code == "" || len(req.Code) != 6 {
		writeError(w, http.StatusBadRequest, "الرمز يجب أن يكون 6 أرقام")
		return
	}

	// Get user's TOTP secret
	var totpSecret string
	err := database.Pool.QueryRow(context.Background(),
		`SELECT COALESCE(totp_secret, '') FROM users WHERE id = $1`,
		claims.UserID).Scan(&totpSecret)
	if err != nil || totpSecret == "" {
		writeError(w, http.StatusBadRequest, "لم يتم إنشاء رمز المصادقة بعد")
		return
	}

	// Validate the TOTP code
	if !auth.ValidateTOTP(totpSecret, req.Code) {
		writeError(w, http.StatusBadRequest, "الرمز غير صحيح. تأكد من إعدادات التطبيق")
		return
	}

	// Generate recovery codes
	recoveryCodes, err := auth.GenerateRecoveryCodes()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "خطأ في إنشاء رموز الاسترداد")
		return
	}

	// Enable 2FA
	_, err = database.Pool.Exec(context.Background(),
		`UPDATE users SET is_2fa_enabled = true, recovery_codes = $1 WHERE id = $2`,
		recoveryCodes, claims.UserID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "خطأ في تفعيل المصادقة الثنائية")
		return
	}

	writeJSON(w, http.StatusOK, models.Setup2FAResponse{
		RecoveryCodes: recoveryCodes,
		Message:       "تم تفعيل المصادقة الثنائية بنجاح",
	})
}

// Verify2FA handles POST /api/auth/verify-2fa (login 2FA step)
func Verify2FA(w http.ResponseWriter, r *http.Request) {
	var req models.Verify2FARequest
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.TempToken == "" || req.Code == "" {
		writeError(w, http.StatusBadRequest, "التوكن المؤقت والرمز مطلوبة")
		return
	}

	// Validate temp token
	claims, err := auth.ValidateToken(req.TempToken)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "التوكن المؤقت منتهي الصلاحية. أعد تسجيل الدخول")
		return
	}

	// Get TOTP secret and recovery codes
	var totpSecret string
	var recoveryCodes []string
	err = database.Pool.QueryRow(context.Background(),
		`SELECT COALESCE(totp_secret, ''), COALESCE(recovery_codes, '{}') FROM users WHERE id = $1`,
		claims.UserID).Scan(&totpSecret, &recoveryCodes)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "خطأ في الخادم")
		return
	}

	// Try TOTP code first
	valid := auth.ValidateTOTP(totpSecret, req.Code)

	// If TOTP fails, try recovery code
	if !valid {
		codeUpper := strings.ToUpper(req.Code)
		for i, rc := range recoveryCodes {
			if rc == codeUpper {
				// Remove used recovery code
				recoveryCodes = append(recoveryCodes[:i], recoveryCodes[i+1:]...)
				database.Pool.Exec(context.Background(),
					`UPDATE users SET recovery_codes = $1 WHERE id = $2`,
					recoveryCodes, claims.UserID)
				valid = true
				break
			}
		}
	}

	if !valid {
		writeError(w, http.StatusUnauthorized, "الرمز غير صحيح")
		return
	}

	// Issue full JWT
	token, err := auth.GenerateToken(claims.UserID, claims.Email, claims.Role)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "خطأ في إنشاء التوكن")
		return
	}

	// Handle trusted device
	if req.TrustDevice {
		deviceToken, err := auth.GenerateDeviceToken()
		if err == nil {
			deviceName := req.DeviceName
			if deviceName == "" {
				deviceName = "متصفح"
			}
			database.Pool.Exec(context.Background(),
				`INSERT INTO trusted_devices (user_id, device_token, device_name, ip_address, expires_at)
				 VALUES ($1, $2, $3, $4, NOW() + INTERVAL '30 days')`,
				claims.UserID, deviceToken, deviceName, r.RemoteAddr)

			// Set device token in response header
			w.Header().Set("X-Device-Token", deviceToken)
		}
	}

	// Build response with user + org
	userResp := map[string]interface{}{
		"id":    claims.UserID,
		"email": claims.Email,
		"role":  claims.Role,
	}

	var orgResp interface{}
	var activeOrgID *string
	database.Pool.QueryRow(context.Background(),
		`SELECT active_org_id FROM users WHERE id = $1`, claims.UserID).Scan(&activeOrgID)

	if activeOrgID != nil {
		var org models.Organization
		database.Pool.QueryRow(context.Background(),
			`SELECT id, name, org_type, COALESCE(phone, ''), COALESCE(default_language, 'ar'), COALESCE(currency, 'DZD'), is_active
			 FROM organizations WHERE id = $1`,
			*activeOrgID).Scan(&org.ID, &org.Name, &org.OrgType, &org.Phone, &org.DefaultLanguage, &org.Currency, &org.IsActive)
		orgResp = org
	}

	// Fetch profile
	switch models.UserRole(claims.Role) {
	case models.RoleClinicAdmin, models.RoleLabAdmin:
		var p models.ProfessionalProfile
		database.Pool.QueryRow(context.Background(),
			`SELECT business_name, account_type FROM profiles_professional WHERE user_id = $1`,
			claims.UserID).Scan(&p.BusinessName, &p.AccountType)
		userResp["business_name"] = p.BusinessName
		userResp["account_type"] = p.AccountType
	case models.RolePatient:
		var p models.PatientProfile
		database.Pool.QueryRow(context.Background(),
			`SELECT full_name FROM profiles_patient WHERE user_id = $1`,
			claims.UserID).Scan(&p.FullName)
		userResp["full_name"] = p.FullName
	}

	writeJSON(w, http.StatusOK, models.AuthResponse{
		Token: token,
		User:  userResp,
		Org:   orgResp,
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
		`SELECT id, email, role, is_verified, COALESCE(is_2fa_enabled, false), active_org_id, created_at
		 FROM users WHERE id = $1`,
		claims.UserID).Scan(&user.ID, &user.Email, &user.Role, &user.IsVerified, &user.Is2FAEnabled, &user.ActiveOrgID, &user.CreatedAt)
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

		// Fetch org
		if user.ActiveOrgID != nil {
			var org models.Organization
			database.Pool.QueryRow(context.Background(),
				`SELECT id, name, org_type, COALESCE(phone, ''), COALESCE(default_language, 'ar'), COALESCE(currency, 'DZD'), is_active
				 FROM organizations WHERE id = $1`,
				*user.ActiveOrgID).Scan(&org.ID, &org.Name, &org.OrgType, &org.Phone, &org.DefaultLanguage, &org.Currency, &org.IsActive)
			resp.Org = org
		}
	}

	writeJSON(w, http.StatusOK, resp)
}
