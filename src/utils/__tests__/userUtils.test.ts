import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  generateUUID,
  toPublicUser,
  findUserByUserId,
  findUserById,
  updateUserInArray,
  updateUserWithTimestamp,
  createStoredUser,
  verifyUserPassword,
} from "../userUtils";

import { PasswordUtils } from "../passwordUtils";
import type { StoredUser } from "@src/stores/userStore";
import type { User, CreateUserData } from "@src/types/user";

// PasswordUtils 모킹
vi.mock("../passwordUtils", () => ({
  PasswordUtils: {
    hashPassword: vi.fn(),
    verifyPassword: vi.fn(),
  },
}));

describe("userUtils", () => {
  // 테스트용 샘플 데이터
  const mockStoredUser: StoredUser = {
    id: "user-123",
    userId: "testuser",
    nickname: "테스트유저",
    passwordHash: "hashed_password_123",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };

  const mockStoredUsers: StoredUser[] = [
    mockStoredUser,
    {
      id: "user-456",
      userId: "anotheruser",
      nickname: "다른유저",
      passwordHash: "hashed_password_456",
      createdAt: "2024-01-02T00:00:00.000Z",
      updatedAt: "2024-01-02T00:00:00.000Z",
    },
  ];

  describe("generateUUID", () => {
    it("UUID 형식의 문자열을 반환해야 한다", () => {
      const uuid = generateUUID();

      // UUID v4 형식 검증 (8-4-4-4-12)
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuid).toMatch(uuidRegex);
    });

    it("매번 다른 UUID를 생성해야 한다", () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();

      expect(uuid1).not.toBe(uuid2);
    });

    it("crypto.randomUUID가 있으면 사용해야 한다", () => {
      // crypto.randomUUID 모킹
      const mockRandomUUID = vi.fn(() => "mocked-uuid-123");
      Object.defineProperty(global, "crypto", {
        value: { randomUUID: mockRandomUUID },
        writable: true,
      });

      const uuid = generateUUID();

      expect(mockRandomUUID).toHaveBeenCalled();
      expect(uuid).toBe("mocked-uuid-123");
    });

    it("crypto.randomUUID가 없으면 fallback을 사용해야 한다", () => {
      // crypto 제거
      Object.defineProperty(global, "crypto", {
        value: undefined,
        writable: true,
      });

      const uuid = generateUUID();

      // fallback UUID 형식 검증
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuid).toMatch(uuidRegex);
    });
  });

  describe("toPublicUser", () => {
    it("passwordHash를 제외한 사용자 정보를 반환해야 한다", () => {
      const publicUser = toPublicUser(mockStoredUser);

      expect(publicUser).toEqual({
        id: "user-123",
        userId: "testuser",
        nickname: "테스트유저",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      });

      // passwordHash가 포함되지 않았는지 확인
      expect("passwordHash" in publicUser).toBe(false);
    });

    it("원본 객체를 변경하지 않아야 한다", () => {
      const originalUser = { ...mockStoredUser };
      toPublicUser(mockStoredUser);

      expect(mockStoredUser).toEqual(originalUser);
    });
  });

  describe("findUserByUserId", () => {
    it("userId로 사용자를 찾아야 한다", () => {
      const user = findUserByUserId(mockStoredUsers, "testuser");

      expect(user).toEqual(mockStoredUser);
    });

    it("존재하지 않는 userId면 null을 반환해야 한다", () => {
      const user = findUserByUserId(mockStoredUsers, "nonexistent");

      expect(user).toBeNull();
    });

    it("빈 배열에서는 null을 반환해야 한다", () => {
      const user = findUserByUserId([], "testuser");

      expect(user).toBeNull();
    });

    it("대소문자를 구분해야 한다", () => {
      const user = findUserByUserId(mockStoredUsers, "TESTUSER");

      expect(user).toBeNull();
    });
  });

  describe("findUserById", () => {
    it("id로 사용자를 찾아야 한다", () => {
      const user = findUserById(mockStoredUsers, "user-123");

      expect(user).toEqual(mockStoredUser);
    });

    it("존재하지 않는 id면 null을 반환해야 한다", () => {
      const user = findUserById(mockStoredUsers, "user-999");

      expect(user).toBeNull();
    });

    it("빈 배열에서는 null을 반환해야 한다", () => {
      const user = findUserById([], "user-123");

      expect(user).toBeNull();
    });
  });

  describe("updateUserWithTimestamp", () => {
    beforeEach(() => {
      // Date.now() 모킹
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-02-01T12:00:00.000Z"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("사용자 정보를 업데이트하고 updatedAt을 갱신해야 한다", () => {
      const updates: Partial<User> = {
        nickname: "새로운닉네임",
      };

      const updatedUser = updateUserWithTimestamp(mockStoredUser, updates);

      expect(updatedUser).toEqual({
        ...mockStoredUser,
        nickname: "새로운닉네임",
        updatedAt: "2024-02-01T12:00:00.000Z",
      });
    });

    it("원본 사용자 객체를 변경하지 않아야 한다", () => {
      const originalUser = { ...mockStoredUser };
      const updates: Partial<User> = { nickname: "새로운닉네임" };

      updateUserWithTimestamp(mockStoredUser, updates);

      expect(mockStoredUser).toEqual(originalUser);
    });

    it("빈 업데이트도 updatedAt을 갱신해야 한다", () => {
      const updatedUser = updateUserWithTimestamp(mockStoredUser, {});

      expect(updatedUser.updatedAt).toBe("2024-02-01T12:00:00.000Z");
      expect(updatedUser.updatedAt).not.toBe(mockStoredUser.updatedAt);
    });
  });

  describe("updateUserInArray", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-02-01T12:00:00.000Z"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("존재하는 사용자를 업데이트해야 한다", () => {
      const updates: Partial<User> = {
        nickname: "업데이트된닉네임",
      };

      const result = updateUserInArray(mockStoredUsers, "user-123", updates);

      expect(result.updatedUser).toEqual({
        ...mockStoredUser,
        nickname: "업데이트된닉네임",
        updatedAt: "2024-02-01T12:00:00.000Z",
      });

      expect(result.updatedUsers).toHaveLength(2);
      expect(result.updatedUsers[0]).toEqual(result.updatedUser);
      expect(result.updatedUsers[1]).toEqual(mockStoredUsers[1]);
    });

    it("존재하지 않는 사용자면 원본 배열과 null을 반환해야 한다", () => {
      const updates: Partial<User> = {
        nickname: "업데이트된닉네임",
      };

      const result = updateUserInArray(mockStoredUsers, "user-999", updates);

      expect(result.updatedUser).toBeNull();
      expect(result.updatedUsers).toBe(mockStoredUsers); // 같은 참조
    });

    it("원본 배열을 변경하지 않아야 한다", () => {
      const originalUsers = [...mockStoredUsers];
      const updates: Partial<User> = {
        nickname: "업데이트된닉네임",
      };

      const result = updateUserInArray(mockStoredUsers, "user-123", updates);

      expect(mockStoredUsers).toEqual(originalUsers);
      expect(result.updatedUsers).not.toBe(mockStoredUsers); // 다른 참조
    });

    it("빈 배열에서는 null과 원본 배열을 반환해야 한다", () => {
      const emptyArray: StoredUser[] = [];
      const updates: Partial<User> = {
        nickname: "업데이트된닉네임",
      };

      const result = updateUserInArray(emptyArray, "user-123", updates);

      expect(result.updatedUser).toBeNull();
      expect(result.updatedUsers).toBe(emptyArray);
    });
  });

  describe("createStoredUser", () => {
    it("새 사용자 객체를 생성해야 한다", async () => {
      const userData: CreateUserData = {
        userId: "testuser",
        nickname: "테스트유저",
        password: "testPassword123!",
      };

      // PasswordUtils.hashPassword 모킹
      const mockHashedPassword = "$2a$12$hashedPassword";
      vi.mocked(PasswordUtils.hashPassword).mockResolvedValue(
        mockHashedPassword
      );

      // 시간 모킹
      const mockDate = new Date("2024-01-01T12:00:00.000Z");
      vi.setSystemTime(mockDate);

      const result = await createStoredUser(userData);

      // UUID는 실제로 생성되므로 존재 여부만 확인
      expect(result.id).toBeDefined();
      expect(result.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );

      expect(result).toEqual({
        id: expect.any(String),
        userId: "testuser",
        nickname: "테스트유저",
        passwordHash: mockHashedPassword,
        createdAt: "2024-01-01T12:00:00.000Z",
        updatedAt: "2024-01-01T12:00:00.000Z",
      });

      expect(PasswordUtils.hashPassword).toHaveBeenCalledWith(
        "testPassword123!"
      );
    });

    it("비밀번호 해싱이 실패하면 에러를 전파해야 한다", async () => {
      const userData: CreateUserData = {
        userId: "testuser",
        nickname: "테스트유저",
        password: "testPassword123!",
      };

      // PasswordUtils.hashPassword가 에러를 던지도록 모킹
      const hashError = new Error("해싱 실패");
      vi.mocked(PasswordUtils.hashPassword).mockRejectedValue(hashError);

      await expect(createStoredUser(userData)).rejects.toThrow("해싱 실패");
    });
  });

  describe("verifyUserPassword", () => {
    it("올바른 비밀번호일 때 true를 반환해야 한다", async () => {
      const password = "testPassword123!";
      const hash = "$2a$12$hashedPassword";

      vi.mocked(PasswordUtils.verifyPassword).mockResolvedValue(true);

      const result = await verifyUserPassword(password, hash);

      expect(result).toBe(true);
      expect(PasswordUtils.verifyPassword).toHaveBeenCalledWith(password, hash);
    });

    it("잘못된 비밀번호일 때 false를 반환해야 한다", async () => {
      const password = "wrongPassword";
      const hash = "$2a$12$hashedPassword";

      vi.mocked(PasswordUtils.verifyPassword).mockResolvedValue(false);

      const result = await verifyUserPassword(password, hash);

      expect(result).toBe(false);
      expect(PasswordUtils.verifyPassword).toHaveBeenCalledWith(password, hash);
    });

    it("검증 중 에러가 발생하면 에러를 전파해야 한다", async () => {
      const password = "testPassword";
      const hash = "invalidHash";
      const verifyError = new Error("검증 실패");

      vi.mocked(PasswordUtils.verifyPassword).mockRejectedValue(verifyError);

      await expect(verifyUserPassword(password, hash)).rejects.toThrow(
        "검증 실패"
      );
    });
  });
});
