import "@testing-library/jest-dom";
import { beforeEach, afterEach, vi, beforeAll, afterAll } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";

// 전역 테스트 설정
beforeAll(() => {
  // 테스트 환경 설정
  vi.setConfig({
    testTimeout: 10000,
    hookTimeout: 10000,
  });

  // JSDOM 환경 설정
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // ResizeObserver 모킹
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // IntersectionObserver 모킹
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // 스크롤 관련 속성 모킹
  Object.defineProperty(window, "scrollTo", {
    value: vi.fn(),
    writable: true,
  });

  // URL 관련 모킹
  Object.defineProperty(window, "URL", {
    value: {
      createObjectURL: vi.fn(() => "mock-url"),
      revokeObjectURL: vi.fn(),
    },
    writable: true,
  });

  // 로컬 스토리지 모킹
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  };
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
    writable: true,
  });

  // 세션 스토리지 모킹
  const sessionStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  };
  Object.defineProperty(window, "sessionStorage", {
    value: sessionStorageMock,
    writable: true,
  });

  // Mantine 관련 전역 설정
  global.matchMedia = window.matchMedia;

  // CSS 관련 모킹
  Object.defineProperty(window, "getComputedStyle", {
    value: () => ({
      getPropertyValue: vi.fn(),
    }),
    writable: true,
  });

  // Element 관련 메서드 모킹
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.scrollTo = vi.fn();
});

beforeEach(() => {
  // 각 테스트 전에 모킹된 함수들 초기화

  // 모킹된 함수들 초기화
  vi.clearAllMocks();

  // 콘솔 에러/경고 숨기기 (필요시)
  // vi.spyOn(console, 'error').mockImplementation(() => {});
  // vi.spyOn(console, 'warn').mockImplementation(() => {});

  // fetch 모킹 기본 설정
  global.fetch = vi.fn();

  // matchMedia 모킹 재설정 (각 테스트마다)
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

afterEach(() => {
  // 각 테스트 후 정리
  cleanup();

  // 모킹 복원
  vi.restoreAllMocks();
});

afterAll(() => {
  // 모든 테스트 완료 후 정리
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

// 전역 테스트 유틸리티
export const testUtils = {
  // 테스트 데이터 생성 헬퍼
  createTestUser: (overrides = {}) => ({
    userId: "testuser123",
    password: "password123",
    nickname: "테스트유저",
    ...overrides,
  }),

  // API 응답 모킹 헬퍼
  mockApiResponse: (data: unknown, success = true) => ({
    success,
    data,
    timestamp: new Date().toISOString(),
  }),

  // 에러 응답 모킹 헬퍼
  mockApiError: (message: string, code?: string) => ({
    success: false,
    error: {
      message,
      code,
      timestamp: new Date().toISOString(),
    },
  }),

  // 비동기 작업 대기 헬퍼
  wait: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),

  // 테스트 환경 설정
  setupTestEnvironment: (
    config: {
      enableLogging?: boolean;
      mockApi?: boolean;
    } = {}
  ) => {
    const { enableLogging = false, mockApi = true } = config;

    if (!enableLogging) {
      vi.spyOn(console, "log").mockImplementation(() => {});
      vi.spyOn(console, "warn").mockImplementation(() => {});
      vi.spyOn(console, "error").mockImplementation(() => {});
    }

    if (mockApi) {
      global.fetch = vi.fn();
    }

    return {
      cleanup: () => {
        vi.restoreAllMocks();
        vi.clearAllMocks();
      },
    };
  },
};

// 전역 타입 선언
declare module "vitest" {
  interface JestAssertion<T> {
    toBeInTheDocument(): T;
    toHaveClass(className: string): T;
    toHaveAttribute(attr: string, value?: string): T;
    toHaveTextContent(text: string | RegExp): T;
    toHaveValue(value: string | string[] | number): T;
    toBeChecked(): T;
    toBeDisabled(): T;
    toBeEmpty(): T;
    toBeEmptyDOMElement(): T;
    toBeEnabled(): T;
    toBeInvalid(): T;
    toBeRequired(): T;
    toBeValid(): T;
    toBeVisible(): T;
    toContainElement(element: HTMLElement | null): T;
    toContainHTML(htmlText: string): T;
    toHaveDisplayValue(value: string | string[]): T;
    toHaveFormValues(expectedValues: Record<string, unknown>): T;
    toHaveStyle(css: string | Record<string, unknown>): T;
    toHaveFocus(): T;
    toBePartiallyChecked(): T;
    toHaveDescription(text: string | RegExp): T;
  }
}
