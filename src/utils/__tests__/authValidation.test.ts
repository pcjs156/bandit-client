import { describe, it, expect } from "vitest";
import { AuthValidation } from "../authValidation";
import { ApiErrorCode } from "@src/types/api";
import type { RegisterRequest, UpdateUserRequest } from "@src/types/api";

describe("AuthValidation", () => {
  describe("validateRegisterInput", () => {
    const validData: RegisterRequest = {
      userId: "testuser123",
      password: "password123",
      nickname: "테스트유저",
    };

    describe("userId 검증", () => {
      it("유효한 userId는 통과해야 한다", () => {
        const result = AuthValidation.validateRegisterInput(validData);
        expect(result).toBeNull();
      });

      it("userId가 없으면 에러를 반환해야 한다", () => {
        const data = { ...validData, userId: "" };
        const result = AuthValidation.validateRegisterInput(data);

        expect(result).not.toBeNull();
        expect(result?.detailCode).toBe(ApiErrorCode.VALIDATION_ERROR);
        expect(result?.message).toContain("아이디는 4-20자 사이여야 합니다");
      });

      it("userId가 너무 짧으면 에러를 반환해야 한다", () => {
        const data = { ...validData, userId: "abc" }; // 3자
        const result = AuthValidation.validateRegisterInput(data);

        expect(result).not.toBeNull();
        expect(result?.detailCode).toBe(ApiErrorCode.VALIDATION_ERROR);
        expect(result?.message).toContain("4-20자");
      });

      it("userId가 너무 길면 에러를 반환해야 한다", () => {
        const data = { ...validData, userId: "a".repeat(21) }; // 21자
        const result = AuthValidation.validateRegisterInput(data);

        expect(result).not.toBeNull();
        expect(result?.detailCode).toBe(ApiErrorCode.VALIDATION_ERROR);
        expect(result?.message).toContain("4-20자");
      });

      it("userId에 특수문자가 포함되면 에러를 반환해야 한다", () => {
        const data = { ...validData, userId: "test@user" };
        const result = AuthValidation.validateRegisterInput(data);

        expect(result).not.toBeNull();
        expect(result?.detailCode).toBe(ApiErrorCode.VALIDATION_ERROR);
        expect(result?.message).toContain("영문과 숫자만 사용할 수 있습니다");
      });

      it("userId에 한글이 포함되면 에러를 반환해야 한다", () => {
        const data = { ...validData, userId: "test유저" };
        const result = AuthValidation.validateRegisterInput(data);

        expect(result).not.toBeNull();
        expect(result?.detailCode).toBe(ApiErrorCode.VALIDATION_ERROR);
        expect(result?.message).toContain("영문과 숫자만 사용할 수 있습니다");
      });
    });

    describe("password 검증", () => {
      it("유효한 password는 통과해야 한다", () => {
        const result = AuthValidation.validateRegisterInput(validData);
        expect(result).toBeNull();
      });

      it("password가 없으면 에러를 반환해야 한다", () => {
        const data = { ...validData, password: "" };
        const result = AuthValidation.validateRegisterInput(data);

        expect(result).not.toBeNull();
        expect(result?.detailCode).toBe(ApiErrorCode.VALIDATION_ERROR);
        expect(result?.message).toContain("비밀번호는 8-50자 사이여야 합니다");
      });

      it("password가 너무 짧으면 에러를 반환해야 한다", () => {
        const data = { ...validData, password: "pass12" }; // 6자
        const result = AuthValidation.validateRegisterInput(data);

        expect(result).not.toBeNull();
        expect(result?.detailCode).toBe(ApiErrorCode.VALIDATION_ERROR);
        expect(result?.message).toContain("8-50자");
      });

      it("password가 너무 길면 에러를 반환해야 한다", () => {
        const data = { ...validData, password: "a".repeat(51) }; // 51자
        const result = AuthValidation.validateRegisterInput(data);

        expect(result).not.toBeNull();
        expect(result?.detailCode).toBe(ApiErrorCode.VALIDATION_ERROR);
        expect(result?.message).toContain("8-50자");
      });

      it("password에 영문이 없으면 에러를 반환해야 한다", () => {
        const data = { ...validData, password: "12345678" }; // 숫자만
        const result = AuthValidation.validateRegisterInput(data);

        expect(result).not.toBeNull();
        expect(result?.detailCode).toBe(ApiErrorCode.VALIDATION_ERROR);
        expect(result?.message).toContain("영문과 숫자를 모두 포함해야 합니다");
      });

      it("password에 숫자가 없으면 에러를 반환해야 한다", () => {
        const data = { ...validData, password: "password" }; // 영문만
        const result = AuthValidation.validateRegisterInput(data);

        expect(result).not.toBeNull();
        expect(result?.detailCode).toBe(ApiErrorCode.VALIDATION_ERROR);
        expect(result?.message).toContain("영문과 숫자를 모두 포함해야 합니다");
      });
    });

    describe("nickname 검증", () => {
      it("유효한 nickname은 통과해야 한다", () => {
        const result = AuthValidation.validateRegisterInput(validData);
        expect(result).toBeNull();
      });

      it("nickname이 없으면 에러를 반환해야 한다", () => {
        const data = { ...validData, nickname: "" };
        const result = AuthValidation.validateRegisterInput(data);

        expect(result).not.toBeNull();
        expect(result?.detailCode).toBe(ApiErrorCode.VALIDATION_ERROR);
        expect(result?.message).toContain("닉네임은 2-20자 사이여야 합니다");
      });

      it("nickname이 너무 짧으면 에러를 반환해야 한다", () => {
        const data = { ...validData, nickname: "가" }; // 1자
        const result = AuthValidation.validateRegisterInput(data);

        expect(result).not.toBeNull();
        expect(result?.detailCode).toBe(ApiErrorCode.VALIDATION_ERROR);
        expect(result?.message).toContain("2-20자");
      });

      it("nickname이 너무 길면 에러를 반환해야 한다", () => {
        const data = { ...validData, nickname: "가".repeat(21) }; // 21자
        const result = AuthValidation.validateRegisterInput(data);

        expect(result).not.toBeNull();
        expect(result?.detailCode).toBe(ApiErrorCode.VALIDATION_ERROR);
        expect(result?.message).toContain("2-20자");
      });
    });
  });

  describe("validateUpdateUserInput", () => {
    it("유효한 nickname 업데이트는 통과해야 한다", () => {
      const data: UpdateUserRequest = { nickname: "새닉네임" };
      const result = AuthValidation.validateUpdateUserInput(data);
      expect(result).toBeNull();
    });

    it("nickname이 undefined면 통과해야 한다 (선택적 업데이트)", () => {
      const data: UpdateUserRequest = {};
      const result = AuthValidation.validateUpdateUserInput(data);
      expect(result).toBeNull();
    });

    it("빈 nickname은 에러를 반환해야 한다", () => {
      const data: UpdateUserRequest = { nickname: "" };
      const result = AuthValidation.validateUpdateUserInput(data);

      expect(result).not.toBeNull();
      expect(result?.detailCode).toBe(ApiErrorCode.VALIDATION_ERROR);
      expect(result?.message).toContain("닉네임은 2-20자 사이여야 합니다");
    });

    it("너무 긴 nickname은 에러를 반환해야 한다", () => {
      const data: UpdateUserRequest = { nickname: "가".repeat(21) };
      const result = AuthValidation.validateUpdateUserInput(data);

      expect(result).not.toBeNull();
      expect(result?.detailCode).toBe(ApiErrorCode.VALIDATION_ERROR);
      expect(result?.message).toContain("2-20자");
    });
  });

  describe("validateLoginInput", () => {
    it("로그인 검증은 항상 null을 반환해야 한다", () => {
      const result = AuthValidation.validateLoginInput("", "");
      expect(result).toBeNull();

      const result2 = AuthValidation.validateLoginInput("test", "password");
      expect(result2).toBeNull();
    });
  });
});
