import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRegisterForm } from "../useRegisterForm";
import { createValidationTests } from "@src/test/helpers/hookTestHelpers";
import {
  userIdValidationCases,
  passwordValidationCases,
  nicknameValidationCases,
} from "@src/test/data/testCases";

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

  describe("userId 검증", () => {
    // 공통 테스트 케이스 사용
    const userIdTests = createValidationTests(
      userIdValidationCases,
      useRegisterForm,
      "userId",
      (result, value) => result.current.setFieldValue("userId", value),
      (result) => result.current.validate()
    );

    userIdTests.forEach(({ name, test }) => {
      it(name, test);
    });
  });

  describe("password 검증", () => {
    // 공통 테스트 케이스 사용
    const passwordTests = createValidationTests(
      passwordValidationCases,
      useRegisterForm,
      "password",
      (result, value) => result.current.setFieldValue("password", value),
      (result) => result.current.validate()
    );

    passwordTests.forEach(({ name, test }) => {
      it(name, test);
    });
  });

  describe("nickname 검증", () => {
    // 공통 테스트 케이스 사용
    const nicknameTests = createValidationTests(
      nicknameValidationCases,
      useRegisterForm,
      "nickname",
      (result, value) => result.current.setFieldValue("nickname", value),
      (result) => result.current.validate()
    );

    nicknameTests.forEach(({ name, test }) => {
      it(name, test);
    });
  });

  describe("전체 폼 검증", () => {
    it("모든 필드가 유효하면 에러가 없어야 한다", () => {
      const { result } = renderHook(() => useRegisterForm());

      act(() => {
        result.current.setValues({
          userId: "testuser123",
          password: "password123",
          nickname: "테스트유저",
        });
        result.current.validate();
      });

      expect(result.current.errors).toEqual({});
      expect(result.current.isValid()).toBe(true);
    });

    it("하나라도 유효하지 않으면 폼이 유효하지 않아야 한다", () => {
      const { result } = renderHook(() => useRegisterForm());

      act(() => {
        result.current.setValues({
          userId: "", // 유효하지 않음
          password: "password123",
          nickname: "테스트유저",
        });
        result.current.validate();
      });

      expect(result.current.errors.userId).toBeTruthy();
      expect(result.current.isValid()).toBe(false);
    });

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
