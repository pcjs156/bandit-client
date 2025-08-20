import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TokenStorage } from "../tokenStorage";

// Mock localStorage
const mockLocalStorage = {
  setItem: vi.fn(),
  getItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

describe("TokenStorage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock localStorage
    Object.defineProperty(global, "localStorage", {
      value: mockLocalStorage,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("setTokens", () => {
    it("액세스 토큰과 리프레시 토큰을 localStorage에 저장해야 한다", () => {
      const accessToken = "access-token-123";
      const refreshToken = "refresh-token-123";

      TokenStorage.setTokens(accessToken, refreshToken);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "bandit_access_token",
        accessToken
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "bandit_refresh_token",
        refreshToken
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(2);
    });

    it("빈 문자열 토큰도 저장할 수 있어야 한다", () => {
      TokenStorage.setTokens("", "");

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "bandit_access_token",
        ""
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "bandit_refresh_token",
        ""
      );
    });
  });

  describe("getTokens", () => {
    it("저장된 토큰들을 올바르게 조회해야 한다", () => {
      const mockAccessToken = "access-token-123";
      const mockRefreshToken = "refresh-token-123";

      mockLocalStorage.getItem
        .mockReturnValueOnce(mockAccessToken)
        .mockReturnValueOnce(mockRefreshToken);

      const result = TokenStorage.getTokens();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
        "bandit_access_token"
      );
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
        "bandit_refresh_token"
      );
      expect(result).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      });
    });

    it("토큰이 없는 경우 null을 반환해야 한다", () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = TokenStorage.getTokens();

      expect(result).toEqual({
        accessToken: null,
        refreshToken: null,
      });
    });

    it("일부 토큰만 있는 경우 해당 값과 null을 반환해야 한다", () => {
      mockLocalStorage.getItem
        .mockReturnValueOnce("access-token-123")
        .mockReturnValueOnce(null);

      const result = TokenStorage.getTokens();

      expect(result).toEqual({
        accessToken: "access-token-123",
        refreshToken: null,
      });
    });
  });

  describe("clearTokens", () => {
    it("저장된 모든 토큰을 삭제해야 한다", () => {
      TokenStorage.clearTokens();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        "bandit_access_token"
      );
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        "bandit_refresh_token"
      );
      expect(mockLocalStorage.removeItem).toHaveBeenCalledTimes(2);
    });
  });

  describe("generateTokens", () => {
    it("사용자 ID를 기반으로 유효한 토큰을 생성해야 한다", () => {
      const userId = "testuser123";
      const now = Date.now();

      vi.spyOn(Date, "now").mockReturnValue(now);

      const result = TokenStorage.generateTokens(userId);

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(typeof result.accessToken).toBe("string");
      expect(typeof result.refreshToken).toBe("string");
      expect(result.accessToken).not.toBe("");
      expect(result.refreshToken).not.toBe("");
    });

    it("생성된 토큰은 base64로 인코딩되어야 한다", () => {
      const userId = "testuser123";
      const result = TokenStorage.generateTokens(userId);

      // base64 문자열인지 확인 (알파벳, 숫자, +, /, = 만 포함)
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      expect(result.accessToken).toMatch(base64Regex);
      expect(result.refreshToken).toMatch(base64Regex);
    });

    it("생성된 토큰은 올바른 페이로드를 가져야 한다", () => {
      const userId = "testuser123";
      const now = Date.now();

      vi.spyOn(Date, "now").mockReturnValue(now);

      const result = TokenStorage.generateTokens(userId);

      // 액세스 토큰 페이로드 확인
      const accessPayload = JSON.parse(atob(result.accessToken));
      expect(accessPayload.userId).toBe(userId);
      expect(accessPayload.type).toBe("access");
      expect(accessPayload.exp).toBe(now + 15 * 60 * 1000); // 15분

      // 리프레시 토큰 페이로드 확인
      const refreshPayload = JSON.parse(atob(result.refreshToken));
      expect(refreshPayload.userId).toBe(userId);
      expect(refreshPayload.type).toBe("refresh");
      expect(refreshPayload.exp).toBe(now + 7 * 24 * 60 * 60 * 1000); // 7일
    });

    it("다른 사용자 ID로 생성된 토큰은 서로 달라야 한다", () => {
      const userId1 = "user1";
      const userId2 = "user2";

      const tokens1 = TokenStorage.generateTokens(userId1);
      const tokens2 = TokenStorage.generateTokens(userId2);

      expect(tokens1.accessToken).not.toBe(tokens2.accessToken);
      expect(tokens1.refreshToken).not.toBe(tokens2.refreshToken);
    });
  });

  describe("parseToken", () => {
    it("유효한 토큰을 올바르게 파싱해야 한다", () => {
      const userId = "testuser123";
      const exp = Date.now() + 1000; // 1초 후 만료
      const type = "access";
      const payload = { userId, exp, type };
      const token = btoa(JSON.stringify(payload));

      const result = TokenStorage.parseToken(token);

      expect(result).toEqual({ userId, exp, type });
    });

    it("만료된 토큰은 null을 반환해야 한다", () => {
      const userId = "testuser123";
      const exp = Date.now() - 1000; // 1초 전에 만료
      const type = "access";
      const payload = { userId, exp, type };
      const token = btoa(JSON.stringify(payload));

      const result = TokenStorage.parseToken(token);

      expect(result).toBeNull();
    });

    it("잘못된 형식의 토큰은 null을 반환해야 한다", () => {
      const invalidToken = "invalid-token-format";

      const result = TokenStorage.parseToken(invalidToken);

      expect(result).toBeNull();
    });

    it("빈 문자열 토큰은 null을 반환해야 한다", () => {
      const result = TokenStorage.parseToken("");

      expect(result).toBeNull();
    });

    it("base64가 아닌 문자열은 null을 반환해야 한다", () => {
      const nonBase64Token = "not-base64-token!@#";

      const result = TokenStorage.parseToken(nonBase64Token);

      expect(result).toBeNull();
    });

    it("JSON 파싱에 실패한 토큰은 null을 반환해야 한다", () => {
      const invalidJsonToken = btoa("invalid json");

      const result = TokenStorage.parseToken(invalidJsonToken);

      expect(result).toBeNull();
    });
  });

  describe("정적 상수", () => {
    it("ACCESS_TOKEN_KEY가 올바른 값을 가져야 한다", () => {
      expect(TokenStorage.ACCESS_TOKEN_KEY).toBe("bandit_access_token");
    });

    it("REFRESH_TOKEN_KEY가 올바른 값을 가져야 한다", () => {
      expect(TokenStorage.REFRESH_TOKEN_KEY).toBe("bandit_refresh_token");
    });
  });
});
