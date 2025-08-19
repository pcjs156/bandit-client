import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRegisterForm } from "../useRegisterForm";

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
    it("빈 값이면 에러를 반환해야 한다", () => {
      const { result } = renderHook(() => useRegisterForm());

      act(() => {
        result.current.setFieldValue("userId", "");
        result.current.validate();
      });

      expect(result.current.errors.userId).toBe("아이디를 입력해주세요");
    });

    it("너무 짧으면 에러를 반환해야 한다", () => {
      const { result } = renderHook(() => useRegisterForm());

      act(() => {
        result.current.setFieldValue("userId", "abc"); // 3자
        result.current.validate();
      });

      expect(result.current.errors.userId).toBe(
        "아이디는 4자 이상이어야 합니다"
      );
    });

    it("너무 길면 에러를 반환해야 한다", () => {
      const { result } = renderHook(() => useRegisterForm());

      act(() => {
        result.current.setFieldValue("userId", "a".repeat(21)); // 21자
        result.current.validate();
      });

      expect(result.current.errors.userId).toBe(
        "아이디는 20자 이하여야 합니다"
      );
    });

    it("영문과 숫자가 아닌 문자가 포함되면 에러를 반환해야 한다", () => {
      const { result } = renderHook(() => useRegisterForm());

      act(() => {
        result.current.setFieldValue("userId", "test@user");
        result.current.validate();
      });

      expect(result.current.errors.userId).toBe(
        "아이디는 영문과 숫자만 사용할 수 있습니다"
      );
    });

    it("유효한 아이디는 에러가 없어야 한다", () => {
      const { result } = renderHook(() => useRegisterForm());

      act(() => {
        result.current.setFieldValue("userId", "testuser123");
        result.current.validate();
      });

      expect(result.current.errors.userId).toBeUndefined();
    });

    it("최소 길이 경계값을 테스트해야 한다", () => {
      const { result } = renderHook(() => useRegisterForm());

      // 정확히 4자 (최소값)
      act(() => {
        result.current.setFieldValue("userId", "test");
        result.current.validate();
      });

      expect(result.current.errors.userId).toBeUndefined();
    });

    it("최대 길이 경계값을 테스트해야 한다", () => {
      const { result } = renderHook(() => useRegisterForm());

      // 정확히 20자 (최대값)
      act(() => {
        result.current.setFieldValue("userId", "a".repeat(20));
        result.current.validate();
      });

      expect(result.current.errors.userId).toBeUndefined();
    });
  });

  describe("password 검증", () => {
    it("빈 값이면 에러를 반환해야 한다", () => {
      const { result } = renderHook(() => useRegisterForm());

      act(() => {
        result.current.setFieldValue("password", "");
        result.current.validate();
      });

      expect(result.current.errors.password).toBe("비밀번호를 입력해주세요");
    });

    it("너무 짧으면 에러를 반환해야 한다", () => {
      const { result } = renderHook(() => useRegisterForm());

      act(() => {
        result.current.setFieldValue("password", "pass12"); // 6자
        result.current.validate();
      });

      expect(result.current.errors.password).toBe(
        "비밀번호는 8자 이상이어야 합니다"
      );
    });

    it("너무 길면 에러를 반환해야 한다", () => {
      const { result } = renderHook(() => useRegisterForm());

      act(() => {
        result.current.setFieldValue("password", "a".repeat(51)); // 51자
        result.current.validate();
      });

      expect(result.current.errors.password).toBe(
        "비밀번호는 50자 이하여야 합니다"
      );
    });

    it("영문이 없으면 에러를 반환해야 한다", () => {
      const { result } = renderHook(() => useRegisterForm());

      act(() => {
        result.current.setFieldValue("password", "12345678"); // 숫자만
        result.current.validate();
      });

      expect(result.current.errors.password).toBe(
        "비밀번호는 영문과 숫자를 모두 포함해야 합니다"
      );
    });

    it("숫자가 없으면 에러를 반환해야 한다", () => {
      const { result } = renderHook(() => useRegisterForm());

      act(() => {
        result.current.setFieldValue("password", "password"); // 영문만
        result.current.validate();
      });

      expect(result.current.errors.password).toBe(
        "비밀번호는 영문과 숫자를 모두 포함해야 합니다"
      );
    });

    it("유효한 비밀번호는 에러가 없어야 한다", () => {
      const { result } = renderHook(() => useRegisterForm());

      act(() => {
        result.current.setFieldValue("password", "password123");
        result.current.validate();
      });

      expect(result.current.errors.password).toBeUndefined();
    });

    it("최소 길이 경계값을 테스트해야 한다", () => {
      const { result } = renderHook(() => useRegisterForm());

      // 정확히 8자 (최소값)
      act(() => {
        result.current.setFieldValue("password", "pass1234");
        result.current.validate();
      });

      expect(result.current.errors.password).toBeUndefined();
    });

    it("최대 길이 경계값을 테스트해야 한다", () => {
      const { result } = renderHook(() => useRegisterForm());

      // 정확히 50자 (최대값)
      const validPassword = "a".repeat(49) + "1"; // 49개 영문 + 1개 숫자
      act(() => {
        result.current.setFieldValue("password", validPassword);
        result.current.validate();
      });

      expect(result.current.errors.password).toBeUndefined();
    });
  });

  describe("nickname 검증", () => {
    it("빈 값이면 에러를 반환해야 한다", () => {
      const { result } = renderHook(() => useRegisterForm());

      act(() => {
        result.current.setFieldValue("nickname", "");
        result.current.validate();
      });

      expect(result.current.errors.nickname).toBe("닉네임을 입력해주세요");
    });

    it("너무 짧으면 에러를 반환해야 한다", () => {
      const { result } = renderHook(() => useRegisterForm());

      act(() => {
        result.current.setFieldValue("nickname", "a"); // 1자
        result.current.validate();
      });

      expect(result.current.errors.nickname).toBe(
        "닉네임은 2자 이상이어야 합니다"
      );
    });

    it("너무 길면 에러를 반환해야 한다", () => {
      const { result } = renderHook(() => useRegisterForm());

      act(() => {
        result.current.setFieldValue("nickname", "a".repeat(21)); // 21자
        result.current.validate();
      });

      expect(result.current.errors.nickname).toBe(
        "닉네임은 20자 이하여야 합니다"
      );
    });

    it("유효한 닉네임은 에러가 없어야 한다", () => {
      const { result } = renderHook(() => useRegisterForm());

      act(() => {
        result.current.setFieldValue("nickname", "테스트유저");
        result.current.validate();
      });

      expect(result.current.errors.nickname).toBeUndefined();
    });

    it("최소 길이 경계값을 테스트해야 한다", () => {
      const { result } = renderHook(() => useRegisterForm());

      // 정확히 2자 (최소값)
      act(() => {
        result.current.setFieldValue("nickname", "테스");
        result.current.validate();
      });

      expect(result.current.errors.nickname).toBeUndefined();
    });

    it("최대 길이 경계값을 테스트해야 한다", () => {
      const { result } = renderHook(() => useRegisterForm());

      // 정확히 20자 (최대값)
      act(() => {
        result.current.setFieldValue("nickname", "a".repeat(20));
        result.current.validate();
      });

      expect(result.current.errors.nickname).toBeUndefined();
    });

    it("한글 닉네임도 허용해야 한다", () => {
      const { result } = renderHook(() => useRegisterForm());

      act(() => {
        result.current.setFieldValue("nickname", "한글닉네임테스트");
        result.current.validate();
      });

      expect(result.current.errors.nickname).toBeUndefined();
    });

    it("특수문자가 포함된 닉네임도 허용해야 한다", () => {
      const { result } = renderHook(() => useRegisterForm());

      act(() => {
        result.current.setFieldValue("nickname", "nick@name");
        result.current.validate();
      });

      expect(result.current.errors.nickname).toBeUndefined();
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
