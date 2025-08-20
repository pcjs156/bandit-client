import { describe, it, expect } from "vitest";
import type { AuthApiClient, UserApiClient, ApiClient } from "../types";
import type { User } from "@src/types/user";
import type {
  RegisterRequest,
  LoginRequest,
  RefreshTokenRequest,
  UpdateUserRequest,
  AuthResponse,
  AuthTokens,
} from "@src/types/api";

describe("src/api/types.ts", () => {
  describe("AuthApiClient 인터페이스", () => {
    it("AuthApiClient가 올바른 구조를 가져야 한다", () => {
      // 타입 체크를 위한 더미 구현체
      const authApiClient: AuthApiClient = {
        register: async (_data: RegisterRequest): Promise<AuthResponse> => {
          return {
            user: {} as User,
            accessToken: "dummy-access-token",
            refreshToken: "dummy-refresh-token",
          };
        },
        login: async (_data: LoginRequest): Promise<AuthResponse> => {
          return {
            user: {} as User,
            accessToken: "dummy-access-token",
            refreshToken: "dummy-refresh-token",
          };
        },
        logout: async (): Promise<void> => {
          // 로그아웃 로직
        },
        refreshToken: async (
          _data: RefreshTokenRequest,
        ): Promise<AuthTokens> => {
          return {} as AuthTokens;
        },
      };

      expect(authApiClient).toBeDefined();
      expect(typeof authApiClient.register).toBe("function");
      expect(typeof authApiClient.login).toBe("function");
      expect(typeof authApiClient.logout).toBe("function");
      expect(typeof authApiClient.refreshToken).toBe("function");
    });

    it("AuthApiClient의 register 메서드가 올바른 타입을 가져야 한다", () => {
      const authApiClient: AuthApiClient = {
        register: async (data: RegisterRequest): Promise<AuthResponse> => {
          expect(data).toBeDefined();
          return {
            user: {} as User,
            accessToken: "dummy-access-token",
            refreshToken: "dummy-refresh-token",
          };
        },
        login: async (): Promise<AuthResponse> => {
          return {} as AuthResponse;
        },
        logout: async (): Promise<void> => {
          // 로그아웃 로직
        },
        refreshToken: async (): Promise<AuthTokens> => {
          return {} as AuthTokens;
        },
      };

      // 타입 체크를 위한 호출
      expect(authApiClient.register).toBeDefined();
    });

    it("AuthApiClient의 login 메서드가 올바른 타입을 가져야 한다", () => {
      const authApiClient: AuthApiClient = {
        register: async (): Promise<AuthResponse> => {
          return {} as AuthResponse;
        },
        login: async (data: LoginRequest): Promise<AuthResponse> => {
          expect(data).toBeDefined();
          return {
            user: {} as User,
            accessToken: "dummy-access-token",
            refreshToken: "dummy-refresh-token",
          };
        },
        logout: async (): Promise<void> => {
          // 로그아웃 로직
        },
        refreshToken: async (): Promise<AuthTokens> => {
          return {} as AuthTokens;
        },
      };

      expect(authApiClient.login).toBeDefined();
    });

    it("AuthApiClient의 logout 메서드가 올바른 타입을 가져야 한다", () => {
      const authApiClient: AuthApiClient = {
        register: async (): Promise<AuthResponse> => {
          return {} as AuthResponse;
        },
        login: async (): Promise<AuthResponse> => {
          return {} as AuthResponse;
        },
        logout: async (): Promise<void> => {
          // 로그아웃 로직
          return Promise.resolve();
        },
        refreshToken: async (): Promise<AuthTokens> => {
          return {} as AuthTokens;
        },
      };

      expect(authApiClient.logout).toBeDefined();
    });

    it("AuthApiClient의 refreshToken 메서드가 올바른 타입을 가져야 한다", () => {
      const authApiClient: AuthApiClient = {
        register: async (): Promise<AuthResponse> => {
          return {} as AuthResponse;
        },
        login: async (): Promise<AuthResponse> => {
          return {} as AuthResponse;
        },
        logout: async (): Promise<void> => {
          // 로그아웃 로직
        },
        refreshToken: async (
          data: RefreshTokenRequest,
        ): Promise<AuthTokens> => {
          expect(data).toBeDefined();
          return {} as AuthTokens;
        },
      };

      expect(authApiClient.refreshToken).toBeDefined();
    });
  });

  describe("UserApiClient 인터페이스", () => {
    it("UserApiClient가 올바른 구조를 가져야 한다", () => {
      const userApiClient: UserApiClient = {
        getMe: async (): Promise<User> => {
          return {} as User;
        },
        updateMe: async (_data: UpdateUserRequest): Promise<User> => {
          return {} as User;
        },
      };

      expect(userApiClient).toBeDefined();
      expect(typeof userApiClient.getMe).toBe("function");
      expect(typeof userApiClient.updateMe).toBe("function");
    });

    it("UserApiClient의 getMe 메서드가 올바른 타입을 가져야 한다", () => {
      const userApiClient: UserApiClient = {
        getMe: async (): Promise<User> => {
          return {} as User;
        },
        updateMe: async (): Promise<User> => {
          return {} as User;
        },
      };

      expect(userApiClient.getMe).toBeDefined();
    });

    it("UserApiClient의 updateMe 메서드가 올바른 타입을 가져야 한다", () => {
      const userApiClient: UserApiClient = {
        getMe: async (): Promise<User> => {
          return {} as User;
        },
        updateMe: async (_data: UpdateUserRequest): Promise<User> => {
          // data는 UpdateUserRequest 타입이어야 함
          expect(_data).toBeDefined();
          return {} as User;
        },
      };

      expect(userApiClient.updateMe).toBeDefined();
    });
  });

  describe("ApiClient 인터페이스", () => {
    it("ApiClient가 올바른 구조를 가져야 한다", () => {
      const apiClient: ApiClient = {
        auth: {
          register: async (): Promise<AuthResponse> => {
            return {} as AuthResponse;
          },
          login: async (): Promise<AuthResponse> => {
            return {} as AuthResponse;
          },
          logout: async (): Promise<void> => {
            // 로그아웃 로직
          },
          refreshToken: async (): Promise<AuthTokens> => {
            return {} as AuthTokens;
          },
        },
        user: {
          getMe: async (): Promise<User> => {
            return {} as User;
          },
          updateMe: async (): Promise<User> => {
            return {} as User;
          },
        },
      };

      expect(apiClient).toBeDefined();
      expect(apiClient.auth).toBeDefined();
      expect(apiClient.user).toBeDefined();
      expect(typeof apiClient.auth.register).toBe("function");
      expect(typeof apiClient.auth.login).toBe("function");
      expect(typeof apiClient.auth.logout).toBe("function");
      expect(typeof apiClient.auth.refreshToken).toBe("function");
      expect(typeof apiClient.user.getMe).toBe("function");
      expect(typeof apiClient.user.updateMe).toBe("function");
    });

    it("ApiClient의 auth 속성이 AuthApiClient 타입이어야 한다", () => {
      const authClient: AuthApiClient = {
        register: async (): Promise<AuthResponse> => {
          return {} as AuthResponse;
        },
        login: async (): Promise<AuthResponse> => {
          return {} as AuthResponse;
        },
        logout: async (): Promise<void> => {
          // 로그아웃 로직
        },
        refreshToken: async (): Promise<AuthTokens> => {
          return {} as AuthTokens;
        },
      };

      const apiClient: ApiClient = {
        auth: authClient,
        user: {} as UserApiClient,
      };

      expect(apiClient.auth).toBe(authClient);
    });

    it("ApiClient의 user 속성이 UserApiClient 타입이어야 한다", () => {
      const userClient: UserApiClient = {
        getMe: async (): Promise<User> => {
          return {} as User;
        },
        updateMe: async (): Promise<User> => {
          return {} as User;
        },
      };

      const apiClient: ApiClient = {
        auth: {} as AuthApiClient,
        user: userClient,
      };

      expect(apiClient.user).toBe(userClient);
    });
  });

  describe("타입 호환성", () => {
    it("AuthApiClient를 구현하는 객체가 올바르게 할당되어야 한다", () => {
      const mockAuthClient = {
        register: async (_data: RegisterRequest): Promise<AuthResponse> => {
          return {
            user: {} as User,
            accessToken: "dummy-access-token",
            refreshToken: "dummy-refresh-token",
          };
        },
        login: async (_data: LoginRequest): Promise<AuthResponse> => {
          return {
            user: {} as User,
            accessToken: "dummy-access-token",
            refreshToken: "dummy-refresh-token",
          };
        },
        logout: async (): Promise<void> => {
          // 로그아웃 로직
        },
        refreshToken: async (
          _data: RefreshTokenRequest,
        ): Promise<AuthTokens> => {
          return {} as AuthTokens;
        },
      };

      const authClient: AuthApiClient = mockAuthClient;
      expect(authClient).toBe(mockAuthClient);
    });

    it("UserApiClient를 구현하는 객체가 올바르게 할당되어야 한다", () => {
      const mockUserClient = {
        getMe: async (): Promise<User> => {
          return {} as User;
        },
        updateMe: async (_data: UpdateUserRequest): Promise<User> => {
          return {} as User;
        },
      };

      const userClient: UserApiClient = mockUserClient;
      expect(userClient).toBe(mockUserClient);
    });

    it("ApiClient를 구현하는 객체가 올바르게 할당되어야 한다", () => {
      const mockApiClient = {
        auth: {
          register: async (): Promise<AuthResponse> => {
            return {} as AuthResponse;
          },
          login: async (): Promise<AuthResponse> => {
            return {} as AuthResponse;
          },
          logout: async (): Promise<void> => {
            // 로그아웃 로직
          },
          refreshToken: async (): Promise<AuthTokens> => {
            return {} as AuthTokens;
          },
        },
        user: {
          getMe: async (): Promise<User> => {
            return {} as User;
          },
          updateMe: async (): Promise<User> => {
            return {} as User;
          },
        },
      };

      const apiClient: ApiClient = mockApiClient;
      expect(apiClient).toBe(mockApiClient);
    });
  });

  describe("메서드 시그니처", () => {
    it("AuthApiClient의 register 메서드가 올바른 매개변수와 반환 타입을 가져야 한다", () => {
      const authClient: AuthApiClient = {
        register: async (_data: RegisterRequest): Promise<AuthResponse> => {
          // data는 RegisterRequest 타입이어야 함
          expect(_data).toBeDefined();
          return {
            user: {} as User,
            accessToken: "dummy-access-token",
            refreshToken: "dummy-refresh-token",
          };
        },
        login: async (): Promise<AuthResponse> => {
          return {} as AuthResponse;
        },
        logout: async (): Promise<void> => {
          // 로그아웃 로직
        },
        refreshToken: async (): Promise<AuthTokens> => {
          return {} as AuthTokens;
        },
      };

      // 타입 체크를 위한 호출
      expect(authClient.register).toBeDefined();
    });

    it("AuthApiClient의 login 메서드가 올바른 매개변수와 반환 타입을 가져야 한다", () => {
      const authClient: AuthApiClient = {
        register: async (): Promise<AuthResponse> => {
          return {} as AuthResponse;
        },
        login: async (_data: LoginRequest): Promise<AuthResponse> => {
          // data는 LoginRequest 타입이어야 함
          expect(_data).toBeDefined();
          return {
            user: {} as User,
            accessToken: "dummy-access-token",
            refreshToken: "dummy-refresh-token",
          };
        },
        logout: async (): Promise<void> => {
          // 로그아웃 로직
        },
        refreshToken: async (): Promise<AuthTokens> => {
          return {} as AuthTokens;
        },
      };

      expect(authClient.login).toBeDefined();
    });

    it("UserApiClient의 updateMe 메서드가 올바른 매개변수와 반환 타입을 가져야 한다", () => {
      const userClient: UserApiClient = {
        getMe: async (): Promise<User> => {
          return {} as User;
        },
        updateMe: async (_data: UpdateUserRequest): Promise<User> => {
          // data는 UpdateUserRequest 타입이어야 함
          expect(_data).toBeDefined();
          return {} as User;
        },
      };

      expect(userClient.updateMe).toBeDefined();
    });
  });

  describe("Promise 반환 타입", () => {
    it("모든 비동기 메서드가 Promise를 반환해야 한다", () => {
      const authClient: AuthApiClient = {
        register: async (): Promise<AuthResponse> => {
          return Promise.resolve({
            user: {} as User,
            accessToken: "dummy-access-token",
            refreshToken: "dummy-refresh-token",
          });
        },
        login: async (): Promise<AuthResponse> => {
          return Promise.resolve({
            user: {} as User,
            accessToken: "dummy-access-token",
            refreshToken: "dummy-refresh-token",
          });
        },
        logout: async (): Promise<void> => {
          return Promise.resolve();
        },
        refreshToken: async (): Promise<AuthTokens> => {
          return Promise.resolve({} as AuthTokens);
        },
      };

      const userClient: UserApiClient = {
        getMe: async (): Promise<User> => {
          return Promise.resolve({} as User);
        },
        updateMe: async (): Promise<User> => {
          return Promise.resolve({} as User);
        },
      };

      expect(authClient.register).toBeDefined();
      expect(userClient.getMe).toBeDefined();
    });
  });
});
