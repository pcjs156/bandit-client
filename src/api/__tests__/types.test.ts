import { describe, it, expect } from "vitest";
import type { 
  AuthApiClient, 
  UserApiClient, 
  ApiClient 
} from "../types";
import type { 
  RegisterRequest, 
  LoginRequest, 
  RefreshTokenRequest, 
  UpdateUserRequest, 
  AuthResponse, 
  AuthTokens 
} from "@src/types/api";
import type { User } from "@src/types/user";

describe("API Types", () => {
  describe("AuthApiClient", () => {
    it("AuthApiClient 인터페이스가 올바르게 정의되어야 한다", () => {
      // 타입 체크를 위한 더미 구현체
      const authClient: AuthApiClient = {
        register: async (data: RegisterRequest): Promise<AuthResponse> => {
          return {
            user: {} as User,
            tokens: {} as AuthTokens,
          };
        },
        login: async (data: LoginRequest): Promise<AuthResponse> => {
          return {
            user: {} as User,
            tokens: {} as AuthTokens,
          };
        },
        logout: async (): Promise<void> => {},
        refreshToken: async (data: RefreshTokenRequest): Promise<AuthTokens> => {
          return {} as AuthTokens;
        },
      };

      expect(authClient).toBeDefined();
      expect(typeof authClient.register).toBe("function");
      expect(typeof authClient.login).toBe("function");
      expect(typeof authClient.logout).toBe("function");
      expect(typeof authClient.refreshToken).toBe("function");
    });

    it("register 메서드가 올바른 타입을 가져야 한다", () => {
      const authClient: AuthApiClient = {
        register: async (data: RegisterRequest): Promise<AuthResponse> => {
          expect(data).toHaveProperty("userId");
          expect(data).toHaveProperty("password");
          expect(data).toHaveProperty("nickname");
          return {
            user: {} as User,
            tokens: {} as AuthTokens,
          };
        },
        login: async () => ({} as AuthResponse),
        logout: async () => {},
        refreshToken: async () => ({} as AuthTokens),
      };

      expect(typeof authClient.register).toBe("function");
    });

    it("login 메서드가 올바른 타입을 가져야 한다", () => {
      const authClient: AuthApiClient = {
        register: async () => ({} as AuthResponse),
        login: async (data: LoginRequest): Promise<AuthResponse> => {
          expect(data).toHaveProperty("userId");
          expect(data).toHaveProperty("password");
          return {
            user: {} as User,
            tokens: {} as AuthTokens,
          };
        },
        logout: async () => {},
        refreshToken: async () => ({} as AuthTokens),
      };

      expect(typeof authClient.login).toBe("function");
    });

    it("logout 메서드가 올바른 타입을 가져야 한다", () => {
      const authClient: AuthApiClient = {
        register: async () => ({} as AuthResponse),
        login: async () => ({} as AuthResponse),
        logout: async (): Promise<void> => {
          // void 반환
        },
        refreshToken: async () => ({} as AuthTokens),
      };

      expect(typeof authClient.logout).toBe("function");
    });

    it("refreshToken 메서드가 올바른 타입을 가져야 한다", () => {
      const authClient: AuthApiClient = {
        register: async () => ({} as AuthResponse),
        login: async () => ({} as AuthResponse),
        logout: async () => {},
        refreshToken: async (data: RefreshTokenRequest): Promise<AuthTokens> => {
          expect(data).toHaveProperty("refreshToken");
          return {} as AuthTokens;
        },
      };

      expect(typeof authClient.refreshToken).toBe("function");
    });
  });

  describe("UserApiClient", () => {
    it("UserApiClient 인터페이스가 올바르게 정의되어야 한다", () => {
      // 타입 체크를 위한 더미 구현체
      const userClient: UserApiClient = {
        getMe: async (): Promise<User> => {
          return {} as User;
        },
        updateMe: async (data: UpdateUserRequest): Promise<User> => {
          return {} as User;
        },
      };

      expect(userClient).toBeDefined();
      expect(typeof userClient.getMe).toBe("function");
      expect(typeof userClient.updateMe).toBe("function");
    });

    it("getMe 메서드가 올바른 타입을 가져야 한다", () => {
      const userClient: UserApiClient = {
        getMe: async (): Promise<User> => {
          return {
            id: "user-123",
            userId: "testuser",
            nickname: "테스트유저",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        },
        updateMe: async () => ({} as User),
      };

      expect(typeof userClient.getMe).toBe("function");
    });

    it("updateMe 메서드가 올바른 타입을 가져야 한다", () => {
      const userClient: UserApiClient = {
        getMe: async () => ({} as User),
        updateMe: async (data: UpdateUserRequest): Promise<User> => {
          // UpdateUserRequest는 선택적 필드를 가질 수 있음
          if (data.nickname) {
            expect(typeof data.nickname).toBe("string");
          }
          return {} as User;
        },
      };

      expect(typeof userClient.updateMe).toBe("function");
    });
  });

  describe("ApiClient", () => {
    it("ApiClient 인터페이스가 올바르게 정의되어야 한다", () => {
      // 타입 체크를 위한 더미 구현체
      const apiClient: ApiClient = {
        auth: {
          register: async () => ({} as AuthResponse),
          login: async () => ({} as AuthResponse),
          logout: async () => {},
          refreshToken: async () => ({} as AuthTokens),
        },
        user: {
          getMe: async () => ({} as User),
          updateMe: async () => ({} as User),
        },
      };

      expect(apiClient).toBeDefined();
      expect(apiClient.auth).toBeDefined();
      expect(apiClient.user).toBeDefined();
    });

    it("ApiClient는 auth와 user 속성을 가져야 한다", () => {
      const apiClient: ApiClient = {
        auth: {} as AuthApiClient,
        user: {} as UserApiClient,
      };

      expect(apiClient).toHaveProperty("auth");
      expect(apiClient).toHaveProperty("user");
    });

    it("ApiClient.auth는 AuthApiClient 타입이어야 한다", () => {
      const apiClient: ApiClient = {
        auth: {
          register: async () => ({} as AuthResponse),
          login: async () => ({} as AuthResponse),
          logout: async () => {},
          refreshToken: async () => ({} as AuthTokens),
        },
        user: {} as UserApiClient,
      };

      expect(apiClient.auth).toHaveProperty("register");
      expect(apiClient.auth).toHaveProperty("login");
      expect(apiClient.auth).toHaveProperty("logout");
      expect(apiClient.auth).toHaveProperty("refreshToken");
    });

    it("ApiClient.user는 UserApiClient 타입이어야 한다", () => {
      const apiClient: ApiClient = {
        auth: {} as AuthApiClient,
        user: {
          getMe: async () => ({} as User),
          updateMe: async () => ({} as User),
        },
      };

      expect(apiClient.user).toHaveProperty("getMe");
      expect(apiClient.user).toHaveProperty("updateMe");
    });
  });

  describe("타입 호환성", () => {
    it("AuthApiClient와 UserApiClient는 독립적으로 사용 가능해야 한다", () => {
      // AuthApiClient만 필요한 경우
      const authOnly: AuthApiClient = {
        register: async () => ({} as AuthResponse),
        login: async () => ({} as AuthResponse),
        logout: async () => {},
        refreshToken: async () => ({} as AuthTokens),
      };

      // UserApiClient만 필요한 경우
      const userOnly: UserApiClient = {
        getMe: async () => ({} as User),
        updateMe: async () => ({} as User),
      };

      expect(authOnly).toBeDefined();
      expect(userOnly).toBeDefined();
    });

    it("ApiClient는 AuthApiClient와 UserApiClient를 모두 포함해야 한다", () => {
      const apiClient: ApiClient = {
        auth: {} as AuthApiClient,
        user: {} as UserApiClient,
      };

      expect(apiClient.auth).toBeDefined();
      expect(apiClient.user).toBeDefined();
    });
  });
});
