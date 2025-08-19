import { renderHook, act } from "@testing-library/react";
import { expect } from "vitest";

/**
 * 공통 hook 테스트 헬퍼 함수들
 */

/**
 * hook의 초기 상태를 테스트하는 헬퍼
 */
export function expectInitialState<T>(
  hookFn: () => T,
  expectedState: Partial<T>
) {
  const { result } = renderHook(hookFn);

  Object.entries(expectedState).forEach(([key, value]) => {
    expect(result.current[key as keyof T]).toEqual(value);
  });

  return result;
}

/**
 * hook의 상태 변경을 테스트하는 헬퍼
 */
export function expectStateChange<T>(
  hookFn: () => T,
  action: (hookResult: T) => void,
  expectedChanges: Partial<T>
) {
  const { result } = renderHook(hookFn);

  act(() => {
    action(result.current);
  });

  Object.entries(expectedChanges).forEach(([key, value]) => {
    expect(result.current[key as keyof T]).toEqual(value);
  });

  return result;
}

/**
 * 비동기 hook 액션을 테스트하는 헬퍼
 */
export async function expectAsyncAction<T>(
  hookFn: () => T,
  action: (hookResult: T) => Promise<void> | void,
  expectedChanges?: Partial<T>
) {
  const { result } = renderHook(hookFn);

  await act(async () => {
    await action(result.current);
  });

  if (expectedChanges) {
    Object.entries(expectedChanges).forEach(([key, value]) => {
      expect(result.current[key as keyof T]).toEqual(value);
    });
  }

  return result;
}

/**
 * 폼 필드 검증 테스트 케이스를 생성하는 헬퍼
 */
export interface ValidationTestCase {
  name: string;
  input: string;
  expectedError?: string;
  shouldBeValid?: boolean;
}

export function createValidationTests(
  testCases: ValidationTestCase[],
  hookFn: () => any,
  fieldName: string,
  setFieldAction: (result: any, value: string) => void,
  validateAction: (result: any) => void
) {
  return testCases.map(({ name, input, expectedError, shouldBeValid }) => ({
    name,
    test: () => {
      const { result } = renderHook(hookFn);

      act(() => {
        setFieldAction(result, input);
        validateAction(result);
      });

      if (expectedError) {
        expect(result.current.errors[fieldName]).toBe(expectedError);
      } else if (shouldBeValid) {
        expect(result.current.errors[fieldName]).toBeUndefined();
      }
    },
  }));
}

/**
 * 비밀번호 강도 테스트 케이스
 */
export interface PasswordStrengthTestCase {
  name: string;
  password: string;
  expectedStrength: number;
  expectedLabel: string;
  expectedColor: string;
}

export function createPasswordStrengthTests(
  testCases: PasswordStrengthTestCase[]
) {
  return testCases.map(
    ({ name, password, expectedStrength, expectedLabel, expectedColor }) => ({
      name,
      test: (hookFn: (password: string) => any) => {
        const { result } = renderHook(() => hookFn(password));

        expect(result.current.strength).toBe(expectedStrength);
        expect(result.current.label).toBe(expectedLabel);
        expect(result.current.color).toBe(expectedColor);
      },
    })
  );
}
