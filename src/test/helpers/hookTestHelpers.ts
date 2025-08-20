import { renderHook, act } from "@testing-library/react";
import { expect } from "vitest";
import {
  createUserIdValidationCases,
  createPasswordValidationCases,
  createNicknameValidationCases,
  createPasswordStrengthCases,
} from "../factories";

/**
 * 공통 hook 테스트 헬퍼 함수들
 * 테스트 데이터 팩토리를 활용하여 유지보수성을 높였습니다.
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

export function createValidationTests<T>(
  testCases: ValidationTestCase[],
  hookFn: () => T,
  fieldName: string,
  setFieldAction: (result: { current: T }, value: string) => void,
  validateAction: (result: { current: T }) => void
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
      test: <T>(hookFn: (password: string) => T) => {
        const { result } = renderHook(() => hookFn(password));

        expect(result.current.strength).toBe(expectedStrength);
        expect(result.current.label).toBe(expectedLabel);
        expect(result.current.color).toBe(expectedColor);
      },
    })
  );
}

// 팩토리 기반 테스트 케이스 생성 헬퍼들
export const userIdValidationTests = createUserIdValidationCases();
export const passwordValidationTests = createPasswordValidationCases();
export const nicknameValidationTests = createNicknameValidationCases();
export const passwordStrengthTests = createPasswordStrengthCases();

/**
 * 폼 검증 테스트를 위한 통합 헬퍼
 */
export function createFormValidationTests<T>(
  hookFn: () => T,
  fieldConfigs: Array<{
    fieldName: string;
    testCases: ValidationTestCase[];
    setFieldAction: (result: { current: T }, value: string) => void;
    validateAction: (result: { current: T }) => void;
  }>
) {
  return fieldConfigs.map(
    ({ fieldName, testCases, setFieldAction, validateAction }) => ({
      fieldName,
      tests: createValidationTests(
        testCases,
        hookFn,
        fieldName,
        setFieldAction,
        validateAction
      ),
    })
  );
}

/**
 * 훅의 모든 필드에 대한 검증 테스트를 생성하는 헬퍼
 */
export function createCompleteFormTests<T>(
  hookFn: () => T,
  setFieldAction: (result: T, field: string, value: string) => void,
  validateAction: (result: T) => void
) {
  const fieldConfigs = [
    {
      fieldName: "userId",
      testCases: userIdValidationTests,
      setFieldAction: (result: { current: T }, value: string) =>
        setFieldAction(result.current, "userId", value),
      validateAction,
    },
    {
      fieldName: "password",
      testCases: passwordValidationTests,
      setFieldAction: (result: { current: T }, value: string) =>
        setFieldAction(result.current, "password", value),
      validateAction,
    },
    {
      fieldName: "nickname",
      testCases: nicknameValidationTests,
      setFieldAction: (result: { current: T }, value: string) =>
        setFieldAction(result.current, "nickname", value),
      validateAction,
    },
  ];

  return createFormValidationTests(hookFn, fieldConfigs);
}

/**
 * 훅의 상태 변화를 단계별로 테스트하는 헬퍼
 */
export function createStateTransitionTests<T>(
  hookFn: () => T,
  transitions: Array<{
    name: string;
    action: (result: { current: T }) => void;
    expectedState: Partial<T>;
  }>
) {
  return transitions.map(({ name, action, expectedState }) => ({
    name,
    test: () => {
      const { result } = renderHook(hookFn);

      act(() => {
        action(result.current);
      });

      Object.entries(expectedState).forEach(([key, value]) => {
        expect(result.current[key as keyof T]).toEqual(value);
      });
    },
  }));
}

/**
 * 훅의 에러 상태를 테스트하는 헬퍼
 */
export function createErrorStateTests<T>(
  hookFn: () => T,
  errorScenarios: Array<{
    name: string;
    setup: (result: { current: T }) => void;
    expectedError: string | null;
    expectedErrorField?: string;
  }>
) {
  return errorScenarios.map(
    ({ name, setup, expectedError, expectedErrorField }) => ({
      name,
      test: () => {
        const { result } = renderHook(hookFn);

        act(() => {
          setup(result.current);
        });

        if (expectedErrorField) {
          expect(result.current.errors[expectedErrorField]).toBe(expectedError);
        } else {
          expect(result.current.error).toBe(expectedError);
        }
      },
    })
  );
}
