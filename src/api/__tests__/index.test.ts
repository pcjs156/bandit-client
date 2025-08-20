import { describe, it, expect } from "vitest";
import { apiClient, localStorageApiClient } from "../index";
import type { ApiClient, AuthApiClient, UserApiClient } from "../types";

describe("API Index", () => {
  describe("apiClient", () => {
    it("apiClient가 정의되어야 한다", () => {
      expect(apiClient).toBeDefined();
    });

    it("apiClient는 ApiClient 타입을 가져야 한다", () => {
      expect(apiClient).toHaveProperty("auth");
      expect(apiClient).toHaveProperty("user");
    });

    it("apiClient.auth는 AuthApiClient 인터페이스를 구현해야 한다", () => {
      const authClient = apiClient.auth;
      expect(typeof authClient.register).toBe("function");
      expect(typeof authClient.login).toBe("function");
      expect(typeof authClient.logout).toBe("function");
      expect(typeof authClient.refreshToken).toBe("function");
    });

    it("apiClient.user는 UserApiClient 인터페이스를 구현해야 한다", () => {
      const userClient = apiClient.user;
      expect(typeof userClient.getMe).toBe("function");
      expect(typeof userClient.updateMe).toBe("function");
    });
  });

  describe("localStorageApiClient", () => {
    it("localStorageApiClient가 정의되어야 한다", () => {
      expect(localStorageApiClient).toBeDefined();
    });

    it("localStorageApiClient는 apiClient와 동일해야 한다", () => {
      expect(apiClient).toBe(localStorageApiClient);
    });

    it("localStorageApiClient.auth가 정의되어야 한다", () => {
      expect(localStorageApiClient.auth).toBeDefined();
    });

    it("localStorageApiClient.user가 정의되어야 한다", () => {
      expect(localStorageApiClient.user).toBeDefined();
    });
  });

  describe("타입 내보내기", () => {
    it("ApiClient 타입이 내보내져야 한다", () => {
      // 타입 체크를 위한 더미 객체
      const dummyApiClient: ApiClient = {
        auth: {} as AuthApiClient,
        user: {} as UserApiClient,
      };

      expect(dummyApiClient).toBeDefined();
      expect(dummyApiClient.auth).toBeDefined();
      expect(dummyApiClient.user).toBeDefined();
    });

    it("AuthApiClient 타입이 내보내져야 한다", () => {
      // 타입 체크를 위한 더미 객체
      const dummyAuthClient: AuthApiClient = {
        register: async () => ({ user: {} as any, tokens: {} as any }),
        login: async () => ({ user: {} as any, tokens: {} as any }),
        logout: async () => {},
        refreshToken: async () => ({} as any),
      };

      expect(dummyAuthClient).toBeDefined();
      expect(typeof dummyAuthClient.register).toBe("function");
      expect(typeof dummyAuthClient.login).toBe("function");
      expect(typeof dummyAuthClient.logout).toBe("function");
      expect(typeof dummyAuthClient.refreshToken).toBe("function");
    });

    it("UserApiClient 타입이 내보내져야 한다", () => {
      // 타입 체크를 위한 더미 객체
      const dummyUserClient: UserApiClient = {
        getMe: async () => ({} as any),
        updateMe: async () => ({} as any),
      };

      expect(dummyUserClient).toBeDefined();
      expect(typeof dummyUserClient.getMe).toBe("function");
      expect(typeof dummyUserClient.updateMe).toBe("function");
    });
  });

  describe("구현체 교체 가능성", () => {
    it("환경에 따라 다른 구현체를 사용할 수 있어야 한다", () => {
      // 현재는 localStorage 기반이지만, 나중에 HTTP API로 교체 가능
      expect(apiClient).toBe(localStorageApiClient);

      // 만약 HTTP API로 교체한다면:
      // export const apiClient: ApiClient = httpApiClient;
      // 이렇게 변경할 수 있어야 함
    });
  });
});
