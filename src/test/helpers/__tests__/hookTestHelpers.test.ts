import { describe, it, expect, vi } from "vitest";
import { useState } from "react";

import {
  expectInitialState,
  expectStateChange,
  expectAsyncAction,
  createValidationTests,
  createPasswordStrengthTests,
} from "../hookTestHelpers";
import type {
  ValidationTestCase,
  PasswordStrengthTestCase,
} from "../hookTestHelpers";

// 테스트용 간단한 hook들
const useSimpleCounter = () => {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState("hello");
  const [isLoading, setIsLoading] = useState(false);

  return {
    count,
    message,
    isLoading,
    increment: () => setCount((c) => c + 1),
    setMessage,
    setIsLoading,
  };
};

const useAsyncCounter = () => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  return {
    count,
    loading,
    asyncIncrement: async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 10));
      setCount((c) => c + 1);
      setLoading(false);
    },
  };
};

const useFormWithValidation = () => {
  const [values, setValues] = useState({ name: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  return {
    values,
    errors,
    setField: (field: string, value: string) => {
      setValues((prev) => ({ ...prev, [field]: value }));
    },
    validate: () => {
      const newErrors: Record<string, string> = {};
      if (!values.name.trim()) {
        newErrors.name = "필수 입력 항목입니다";
      }
      setErrors(newErrors);
    },
  };
};

describe("hookTestHelpers", () => {
  describe("expectInitialState", () => {
    it("hook의 초기 상태를 올바르게 검증해야 한다", () => {
      const result = expectInitialState(useSimpleCounter, {
        count: 0,
        message: "hello",
        isLoading: false,
      });

      expect(result.current.count).toBe(0);
      expect(result.current.message).toBe("hello");
      expect(result.current.isLoading).toBe(false);
    });

    it("부분적인 상태만 검증할 수 있어야 한다", () => {
      const result = expectInitialState(useSimpleCounter, {
        count: 0,
      });

      expect(result.current.count).toBe(0);
      // 다른 속성들은 검증하지 않음
    });

    it("빈 객체로 호출해도 에러가 발생하지 않아야 한다", () => {
      expect(() => {
        expectInitialState(useSimpleCounter, {});
      }).not.toThrow();
    });
  });

  describe("expectStateChange", () => {
    it("상태 변경을 올바르게 검증해야 한다", () => {
      expectStateChange(
        useSimpleCounter,
        (hookResult) => {
          hookResult.increment();
        },
        { count: 1 }
      );
    });

    it("여러 속성의 변경을 동시에 검증할 수 있어야 한다", () => {
      expectStateChange(
        useSimpleCounter,
        (hookResult) => {
          hookResult.increment();
          hookResult.setMessage("updated");
        },
        { count: 1, message: "updated" }
      );
    });
  });

  describe("expectAsyncAction", () => {
    it("비동기 액션을 올바르게 처리해야 한다", async () => {
      await expectAsyncAction(
        useAsyncCounter,
        async (hookResult) => {
          await hookResult.asyncIncrement();
        },
        { count: 1, loading: false }
      );
    });

    it("expectedChanges 없이도 동작해야 한다", async () => {
      const result = await expectAsyncAction(
        useAsyncCounter,
        async (hookResult) => {
          await hookResult.asyncIncrement();
        }
      );

      expect(result.current.count).toBe(1);
    });

    it("동기 액션도 처리할 수 있어야 한다", async () => {
      await expectAsyncAction(
        useSimpleCounter,
        (hookResult) => {
          hookResult.increment();
        },
        { count: 1 }
      );
    });
  });

  describe("createValidationTests", () => {
    it("검증 테스트 케이스를 올바르게 생성해야 한다", () => {
      const testCases: ValidationTestCase[] = [
        {
          name: "빈 값일 때 에러",
          input: "",
          expectedError: "필수 입력 항목입니다",
        },
        {
          name: "유효한 값일 때 성공",
          input: "valid-input",
          shouldBeValid: true,
        },
      ];

      const tests = createValidationTests(
        testCases,
        useFormWithValidation,
        "name",
        (result, value) => {
          result.setField("name", value);
        },
        (result) => {
          result.validate();
        }
      );

      expect(tests).toHaveLength(2);
      expect(tests[0].name).toBe("빈 값일 때 에러");
      expect(tests[1].name).toBe("유효한 값일 때 성공");

      // 테스트 함수들이 존재하는지 확인
      expect(typeof tests[0].test).toBe("function");
      expect(typeof tests[1].test).toBe("function");

      // 테스트 함수 구조 확인
      expect(tests[0]).toHaveProperty("test");
      expect(tests[1]).toHaveProperty("test");
    });

    it("빈 테스트 케이스 배열도 처리해야 한다", () => {
      const tests = createValidationTests(
        [],
        useFormWithValidation,
        "name",
        vi.fn(),
        vi.fn()
      );

      expect(tests).toHaveLength(0);
    });
  });

  describe("createPasswordStrengthTests", () => {
    it("비밀번호 강도 테스트 케이스를 올바르게 생성해야 한다", () => {
      const testCases: PasswordStrengthTestCase[] = [
        {
          name: "약한 비밀번호",
          password: "123",
          expectedStrength: 1,
          expectedLabel: "약함",
          expectedColor: "red",
        },
        {
          name: "강한 비밀번호",
          password: "StrongPassword123!",
          expectedStrength: 4,
          expectedLabel: "매우 강함",
          expectedColor: "green",
        },
      ];

      const tests = createPasswordStrengthTests(testCases);

      expect(tests).toHaveLength(2);
      expect(tests[0].name).toBe("약한 비밀번호");
      expect(tests[1].name).toBe("강한 비밀번호");

      // 테스트 함수들이 존재하는지 확인
      expect(typeof tests[0].test).toBe("function");
      expect(typeof tests[1].test).toBe("function");

      // 테스트 함수 구조 확인
      expect(tests[0]).toHaveProperty("test");
      expect(tests[1]).toHaveProperty("test");
    });

    it("빈 테스트 케이스 배열도 처리해야 한다", () => {
      const tests = createPasswordStrengthTests([]);
      expect(tests).toHaveLength(0);
    });
  });
});
