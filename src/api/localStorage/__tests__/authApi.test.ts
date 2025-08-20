import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { LocalStorageAuthApi } from "../authApi";
import { AuthValidation } from "@src/utils/authValidation";
import { TokenStorage } from "../tokenStorage";
import { useUserStore } from "@src/stores/userStore";
import * as apiHelpers from "@src/utils/apiHelpers";
import type {
  RegisterRequest,
  LoginRequest,
  RefreshTokenRequest,
} from "@src/types/api";
import {
  TestDataFactory,
  MockSetupHelper,
  setupCommonTestEnvironment,
  type MockUserStore,
  type MockTokenStorage,
} from "@src/test/helpers/commonTestHelpers";

// Mock dependencies
vi.mock("@src/utils/authValidation");
vi.mock("../tokenStorage");
vi.mock("@src/stores/userStore");
vi.mock("@src/utils/apiHelpers");

describe("LocalStorageAuthApi", () => {
  let authApi: LocalStorageAuthApi;
  let mockUserStore: MockUserStore;
  let mockTokenStorage: MockTokenStorage;

  // 공통 테스트 환경 설정
  setupCommonTestEnvironment();

  beforeEach(() => {
    // Mock userStore
    mockUserStore = MockSetupHelper.setupUserStoreMock();
    (useUserStore.getState as ReturnType<typeof vi.fn>).mockReturnValue(
      mockUserStore
    );

    // Mock TokenStorage
    mockTokenStorage = MockSetupHelper.setupTokenStorageMock();
    (TokenStorage.clearTokens as ReturnType<typeof vi.fn>) =
      mockTokenStorage.clearTokens;

    // Mock AuthValidation
    (
      AuthValidation.validateRegisterInput as ReturnType<typeof vi.fn>
    ).mockReturnValue(null);

    // Mock apiHelpers
    (
      apiHelpers.validateUserIdNotExists as ReturnType<typeof vi.fn>
    ).mockReturnValue(undefined);
    (
      apiHelpers.findAndValidateUser as ReturnType<typeof vi.fn>
    ).mockReturnValue(TestDataFactory.createStoredUser());
    (apiHelpers.validatePassword as ReturnType<typeof vi.fn>).mockResolvedValue(
      undefined
    );
    (apiHelpers.authenticateUser as ReturnType<typeof vi.fn>).mockReturnValue(
      TestDataFactory.createTokens()
    );
    (apiHelpers.createAuthResponse as ReturnType<typeof vi.fn>).mockReturnValue(
      {
        user: TestDataFactory.createUser(),
        tokens: TestDataFactory.createTokens(),
      }
    );
    (
      apiHelpers.validateAndParseRefreshToken as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      userId: "user-123",
    });
    (
      apiHelpers.findUserByIdForRefresh as ReturnType<typeof vi.fn>
    ).mockReturnValue(TestDataFactory.createUser());
    (
      apiHelpers.generateAndStoreTokens as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
    });
    (apiHelpers.toPublicUser as ReturnType<typeof vi.fn>).mockReturnValue(
      TestDataFactory.createUser()
    );

    authApi = new LocalStorageAuthApi();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("register", () => {
    const mockRegisterData = TestDataFactory.createRegisterRequest();

    it("성공적인 회원가입을 처리해야 한다", async () => {
      const mockUser = TestDataFactory.createStoredUser();

      mockUserStore.createUser.mockResolvedValue(mockUser);

      const result = await authApi.register(mockRegisterData);

      expect(AuthValidation.validateRegisterInput).toHaveBeenCalledWith(
        mockRegisterData
      );
      expect(apiHelpers.validateUserIdNotExists).toHaveBeenCalledWith(
        mockRegisterData.userId
      );
      expect(mockUserStore.createUser).toHaveBeenCalledWith(mockRegisterData);
      expect(apiHelpers.authenticateUser).toHaveBeenCalled();
      expect(apiHelpers.createAuthResponse).toHaveBeenCalled();
      expect(result).toHaveProperty("user");
      expect(result).toHaveProperty("tokens");
    });

    it("입력값 검증 실패 시 에러를 던져야 한다", async () => {
      const validationError = new Error("입력값 검증 실패");
      (
        AuthValidation.validateRegisterInput as ReturnType<typeof vi.fn>
      ).mockReturnValue(validationError);

      await expect(authApi.register(mockRegisterData)).rejects.toThrow(
        "입력값 검증 실패"
      );
    });

    it("중복 사용자 확인 실패 시 에러를 던져야 한다", async () => {
      const duplicateError = new Error("이미 존재하는 사용자입니다");
      (
        apiHelpers.validateUserIdNotExists as ReturnType<typeof vi.fn>
      ).mockImplementation(() => {
        throw duplicateError;
      });

      await expect(authApi.register(mockRegisterData)).rejects.toThrow(
        "이미 존재하는 사용자입니다"
      );
    });

    it("사용자 생성 실패 시 에러를 던져야 한다", async () => {
      const createError = new Error("사용자 생성 실패");
      mockUserStore.createUser.mockRejectedValue(createError);

      await expect(authApi.register(mockRegisterData)).rejects.toThrow(
        "사용자 생성 실패"
      );
    });
  });

  describe("login", () => {
    const mockLoginData = TestDataFactory.createLoginRequest();

    it("성공적인 로그인을 처리해야 한다", async () => {
      const result = await authApi.login(mockLoginData);

      expect(apiHelpers.findAndValidateUser).toHaveBeenCalledWith(
        mockLoginData.userId
      );
      expect(apiHelpers.validatePassword).toHaveBeenCalledWith(
        mockLoginData.password,
        "hashedPassword123"
      );
      expect(apiHelpers.authenticateUser).toHaveBeenCalled();
      expect(apiHelpers.createAuthResponse).toHaveBeenCalled();
      expect(result).toHaveProperty("user");
      expect(result).toHaveProperty("tokens");
    });

    it("사용자 찾기 실패 시 에러를 던져야 한다", async () => {
      const findError = new Error("사용자를 찾을 수 없습니다");
      (
        apiHelpers.findAndValidateUser as ReturnType<typeof vi.fn>
      ).mockImplementation(() => {
        throw findError;
      });

      await expect(authApi.login(mockLoginData)).rejects.toThrow(
        "사용자를 찾을 수 없습니다"
      );
    });

    it("비밀번호 검증 실패 시 에러를 던져야 한다", async () => {
      const passwordError = new Error("비밀번호가 일치하지 않습니다");
      (
        apiHelpers.validatePassword as ReturnType<typeof vi.fn>
      ).mockRejectedValue(passwordError);

      await expect(authApi.login(mockLoginData)).rejects.toThrow(
        "비밀번호가 일치하지 않습니다"
      );
    });
  });

  describe("logout", () => {
    it("성공적인 로그아웃을 처리해야 한다", async () => {
      await authApi.logout();

      expect(mockUserStore.setCurrentUser).toHaveBeenCalledWith(null);
      expect(mockTokenStorage.clearTokens).toHaveBeenCalled();
    });
  });

  describe("refreshToken", () => {
    const mockRefreshData: RefreshTokenRequest = {
      refreshToken: "refresh-token",
    };

    it("성공적인 토큰 갱신을 처리해야 한다", async () => {
      const result = await authApi.refreshToken(mockRefreshData);

      expect(apiHelpers.validateAndParseRefreshToken).toHaveBeenCalledWith(
        mockRefreshData.refreshToken
      );
      expect(apiHelpers.findUserByIdForRefresh).toHaveBeenCalledWith(
        "user-123"
      );
      expect(apiHelpers.generateAndStoreTokens).toHaveBeenCalledWith(
        "user-123"
      );
      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
    });

    it("리프레시 토큰 검증 실패 시 에러를 던져야 한다", async () => {
      const tokenError = new Error("유효하지 않은 토큰입니다");
      (
        apiHelpers.validateAndParseRefreshToken as ReturnType<typeof vi.fn>
      ).mockImplementation(() => {
        throw tokenError;
      });

      await expect(authApi.refreshToken(mockRefreshData)).rejects.toThrow(
        "유효하지 않은 토큰입니다"
      );
    });

    it("사용자 찾기 실패 시 에러를 던져야 한다", async () => {
      const userError = new Error("사용자를 찾을 수 없습니다");
      (
        apiHelpers.findUserByIdForRefresh as ReturnType<typeof vi.fn>
      ).mockImplementation(() => {
        throw userError;
      });

      await expect(authApi.refreshToken(mockRefreshData)).rejects.toThrow(
        "사용자를 찾을 수 없습니다"
      );
    });
  });
});
