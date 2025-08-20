import { vi, beforeEach, afterEach } from "vitest";
import type { User, StoredUser } from "@src/types/user";
import type { RegisterRequest, LoginRequest } from "@src/types/api";

// 공통 Mock 인터페이스들
export interface MockUserStore {
  currentUser: User | null;
  findUserById: ReturnType<typeof vi.fn>;
  updateUser: ReturnType<typeof vi.fn>;
  createUser: ReturnType<typeof vi.fn>;
  setCurrentUser: ReturnType<typeof vi.fn>;
}

export interface MockTokenStorage {
  clearTokens: ReturnType<typeof vi.fn>;
  setTokens: ReturnType<typeof vi.fn>;
  getTokens: ReturnType<typeof vi.fn>;
}

export interface MockAuthValidation {
  validateRegisterInput: ReturnType<typeof vi.fn>;
  validateUpdateUserInput: ReturnType<typeof vi.fn>;
}

// 공통 테스트 데이터 팩토리
export class TestDataFactory {
  static createUser(overrides: Partial<User> = {}): User {
    return {
      id: "user-123",
      userId: "testuser",
      nickname: "테스트유저",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...overrides,
    };
  }

  static createStoredUser(overrides: Partial<StoredUser> = {}): StoredUser {
    return {
      ...this.createUser(overrides),
      passwordHash: "hashedPassword123",
    };
  }

  static createRegisterRequest(
    overrides: Partial<RegisterRequest> = {}
  ): RegisterRequest {
    return {
      userId: "testuser",
      password: "password123",
      nickname: "테스트유저",
      ...overrides,
    };
  }

  static createLoginRequest(
    overrides: Partial<LoginRequest> = {}
  ): LoginRequest {
    return {
      userId: "testuser",
      password: "password123",
      ...overrides,
    };
  }

  static createTokens(
    overrides: { accessToken?: string; refreshToken?: string } = {}
  ) {
    return {
      accessToken: "access-token-123",
      refreshToken: "refresh-token-123",
      ...overrides,
    };
  }
}

// localStorage 모킹 헬퍼
export class LocalStorageMockHelper {
  private mockLocalStorage: {
    setItem: ReturnType<typeof vi.fn>;
    getItem: ReturnType<typeof vi.fn>;
    removeItem: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
  };

  constructor() {
    this.mockLocalStorage = {
      setItem: vi.fn(),
      getItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
  }

  setup() {
    Object.defineProperty(global, "localStorage", {
      value: this.mockLocalStorage,
      writable: true,
    });
    return this.mockLocalStorage;
  }

  getMock() {
    return this.mockLocalStorage;
  }

  reset() {
    vi.clearAllMocks();
  }
}

// Mock 설정 헬퍼
export class MockSetupHelper {
  static setupUserStoreMock(): MockUserStore {
    return {
      currentUser: null,
      findUserById: vi.fn(),
      updateUser: vi.fn(),
      createUser: vi.fn(),
      setCurrentUser: vi.fn(),
    };
  }

  static setupTokenStorageMock(): MockTokenStorage {
    return {
      clearTokens: vi.fn(),
      setTokens: vi.fn(),
      getTokens: vi.fn(),
    };
  }

  static setupAuthValidationMock(): MockAuthValidation {
    return {
      validateRegisterInput: vi.fn().mockReturnValue(null),
      validateUpdateUserInput: vi.fn().mockReturnValue(null),
    };
  }
}

// 공통 테스트 설정
export const setupCommonTestEnvironment = () => {
  const localStorageMock = new LocalStorageMockHelper();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.setup();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorageMock.reset();
  });

  return {
    localStorageMock,
  };
};

// 에러 테스트 헬퍼
export class ErrorTestHelper {
  static expectApiError(
    error: unknown,
    expectedCode: string,
    expectedMessage?: string
  ) {
    if (expectedMessage) {
      expect(error).toMatchObject({
        detailCode: expectedCode,
        message: expectedMessage,
      });
    } else {
      expect(error).toMatchObject({
        detailCode: expectedCode,
      });
    }
  }

  static expectValidationError(error: unknown, expectedMessage: string) {
    expect(error).toThrow(expectedMessage);
  }
}

// 컴포넌트 테스트 헬퍼
export class ComponentTestHelper {
  static createTestWrapper(children: React.ReactNode) {
    // MantineProvider 등 필요한 프로바이더들을 여기서 설정
    return children;
  }
}
