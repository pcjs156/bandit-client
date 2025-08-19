import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePasswordStrength } from "../usePasswordStrength";
import { createPasswordStrengthTests } from "@src/test/helpers/hookTestHelpers";
import { passwordStrengthCases } from "@src/test/data/testCases";

describe("usePasswordStrength", () => {
  describe("비밀번호 강도 계산", () => {
    // 공통 테스트 케이스 사용
    const strengthTests = createPasswordStrengthTests(passwordStrengthCases);

    strengthTests.forEach(({ name, test }) => {
      it(name, () => test(usePasswordStrength));
    });
  });

  describe("강도별 라벨과 색상", () => {
    it('0-29점은 "약함"이고 빨간색이어야 한다', () => {
      const { result } = renderHook(() => usePasswordStrength("a"));

      expect(result.current.strength).toBe(25);
      expect(result.current.label).toBe("약함");
      expect(result.current.color).toBe("red");
    });

    it('30-59점은 "보통"이고 노란색이어야 한다', () => {
      const { result } = renderHook(() => usePasswordStrength("a1"));

      expect(result.current.strength).toBe(50);
      expect(result.current.label).toBe("보통");
      expect(result.current.color).toBe("yellow");
    });

    it('60-79점은 "강함"이고 파란색이어야 한다', () => {
      const { result } = renderHook(() => usePasswordStrength("a1A"));

      expect(result.current.strength).toBe(75);
      expect(result.current.label).toBe("강함");
      expect(result.current.color).toBe("blue");
    });

    it('80-100점은 "매우 강함"이고 초록색이어야 한다', () => {
      const { result } = renderHook(() => usePasswordStrength("password123"));

      // 길이8자(25) + 소문자(25) + 숫자(25) = 75점 (아직 "강함")
      expect(result.current.strength).toBe(75);
      expect(result.current.label).toBe("강함");
      expect(result.current.color).toBe("blue");
    });

    it('80점 이상은 "매우 강함"이어야 한다', () => {
      const { result } = renderHook(() => usePasswordStrength("Password123!"));

      // 길이8자(25) + 소문자(25) + 대문자(25) + 숫자(25) + 특수문자(25) = 125점 → 100점
      expect(result.current.strength).toBe(100);
      expect(result.current.label).toBe("매우 강함");
      expect(result.current.color).toBe("green");
    });
  });

  describe("특수한 경우들", () => {
    it("숫자만 있는 비밀번호", () => {
      const { result } = renderHook(() => usePasswordStrength("12345678"));

      // 길이8자(25) + 숫자(25) = 50점
      expect(result.current.strength).toBe(50);
      expect(result.current.label).toBe("보통");
      expect(result.current.color).toBe("yellow");
    });

    it("영문만 있는 비밀번호", () => {
      const { result } = renderHook(() => usePasswordStrength("abcdefgh"));

      // 길이8자(25) + 소문자(25) = 50점
      expect(result.current.strength).toBe(50);
      expect(result.current.label).toBe("보통");
      expect(result.current.color).toBe("yellow");
    });

    it("대문자만 있는 비밀번호", () => {
      const { result } = renderHook(() => usePasswordStrength("ABCDEFGH"));

      // 길이8자(25) + 대문자(25) = 50점
      expect(result.current.strength).toBe(50);
      expect(result.current.label).toBe("보통");
      expect(result.current.color).toBe("yellow");
    });

    it("특수문자만 있는 비밀번호", () => {
      const { result } = renderHook(() => usePasswordStrength("!@#$%^&*"));

      // 길이8자(25) + 특수문자(25) = 50점
      expect(result.current.strength).toBe(50);
      expect(result.current.label).toBe("보통");
      expect(result.current.color).toBe("yellow");
    });

    it("매우 긴 비밀번호", () => {
      const { result } = renderHook(() => usePasswordStrength("a".repeat(50)));

      // 길이8자(25) + 길이12자(25) + 소문자(25) = 75점
      expect(result.current.strength).toBe(75);
      expect(result.current.label).toBe("강함");
      expect(result.current.color).toBe("blue");
    });
  });

  describe("메모이제이션 테스트", () => {
    it("같은 비밀번호에 대해서는 같은 객체를 반환해야 한다", () => {
      const { result, rerender } = renderHook(
        ({ password }) => usePasswordStrength(password),
        { initialProps: { password: "test123" } }
      );

      const firstResult = result.current;

      // 같은 props로 리렌더링
      rerender({ password: "test123" });

      const secondResult = result.current;

      // 객체 참조가 같아야 함 (메모이제이션)
      expect(firstResult).toBe(secondResult);
    });

    it("다른 비밀번호에 대해서는 다른 결과를 반환해야 한다", () => {
      const { result, rerender } = renderHook(
        ({ password }) => usePasswordStrength(password),
        { initialProps: { password: "test123" } }
      );

      const firstResult = result.current;

      // 다른 props로 리렌더링
      rerender({ password: "different456" });

      const secondResult = result.current;

      // 결과가 달라야 함
      expect(firstResult).not.toBe(secondResult);
      expect(firstResult.strength).not.toBe(secondResult.strength);
    });
  });
});
