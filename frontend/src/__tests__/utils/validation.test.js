// Utility validation tests
// Add validation helper functions tests here

describe("Validation Utilities", () => {
  describe("Email Validation", () => {
    it("should validate correct email format", () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailRegex.test("test@example.com")).toBe(true);
      expect(emailRegex.test("user.name@domain.co")).toBe(true);
    });

    it("should reject invalid email format", () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailRegex.test("invalid-email")).toBe(false);
      expect(emailRegex.test("test@")).toBe(false);
      expect(emailRegex.test("@example.com")).toBe(false);
    });
  });

  describe("Password Validation", () => {
    it("should validate password length", () => {
      const isValidLength = (password) => password.length >= 8;
      expect(isValidLength("12345678")).toBe(true);
      expect(isValidLength("short")).toBe(false);
    });

    it("should check for password strength", () => {
      const hasUpperCase = (str) => /[A-Z]/.test(str);
      const hasLowerCase = (str) => /[a-z]/.test(str);
      const hasNumber = (str) => /[0-9]/.test(str);

      const strongPassword = "StrongPass123";
      expect(hasUpperCase(strongPassword)).toBe(true);
      expect(hasLowerCase(strongPassword)).toBe(true);
      expect(hasNumber(strongPassword)).toBe(true);
    });
  });

  describe("Phone Number Validation", () => {
    it("should validate Vietnamese phone numbers", () => {
      const phoneRegex = /^(0|\+84)[0-9]{9}$/;
      expect(phoneRegex.test("0912345678")).toBe(true);
      expect(phoneRegex.test("+84912345678")).toBe(true);
    });

    it("should reject invalid phone numbers", () => {
      const phoneRegex = /^(0|\+84)[0-9]{9}$/;
      expect(phoneRegex.test("123")).toBe(false);
      expect(phoneRegex.test("abcdefghij")).toBe(false);
    });
  });

  describe("Form Field Validation", () => {
    it("should check for required fields", () => {
      const isRequired = (value) => !!value && value.trim().length > 0;
      expect(isRequired("test")).toBe(true);
      expect(isRequired("")).toBe(false);
      expect(isRequired("   ")).toBe(false);
    });

    it("should validate field length constraints", () => {
      const isWithinLength = (value, min, max) => {
        const len = value.length;
        return len >= min && len <= max;
      };

      expect(isWithinLength("test", 1, 10)).toBe(true);
      expect(isWithinLength("test", 5, 10)).toBe(false);
      expect(isWithinLength("verylongstring", 1, 5)).toBe(false);
    });
  });

  describe("URL Validation", () => {
    it("should validate URLs", () => {
      const urlRegex = /^https?:\/\/.+/;
      expect(urlRegex.test("http://example.com")).toBe(true);
      expect(urlRegex.test("https://example.com")).toBe(true);
    });

    it("should reject invalid URLs", () => {
      const urlRegex = /^https?:\/\/.+/;
      expect(urlRegex.test("not-a-url")).toBe(false);
      expect(urlRegex.test("ftp://example.com")).toBe(false);
    });
  });
});
