import { describe, it, expect, vi, beforeEach } from "vitest";
import { PasswordUtils } from "../passwordUtils";
import bcrypt from "bcryptjs";

// bcrypt 모킹
vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn().mockResolvedValue(false),
    hash: vi.fn().mockResolvedValue(""),
  },
}));

const mockedBcrypt = vi.mocked(bcrypt) as {
  compare: ReturnType<typeof vi.fn>;
  hash: ReturnType<typeof vi.fn>;
};

describe("PasswordUtils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // console.error 모킹하여 테스트 출력 깔끔하게 유지
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("verifyPassword", () => {
    it("올바른 비밀번호일 때 true를 반환해야 한다", async () => {
      // Arrange
      const password = "testPassword123";
      const hash = "hashedPassword";
      mockedBcrypt.compare.mockResolvedValue(true);

      // Act
      const result = await PasswordUtils.verifyPassword(password, hash);

      // Assert
      expect(result).toBe(true);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(password, hash);
    });

    it("잘못된 비밀번호일 때 false를 반환해야 한다", async () => {
      // Arrange
      const password = "wrongPassword";
      const hash = "hashedPassword";
      mockedBcrypt.compare.mockResolvedValue(false);

      // Act
      const result = await PasswordUtils.verifyPassword(password, hash);

      // Assert
      expect(result).toBe(false);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(password, hash);
    });

    it("bcrypt.compare에서 에러가 발생할 때 false를 반환하고 에러를 로그해야 한다", async () => {
      // Arrange
      const password = "testPassword";
      const hash = "invalidHash";
      const error = new Error("Invalid hash");
      mockedBcrypt.compare.mockRejectedValue(error);

      // Act
      const result = await PasswordUtils.verifyPassword(password, hash);

      // Assert
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        "Password verification failed:",
        error
      );
    });
  });

  describe("hashPassword", () => {
    it("비밀번호를 성공적으로 해싱해야 한다", async () => {
      // Arrange
      const password = "testPassword123";
      const hashedPassword = "$2a$12$hashedPassword";
      mockedBcrypt.hash.mockResolvedValue(hashedPassword);

      // Act
      const result = await PasswordUtils.hashPassword(password);

      // Assert
      expect(result).toBe(hashedPassword);
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(password, 12);
    });

    it("해싱 중 에러가 발생할 때 에러를 던져야 한다", async () => {
      // Arrange
      const password = "testPassword";
      const error = new Error("Hashing failed");
      mockedBcrypt.hash.mockRejectedValue(error);

      // Act & Assert
      await expect(PasswordUtils.hashPassword(password)).rejects.toThrow(
        "비밀번호 처리 중 오류가 발생했습니다"
      );
      expect(console.error).toHaveBeenCalledWith(
        "Password hashing failed:",
        error
      );
    });

    it("빈 문자열 비밀번호도 처리할 수 있어야 한다", async () => {
      // Arrange
      const password = "";
      const hashedPassword = "$2a$12$emptyPasswordHash";
      mockedBcrypt.hash.mockResolvedValue(hashedPassword);

      // Act
      const result = await PasswordUtils.hashPassword(password);

      // Assert
      expect(result).toBe(hashedPassword);
      expect(mockedBcrypt.hash).toHaveBeenCalledWith("", 12);
    });

    it("특수문자가 포함된 비밀번호를 처리할 수 있어야 한다", async () => {
      // Arrange
      const password = "test@#$%^&*()Password123!";
      const hashedPassword = "$2a$12$specialCharsHash";
      mockedBcrypt.hash.mockResolvedValue(hashedPassword);

      // Act
      const result = await PasswordUtils.hashPassword(password);

      // Assert
      expect(result).toBe(hashedPassword);
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(password, 12);
    });
  });
});
