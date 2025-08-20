import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRegisterForm } from "../useRegisterForm";
import {
  createCompleteFormTests,
  createStateTransitionTests,
  createErrorStateTests,
  userIdValidationTests,
  passwordValidationTests,
  nicknameValidationTests,
} from "@src/test/helpers/hookTestHelpers";
import { createUser, createInvalidUser } from "@src/test/factories";

describe("useRegisterForm", () => {
  describe("초기값", () => {
    it("올바른 초기값을 가져야 한다", () => {
      const { result } = renderHook(() => useRegisterForm());

      expect(result.current.values).toEqual({
        userId: "",
        password: "",
        nickname: "",
      });
    });

    it("초기 에러는 없어야 한다", () => {
      const { result } = renderHook(() => useRegisterForm());

      expect(result.current.errors).toEqual({});
    });
  });

  describe("폼 필드 검증", () => {
    // 통합된 폼 검증 테스트 사용
    const formTests = createCompleteFormTests(
      useRegisterForm,
      (result, field, value) => result.current.setFieldValue(field, value),
      (result) => result.current.validate()
    );

    formTests.forEach(({ fieldName, tests }) => {
      describe(`${fieldName} 검증`, () => {
        tests.forEach(({ name, test }) => {
          it(name, test);
        });
      });
    });
  });

  describe("전체 폼 검증", () => {
    it("모든 필드가 유효하면 에러가 없어야 한다", () => {
      const { result } = renderHook(() => useRegisterForm());
      const validUser = createUser();

      act(() => {
        result.current.setValues(validUser);
        result.current.validate();
      });

      expect(result.current.errors).toEqual({});
      expect(result.current.isValid()).toBe(true);
    });

    it("하나라도 유효하지 않으면 폼이 유효하지 않아야 한다", () => {
      const { result } = renderHook(() => useRegisterForm());
      const invalidUser = createInvalidUser("userId", "empty");

      act(() => {
        result.current.setValues(invalidUser);
        result.current.validate();
      });

      expect(result.current.errors.userId).toBe("아이디를 입력해주세요");
      expect(result.current.isValid()).toBe(false);
    });
  });

  describe("상태 변화", () => {
    // 상태 변화 테스트 케이스
    const stateTransitions = createStateTransitionTests(useRegisterForm, [
      {
        name: "필드 값 설정 후 상태가 올바르게 변경되어야 한다",
        action: (result) => {
          result.current.setFieldValue("userId", "newuser");
        },
        expectedState: {
          values: {
            userId: "newuser",
            password: "",
            nickname: "",
          },
        },
      },
      {
        name: "여러 필드 값을 한 번에 설정할 수 있어야 한다",
        action: (result) => {
          result.current.setValues({
            userId: "user1",
            password: "pass1",
            nickname: "nick1",
          });
        },
        expectedState: {
          values: {
            userId: "user1",
            password: "pass1",
            nickname: "nick1",
          },
        },
      },
    ]);

    stateTransitions.forEach(({ name, test }) => {
      it(name, test);
    });
  });

  describe("에러 처리", () => {
    // 에러 상태 테스트 케이스
    const errorScenarios = createErrorStateTests(useRegisterForm, [
      {
        name: "빈 userId로 검증 시 에러가 발생해야 한다",
        setup: (result) => {
          result.current.setFieldValue("userId", "");
          result.current.validate();
        },
        expectedError: "아이디를 입력해주세요",
        expectedErrorField: "userId",
      },
      {
        name: "빈 password로 검증 시 에러가 발생해야 한다",
        setup: (result) => {
          result.current.setFieldValue("password", "");
          result.current.validate();
        },
        expectedError: "비밀번호를 입력해주세요",
        expectedErrorField: "password",
      },
      {
        name: "빈 nickname으로 검증 시 에러가 발생해야 한다",
        setup: (result) => {
          result.current.setFieldValue("nickname", "");
          result.current.validate();
        },
        expectedError: "닉네임을 입력해주세요",
        expectedErrorField: "nickname",
      },
    ]);

    errorScenarios.forEach(({ name, test }) => {
      it(name, test);
    });
  });

  describe("폼 리셋", () => {
    it("폼을 리셋하면 초기 상태로 돌아가야 한다", () => {
      const { result } = renderHook(() => useRegisterForm());
      const testUser = createUser();

      // 폼에 값 설정
      act(() => {
        result.current.setValues(testUser);
      });

      // 값이 설정되었는지 확인
      expect(result.current.values).toEqual(testUser);

      // 폼 리셋
      act(() => {
        result.current.reset();
      });

      // 초기 상태로 돌아갔는지 확인
      expect(result.current.values).toEqual({
        userId: "",
        password: "",
        nickname: "",
      });
      expect(result.current.errors).toEqual({});
    });
  });

  describe("경계값 테스트", () => {
    it("userId 최소 길이 경계값을 테스트해야 한다", () => {
      const { result } = renderHook(() => useRegisterForm());

      act(() => {
        result.current.setFieldValue("userId", "test"); // 정확히 4자
        result.current.validate();
      });

      expect(result.current.errors.userId).toBeUndefined();
    });

    it("userId 최대 길이 경계값을 테스트해야 한다", () => {
      const { result } = renderHook(() => useRegisterForm());

      act(() => {
        result.current.setFieldValue("userId", "a".repeat(20)); // 정확히 20자
        result.current.validate();
      });

      expect(result.current.errors.userId).toBeUndefined();
    });

    it("password 최소 길이 경계값을 테스트해야 한다", () => {
      const { result } = renderHook(() => useRegisterForm());

      act(() => {
        result.current.setFieldValue("password", "pass1234"); // 정확히 8자
        result.current.validate();
      });

      expect(result.current.errors.password).toBeUndefined();
    });

    it("nickname 최소 길이 경계값을 테스트해야 한다", () => {
      const { result } = renderHook(() => useRegisterForm());

      act(() => {
        result.current.setFieldValue("nickname", "테스"); // 정확히 2자
        result.current.validate();
      });

      expect(result.current.errors.nickname).toBeUndefined();
    });
  });

  describe("개별 필드 검증", () => {
    it("개별 필드 검증이 동작해야 한다", () => {
      const { result } = renderHook(() => useRegisterForm());

      act(() => {
        result.current.setFieldValue("userId", "test@user");
        result.current.validateField("userId");
      });

      expect(result.current.errors.userId).toBe(
        "아이디는 영문과 숫자만 사용할 수 있습니다"
      );
      // 다른 필드는 검증되지 않음
      expect(result.current.errors.password).toBeUndefined();
      expect(result.current.errors.nickname).toBeUndefined();
    });
  });
});
