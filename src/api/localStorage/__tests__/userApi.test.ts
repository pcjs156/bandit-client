import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { LocalStorageUserApi } from "../userApi";
import { AuthValidation } from "@src/utils/authValidation";
import { useUserStore } from "@src/stores/userStore";
import { ApiErrorCode } from "@src/types/api";
import type { UpdateUserRequest, ApiError } from "@src/types/api";

// Mock dependencies
vi.mock("@src/utils/authValidation");
vi.mock("@src/stores/userStore");

describe("LocalStorageUserApi", () => {
  let userApi: LocalStorageUserApi;
  let mockUserStore: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock userStore
    mockUserStore = {
      currentUser: null,
      findUserById: vi.fn(),
      updateUser: vi.fn(),
    };
    (useUserStore.getState as any).mockReturnValue(mockUserStore);

    // Mock AuthValidation
    (AuthValidation.validateUpdateUserInput as any).mockReturnValue(null);

    userApi = new LocalStorageUserApi();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getMe", () => {
    it("현재 로그인된 사용자 정보를 올바르게 조회해야 한다", async () => {
      const mockCurrentUser = {
        id: "user-123",
        userId: "testuser",
        nickname: "테스트유저",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockStoredUser = {
        ...mockCurrentUser,
        passwordHash: "hashedPassword",
      };

      mockUserStore.currentUser = mockCurrentUser;
      mockUserStore.findUserById.mockReturnValue(mockStoredUser);

      const result = await userApi.getMe();

      expect(mockUserStore.findUserById).toHaveBeenCalledWith("user-123");
      expect(result).toEqual({
        id: "user-123",
        userId: "testuser",
        nickname: "테스트유저",
        createdAt: mockCurrentUser.createdAt,
        updatedAt: mockCurrentUser.updatedAt,
      });
      expect(result).not.toHaveProperty("passwordHash");
    });

    it("현재 로그인된 사용자가 없으면 UNAUTHORIZED 에러를 던져야 한다", async () => {
      mockUserStore.currentUser = null;

      await expect(userApi.getMe()).rejects.toMatchObject({
        detailCode: ApiErrorCode.UNAUTHORIZED,
      });
    });

    it("저장된 사용자 정보를 찾을 수 없으면 UNAUTHORIZED 에러를 던져야 한다", async () => {
      const mockCurrentUser = {
        id: "user-123",
        userId: "testuser",
        nickname: "테스트유저",
      };

      mockUserStore.currentUser = mockCurrentUser;
      mockUserStore.findUserById.mockReturnValue(null);

      await expect(userApi.getMe()).rejects.toMatchObject({
        detailCode: ApiErrorCode.UNAUTHORIZED,
      });
    });

    it("passwordHash 필드가 제외된 사용자 정보를 반환해야 한다", async () => {
      const mockCurrentUser = {
        id: "user-123",
        userId: "testuser",
        nickname: "테스트유저",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockStoredUser = {
        ...mockCurrentUser,
        passwordHash: "hashedPassword",
        extraField: "extraValue",
      };

      mockUserStore.currentUser = mockCurrentUser;
      mockUserStore.findUserById.mockReturnValue(mockStoredUser);

      const result = await userApi.getMe();

      expect(result).not.toHaveProperty("passwordHash");
      expect(result).toHaveProperty("extraField");
      expect(result).toMatchObject({ extraField: "extraValue" });
    });
  });

  describe("updateMe", () => {
    const mockUpdateData: UpdateUserRequest = {
      nickname: "업데이트된닉네임",
    };

    it("사용자 정보를 성공적으로 업데이트해야 한다", async () => {
      const mockCurrentUser = {
        id: "user-123",
        userId: "testuser",
        nickname: "기존닉네임",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockUpdatedUser = {
        ...mockCurrentUser,
        nickname: "업데이트된닉네임",
        passwordHash: "hashedPassword",
      };

      mockUserStore.currentUser = mockCurrentUser;
      mockUserStore.updateUser.mockReturnValue(mockUpdatedUser);

      const result = await userApi.updateMe(mockUpdateData);

      expect(AuthValidation.validateUpdateUserInput).toHaveBeenCalledWith(
        mockUpdateData
      );
      expect(mockUserStore.updateUser).toHaveBeenCalledWith(
        "user-123",
        mockUpdateData
      );
      expect(result).toEqual({
        id: "user-123",
        userId: "testuser",
        nickname: "업데이트된닉네임",
        createdAt: mockCurrentUser.createdAt,
        updatedAt: mockCurrentUser.updatedAt,
      });
      expect(result).not.toHaveProperty("passwordHash");
    });

    it("현재 로그인된 사용자가 없으면 UNAUTHORIZED 에러를 던져야 한다", async () => {
      mockUserStore.currentUser = null;

      await expect(userApi.updateMe(mockUpdateData)).rejects.toMatchObject({
        detailCode: ApiErrorCode.UNAUTHORIZED,
      });
    });

    it("입력값 검증 실패 시 에러를 던져야 한다", async () => {
      const mockCurrentUser = {
        id: "user-123",
        userId: "testuser",
        nickname: "기존닉네임",
      };

      const validationError = new Error("닉네임은 2자 이상이어야 합니다");
      (AuthValidation.validateUpdateUserInput as any).mockReturnValue(
        validationError
      );

      mockUserStore.currentUser = mockCurrentUser;

      await expect(userApi.updateMe(mockUpdateData)).rejects.toThrow(
        "닉네임은 2자 이상이어야 합니다"
      );
    });

    it("사용자 업데이트 실패 시 NOT_FOUND 에러를 던져야 한다", async () => {
      const mockCurrentUser = {
        id: "user-123",
        userId: "testuser",
        nickname: "기존닉네임",
      };

      mockUserStore.currentUser = mockCurrentUser;
      mockUserStore.updateUser.mockReturnValue(null);

      await expect(userApi.updateMe(mockUpdateData)).rejects.toMatchObject({
        detailCode: ApiErrorCode.NOT_FOUND,
        message: "사용자를 찾을 수 없습니다",
      });
    });

    it("빈 업데이트 데이터도 처리할 수 있어야 한다", async () => {
      const mockCurrentUser = {
        id: "user-123",
        userId: "testuser",
        nickname: "기존닉네임",
      };

      const emptyUpdateData: UpdateUserRequest = {};
      const mockUpdatedUser = {
        ...mockCurrentUser,
        passwordHash: "hashedPassword",
      };

      mockUserStore.currentUser = mockCurrentUser;
      mockUserStore.updateUser.mockReturnValue(mockUpdatedUser);

      const result = await userApi.updateMe(emptyUpdateData);

      expect(AuthValidation.validateUpdateUserInput).toHaveBeenCalledWith(
        emptyUpdateData
      );
      expect(mockUserStore.updateUser).toHaveBeenCalledWith(
        "user-123",
        emptyUpdateData
      );
      expect(result).toBeDefined();
    });

    it("여러 필드를 동시에 업데이트할 수 있어야 한다", async () => {
      const mockCurrentUser = {
        id: "user-123",
        userId: "testuser",
        nickname: "기존닉네임",
      };

      const multiFieldUpdateData: UpdateUserRequest = {
        nickname: "새닉네임",
        // 다른 필드들도 추가 가능
      };

      const mockUpdatedUser = {
        ...mockCurrentUser,
        nickname: "새닉네임",
        passwordHash: "hashedPassword",
      };

      mockUserStore.currentUser = mockCurrentUser;
      mockUserStore.updateUser.mockReturnValue(mockUpdatedUser);

      const result = await userApi.updateMe(multiFieldUpdateData);

      expect(mockUserStore.updateUser).toHaveBeenCalledWith(
        "user-123",
        multiFieldUpdateData
      );
      expect(result.nickname).toBe("새닉네임");
    });
  });

  describe("에러 처리", () => {
    it("UNAUTHORIZED 에러는 detailCode만 가져야 한다", async () => {
      mockUserStore.currentUser = null;

      try {
        await userApi.getMe();
      } catch (error) {
        const apiError = error as ApiError;
        expect(apiError.detailCode).toBe(ApiErrorCode.UNAUTHORIZED);
        expect(apiError.message).toBeUndefined();
      }
    });

    it("NOT_FOUND 에러는 detailCode와 message를 가져야 한다", async () => {
      const mockCurrentUser = {
        id: "user-123",
        userId: "testuser",
        nickname: "기존닉네임",
      };

      mockUserStore.currentUser = mockCurrentUser;
      mockUserStore.updateUser.mockReturnValue(null);

      try {
        await userApi.updateMe({ nickname: "새닉네임" });
      } catch (error) {
        const apiError = error as ApiError;
        expect(apiError.detailCode).toBe(ApiErrorCode.NOT_FOUND);
        expect(apiError.message).toBe("사용자를 찾을 수 없습니다");
      }
    });
  });
});
