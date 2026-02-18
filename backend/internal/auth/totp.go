package auth

import (
	"crypto/rand"
	"encoding/base32"
	"fmt"
	"strings"
	"time"

	"github.com/pquerna/otp"
	"github.com/pquerna/otp/totp"
)

// GenerateTOTP creates a new TOTP secret and returns the secret + provisioning URI
func GenerateTOTP(email string) (secret string, uri string, err error) {
	key, err := totp.Generate(totp.GenerateOpts{
		Issuer:      "ClinicLab",
		AccountName: email,
		Period:      30,
		Digits:      otp.DigitsSix,
		Algorithm:   otp.AlgorithmSHA1,
	})
	if err != nil {
		return "", "", fmt.Errorf("failed to generate TOTP: %w", err)
	}

	return key.Secret(), key.URL(), nil
}

// ValidateTOTP checks if a TOTP code is valid for the given secret
func ValidateTOTP(secret, code string) bool {
	return totp.Validate(code, secret)
}

// ValidateTOTPWithWindow checks TOTP with a time window (allows ±1 period)
func ValidateTOTPWithWindow(secret, code string) (bool, error) {
	valid, err := totp.ValidateCustom(code, secret, time.Now(), totp.ValidateOpts{
		Period:    30,
		Skew:      1, // Allow ±1 period (±30 seconds)
		Digits:    otp.DigitsSix,
		Algorithm: otp.AlgorithmSHA1,
	})
	return valid, err
}

// GenerateRecoveryCodes creates 8 backup codes for 2FA recovery
func GenerateRecoveryCodes() ([]string, error) {
	codes := make([]string, 8)
	for i := range codes {
		bytes := make([]byte, 5) // 5 bytes = 8 base32 chars
		if _, err := rand.Read(bytes); err != nil {
			return nil, fmt.Errorf("failed to generate recovery code: %w", err)
		}
		code := base32.StdEncoding.EncodeToString(bytes)[:8]
		// Format as XXXX-XXXX
		codes[i] = strings.ToUpper(code[:4] + "-" + code[4:8])
	}
	return codes, nil
}

// GenerateDeviceToken creates a unique token for trusted device
func GenerateDeviceToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return base32.StdEncoding.EncodeToString(bytes)[:43], nil
}
