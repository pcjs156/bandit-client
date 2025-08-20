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
    describe("userId 검증", () => {
      it("빈 값이면 에러가 발생해야 한다", () => {
        const { result } = renderHook(() => useRegisterForm());
        
        act(() => {
          result.current.setFieldValue("userId", "");
          result.current.validate();
        });
        
        expect(result.current.errors.userId).toBe("아이디를 입력해주세요");
      });

      it("최소 길이보다 짧으면 에러가 발생해야 한다", () => {
        const { result } = renderHook(() => useRegisterForm());
        
        act(() => {
          result.current.setFieldValue("userId", "abc");
          result.current.validate();
        });
        
        expect(result.current.errors.userId).toBe("아이디는 4자 이상이어야 합니다");
      });

      it("최대 길이보다 길면 에러가 발생해야 한다", () => {
        const { result } = renderHook(() => useRegisterForm());
        
        act(() => {
          result.current.setFieldValue("userId", "a".repeat(21));
          result.current.validate();
        });
        
        expect(result.current.errors.userId).toBe("아이디는 20자 이하여야 합니다");
      });

      it("영문과 숫자가 아닌 문자가 포함되면 에러가 발생해야 한다", () => {
        const { result } = renderHook(() => useRegisterForm());
        
        act(() => {
          result.current.setFieldValue("userId", "test@123");
          result.current.validate();
        });
        
        expect(result.current.errors.userId).toBe("아이디는 영문과 숫자만 사용할 수 있습니다");
      });

      it("유효한 값이면 에러가 없어야 한다", () => {
        const { result } = renderHook(() => useRegisterForm());
        
        act(() => {
          result.current.setFieldValue("userId", "test123");
          result.current.validate();
        });
        
        expect(result.current.errors.userId).toBeUndefined();
      });
    });

    describe("password 검증", () => {
      it("빈 값이면 에러가 발생해야 한다", () => {
        const { result } = renderHook(() => useRegisterForm());
        
        act(() => {
          result.current.setFieldValue("password", "");
          result.current.validate();
        });
        
        expect(result.current.errors.password).toBe("비밀번호를 입력해주세요");
      });

      it("최소 길이보다 짧으면 에러가 발생해야 한다", () => {
        const { result } = renderHook(() => useRegisterForm());
        
        act(() => {
          result.current.setFieldValue("password", "pass1");
          result.current.validate();
        });
        
        expect(result.current.errors.password).toBe("비밀번호는 8자 이상이어야 합니다");
      });

      it("영문과 숫자를 모두 포함하지 않으면 에러가 발생해야 한다", () => {
        const { result } = renderHook(() => useRegisterForm());
        
        act(() => {
          result.current.setFieldValue("password", "password");
          result.current.validate();
        });
        
        expect(result.current.errors.password).toBe("비밀번호는 영문과 숫자를 모두 포함해야 합니다");
      });

      it("유효한 값이면 에러가 없어야 한다", () => {
        const { result } = renderHook(() => useRegisterForm());
        
        act(() => {
          result.current.setFieldValue("password", "password123");
          result.current.validate();
        });
        
        expect(result.current.errors.password).toBeUndefined();
      });
    });

    describe("nickname 검증", () => {
      it("빈 값이면 에러가 발생해야 한다", () => {
        const { result } = renderHook(() => useRegisterForm());
        
        act(() => {
          result.current.setFieldValue("nickname", "");
          result.current.validate();
        });
        
        expect(result.current.errors.nickname).toBe("닉네임을 입력해주세요");
      });

      it("최소 길이보다 짧으면 에러가 발생해야 한다", () => {
        const { result } = renderHook(() => useRegisterForm());
        
        act(() => {
          result.current.setFieldValue("nickname", "테");
          result.current.validate();
        });
        
        expect(result.current.errors.nickname).toBe("닉네임은 2자 이상이어야 합니다");
      });

      it("유효한 값이면 에러가 없어야 한다", () => {
        const { result } = renderHook(() => useRegisterForm());
        
        act(() => {
          result.current.setFieldValue("nickname", "테스트");
          result.current.validate();
        });
        
        expect(result.current.errors.nickname).toBeUndefined();
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
    it("필드 값 설정 후 상태가 올바르게 변경되어야 한다", () => {
      const { result } = renderHook(() => useRegisterForm());
      
      act(() => {
        result.current.setFieldValue("userId", "newuser");
      });
      
      expect(result.current.values.userId).toBe("newuser");
      expect(result.current.values.password).toBe("");
      expect(result.current.values.nickname).toBe("");
    });

    it("여러 필드 값을 한 번에 설정할 수 있어야 한다", () => {
      const { result } = renderHook(() => useRegisterForm());
      
      act(() => {
        result.current.setValues({
          userId: "user1",
          password: "pass1",
          nickname: "nick1",
        });
      });
      
      expect(result.current.values.userId).toBe("user1");
      expect(result.current.values.password).toBe("pass1");
      expect(result.current.values.nickname).toBe("nick1");
    });
  });

  describe("에러 처리", () => {
    it("빈 userId로 검증 시 에러가 발생해야 한다", () => {
      const { result } = renderHook(() => useRegisterForm());
      
      act(() => {
        result.current.setFieldValue("userId", "");
        result.current.validate();
      });
      
      expect(result.current.errors.userId).toBe("아이디를 입력해주세요");
    });

    it("빈 password로 검증 시 에러가 발생해야 한다", () => {
      const { result } = renderHook(() => useRegisterForm());
      
      act(() => {
        result.current.setFieldValue("password", "");
        result.current.validate();
      });
      
      expect(result.current.errors.password).toBe("비밀번호를 입력해주세요");
    });

    it("빈 nickname으로 검증 시 에러가 발생해야 한다", () => {
      const { result } = renderHook(() => useRegisterForm());
      
      act(() => {
        result.current.setFieldValue("nickname", "");
        result.current.validate();
      });
      
      expect(result.current.errors.nickname).toBe("닉네임을 입력해주세요");
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
