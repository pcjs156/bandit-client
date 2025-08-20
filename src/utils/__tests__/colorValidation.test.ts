import { describe, it, expect } from "vitest";
import {
  validateColorName,
  validateColorValue,
  validateColorInput,
} from "../colorValidation";
import type { CustomColor } from "@src/stores/themeStore";

describe("colorValidation", () => {
  // 테스트용 기존 색상 목록
  const existingColors: CustomColor[] = [
    { id: "1", name: "기존색상", value: "#ff0000", shades: [] },
    { id: "2", name: "ExistingColor", value: "#00ff00", shades: [] },
    { id: "3", name: "테스트", value: "#0000ff", shades: [] },
  ];

  describe("validateColorName", () => {
    it("유효한 색상 이름은 null을 반환해야 한다", () => {
      const result = validateColorName("새로운색상", existingColors);
      expect(result).toBeNull();
    });

    it("빈 문자열은 에러를 반환해야 한다", () => {
      const result = validateColorName("", existingColors);
      expect(result).toBe("색상 이름을 입력해주세요.");
    });

    it("공백만 있는 문자열은 에러를 반환해야 한다", () => {
      const result = validateColorName("   ", existingColors);
      expect(result).toBe("색상 이름을 입력해주세요.");
    });

    it("20자를 초과하는 이름은 에러를 반환해야 한다", () => {
      const longName = "a".repeat(21); // 21자
      const result = validateColorName(longName, existingColors);
      expect(result).toBe("색상 이름은 20자 이하로 입력해주세요.");
    });

    it("정확히 20자인 이름은 통과해야 한다", () => {
      const exactName = "12345678901234567890"; // 정확히 20자
      const result = validateColorName(exactName, existingColors);
      expect(result).toBeNull();
    });

    it("중복된 색상 이름은 에러를 반환해야 한다 (대소문자 구분 없음)", () => {
      const result = validateColorName("기존색상", existingColors);
      expect(result).toBe("이미 존재하는 색상 이름입니다.");
    });

    it("대소문자가 다른 중복 이름도 에러를 반환해야 한다", () => {
      const result = validateColorName("EXISTINGCOLOR", existingColors);
      expect(result).toBe("이미 존재하는 색상 이름입니다.");
    });

    it("앞뒤 공백이 있는 이름은 trim 후 검증해야 한다", () => {
      const result = validateColorName("  유효한이름  ", existingColors);
      expect(result).toBeNull();
    });

    it("trim 후 중복되는 이름은 에러를 반환해야 한다", () => {
      const result = validateColorName("  기존색상  ", existingColors);
      expect(result).toBe("이미 존재하는 색상 이름입니다.");
    });
  });

  describe("validateColorValue", () => {
    it("유효한 6자리 hex 색상은 통과해야 한다", () => {
      expect(validateColorValue("#ff0000")).toBeNull();
      expect(validateColorValue("#00FF00")).toBeNull();
      expect(validateColorValue("#123ABC")).toBeNull();
    });

    it("유효한 3자리 hex 색상은 통과해야 한다", () => {
      expect(validateColorValue("#f00")).toBeNull();
      expect(validateColorValue("#0F0")).toBeNull();
      expect(validateColorValue("#12A")).toBeNull();
    });

    it("#이 없는 색상은 에러를 반환해야 한다", () => {
      const result = validateColorValue("ff0000");
      expect(result).toBe("올바른 hex 색상 형식이 아닙니다.");
    });

    it("잘못된 길이의 hex 색상은 에러를 반환해야 한다", () => {
      expect(validateColorValue("#f")).toBe("올바른 hex 색상 형식이 아닙니다.");
      expect(validateColorValue("#ff")).toBe(
        "올바른 hex 색상 형식이 아닙니다.",
      );
      expect(validateColorValue("#ffff")).toBe(
        "올바른 hex 색상 형식이 아닙니다.",
      );
      expect(validateColorValue("#fffff")).toBe(
        "올바른 hex 색상 형식이 아닙니다.",
      );
      expect(validateColorValue("#fffffff")).toBe(
        "올바른 hex 색상 형식이 아닙니다.",
      );
    });

    it("잘못된 문자가 포함된 hex 색상은 에러를 반환해야 한다", () => {
      expect(validateColorValue("#gggggg")).toBe(
        "올바른 hex 색상 형식이 아닙니다.",
      );
      expect(validateColorValue("#ff00zz")).toBe(
        "올바른 hex 색상 형식이 아닙니다.",
      );
      expect(validateColorValue("#가나다")).toBe(
        "올바른 hex 색상 형식이 아닙니다.",
      );
    });

    it("빈 문자열은 에러를 반환해야 한다", () => {
      const result = validateColorValue("");
      expect(result).toBe("올바른 hex 색상 형식이 아닙니다.");
    });
  });

  describe("validateColorInput", () => {
    it("유효한 이름과 색상은 null을 반환해야 한다", () => {
      const result = validateColorInput("새색상", "#ff0000", existingColors);
      expect(result).toBeNull();
    });

    it("이름이 잘못되면 이름 에러를 우선 반환해야 한다", () => {
      const result = validateColorInput("", "#ff0000", existingColors);
      expect(result).toBe("색상 이름을 입력해주세요.");
    });

    it("이름은 유효하지만 색상이 잘못되면 색상 에러를 반환해야 한다", () => {
      const result = validateColorInput(
        "유효한이름",
        "invalid",
        existingColors,
      );
      expect(result).toBe("올바른 hex 색상 형식이 아닙니다.");
    });

    it("이름과 색상이 모두 잘못되면 이름 에러를 우선 반환해야 한다", () => {
      const result = validateColorInput("", "invalid", existingColors);
      expect(result).toBe("색상 이름을 입력해주세요.");
    });

    it("중복된 이름은 색상이 유효해도 에러를 반환해야 한다", () => {
      const result = validateColorInput("기존색상", "#ff0000", existingColors);
      expect(result).toBe("이미 존재하는 색상 이름입니다.");
    });
  });
});
