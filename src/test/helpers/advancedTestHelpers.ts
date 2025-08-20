import {
  renderHook,
  act,
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { expect, vi } from "vitest";
import type { ReactElement } from "react";

/**
 * 고급 테스트 헬퍼 함수들
 * 복잡한 테스트 시나리오를 더 쉽게 작성할 수 있도록 도와줍니다.
 */

// 컴포넌트 렌더링 및 상호작용 헬퍼
export class ComponentTestHelper {
  private element: HTMLElement;

  constructor(ui: ReactElement, options?: any) {
    const result = render(ui, options);
    this.element = result.container;
  }

  // 요소 찾기
  findByTestId(testId: string) {
    return screen.getByTestId(testId);
  }

  findByText(text: string) {
    return screen.getByText(text);
  }

  findByRole(role: string, options?: any) {
    return screen.getByRole(role, options);
  }

  // 이벤트 발생
  click(testId: string) {
    fireEvent.click(this.findByTestId(testId));
    return this;
  }

  type(testId: string, value: string) {
    fireEvent.change(this.findByTestId(testId), { target: { value } });
    return this;
  }

  submit(testId: string) {
    fireEvent.submit(this.findByTestId(testId));
    return this;
  }

  // 체이닝을 위한 헬퍼
  then(callback: () => void) {
    callback();
    return this;
  }

  // 비동기 작업 대기
  async waitForElement(testId: string) {
    await waitFor(() => {
      expect(this.findByTestId(testId)).toBeInTheDocument();
    });
    return this;
  }

  // 스냅샷 테스트
  toMatchSnapshot() {
    expect(this.element).toMatchSnapshot();
    return this;
  }
}

// 폼 테스트 전용 헬퍼
export class FormTestHelper {
  private result: any;

  constructor(hookFn: () => any) {
    const { result } = renderHook(hookFn);
    this.result = result;
  }

  // 폼 필드 설정
  setField(fieldName: string, value: string) {
    act(() => {
      this.result.current.setFieldValue(fieldName, value);
    });
    return this;
  }

  // 여러 필드 설정
  setFields(fields: Record<string, string>) {
    act(() => {
      Object.entries(fields).forEach(([field, value]) => {
        this.result.current.setFieldValue(field, value);
      });
    });
    return this;
  }

  // 폼 검증
  validate() {
    act(() => {
      this.result.current.validate();
    });
    return this;
  }

  // 제출
  submit() {
    act(() => {
      this.result.current.handleSubmit();
    });
    return this;
  }

  // 에러 확인
  expectError(fieldName: string, expectedError: string) {
    expect(this.result.current.errors[fieldName]).toBe(expectedError);
    return this;
  }

  // 에러 없음 확인
  expectNoError(fieldName: string) {
    expect(this.result.current.errors[fieldName]).toBeUndefined();
    return this;
  }

  // 값 확인
  expectValue(fieldName: string, expectedValue: string) {
    expect(this.result.current.values[fieldName]).toBe(expectedValue);
    return this;
  }

  // 상태 확인
  expectState(expectedState: Partial<any>) {
    Object.entries(expectedState).forEach(([key, value]) => {
      expect(this.result.current[key]).toEqual(value);
    });
    return this;
  }
}

// API 모킹 헬퍼
export class ApiMockHelper {
  private mocks: Map<string, any> = new Map();

  // API 응답 모킹
  mockApiResponse(endpoint: string, response: any, status: number = 200) {
    const mockResponse = {
      ok: status >= 200 && status < 300,
      status,
      json: async () => response,
      text: async () => JSON.stringify(response),
    };

    this.mocks.set(endpoint, mockResponse);
    return this;
  }

  // API 에러 모킹
  mockApiError(endpoint: string, error: string, status: number = 500) {
    const mockResponse = {
      ok: false,
      status,
      json: async () => ({ error }),
      text: async () => JSON.stringify({ error }),
    };

    this.mocks.set(endpoint, mockResponse);
    return this;
  }

  // fetch 모킹 설정
  setupFetchMock() {
    global.fetch = vi.fn((url: string) => {
      const endpoint = url.toString();
      const mock = this.mocks.get(endpoint);

      if (mock) {
        return Promise.resolve(mock as Response);
      }

      // 기본 응답
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: null }),
      } as Response);
    });

    return this;
  }

  // 모킹 정리
  cleanup() {
    this.mocks.clear();
    vi.restoreAllMocks();
    return this;
  }
}

// 비동기 테스트 헬퍼
export class AsyncTestHelper {
  private result: any;

  constructor(hookFn: () => any) {
    const { result } = renderHook(hookFn);
    this.result = result;
  }

  // 비동기 액션 실행
  async executeAction(action: (result: any) => Promise<void>) {
    await act(async () => {
      await action(this.result);
    });
    return this;
  }

  // 상태 변경 대기
  async waitForStateChange(
    expectedState: Partial<any>,
    timeout: number = 1000
  ) {
    await waitFor(
      () => {
        Object.entries(expectedState).forEach(([key, value]) => {
          expect(this.result.current[key]).toEqual(value);
        });
      },
      { timeout }
    );
    return this;
  }

  // 로딩 상태 확인
  expectLoading(expectedLoading: boolean) {
    expect(this.result.current.isLoading).toBe(expectedLoading);
    return this;
  }

  // 에러 상태 확인
  expectError(expectedError: string | null) {
    expect(this.result.current.error).toBe(expectedError);
    return this;
  }
}

// 테스트 데이터 빌더
export class TestDataBuilder<T> {
  private data: Partial<T>;

  constructor(initialData: Partial<T> = {}) {
    this.data = { ...initialData };
  }

  // 필드 설정
  with<K extends keyof T>(field: K, value: T[K]): TestDataBuilder<T> {
    this.data[field] = value;
    return this;
  }

  // 여러 필드 설정
  withFields(fields: Partial<T>): TestDataBuilder<T> {
    this.data = { ...this.data, ...fields };
    return this;
  }

  // 빌드
  build(): T {
    return this.data as T;
  }

  // 배열로 빌드
  buildArray(count: number): T[] {
    return Array.from({ length: count }, () => this.build());
  }
}

// 테스트 설정 헬퍼
export const createTestEnvironment = (
  config: {
    enableLogging?: boolean;
    mockApi?: boolean;
    testTimeout?: number;
  } = {}
) => {
  const { enableLogging = false, mockApi = true, testTimeout = 5000 } = config;

  // 로깅 설정
  if (!enableLogging) {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  }

  // API 모킹 설정
  if (mockApi) {
    global.fetch = vi.fn();
  }

  // 테스트 타임아웃 설정
  vi.setConfig({ testTimeout });

  return {
    cleanup: () => {
      vi.restoreAllMocks();
      vi.clearAllMocks();
    },
  };
};

// 유틸리티 함수들
export const waitForElementToBeRemoved = async (element: HTMLElement) => {
  await waitFor(() => {
    expect(element).not.toBeInTheDocument();
  });
};

export const createMockEvent = (overrides: Partial<Event> = {}) => {
  const event = new Event("click");
  Object.assign(event, overrides);
  return event;
};

export const createMockMouseEvent = (overrides: Partial<MouseEvent> = {}) => {
  const event = new MouseEvent("click");
  Object.assign(event, overrides);
  return event;
};

export const createMockKeyboardEvent = (
  overrides: Partial<KeyboardEvent> = {}
) => {
  const event = new KeyboardEvent("keydown");
  Object.assign(event, overrides);
  return event;
};
