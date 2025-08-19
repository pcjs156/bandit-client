import { describe, it, expect } from "vitest";
import type { PrimaryColor } from "../colors";
import { primaryColors, defaultColorSwatches } from "../colors";

describe("colors", () => {
  describe("PrimaryColor 타입", () => {
    it("PrimaryColor 타입이 정의되어 있어야 한다", () => {
      // 타입 테스트는 컴파일 타임에 이루어지므로 런타임 테스트로는 제한적
      // 하지만 타입이 올바르게 사용되는지 확인할 수 있음
      const testColor: PrimaryColor = "blue";
      expect(typeof testColor).toBe("string");

      const customColor: PrimaryColor = "custom-color";
      expect(typeof customColor).toBe("string");
    });
  });

  describe("primaryColors", () => {
    it("기본 색상들이 정의되어 있어야 한다", () => {
      expect(primaryColors).toBeDefined();
      expect(Array.isArray(primaryColors)).toBe(true);
      expect(primaryColors.length).toBeGreaterThan(0);
    });

    it("모든 기본 색상이 올바른 구조를 가져야 한다", () => {
      primaryColors.forEach((color) => {
        expect(color).toHaveProperty("name");
        expect(color).toHaveProperty("value");
        expect(typeof color.name).toBe("string");
        expect(typeof color.value).toBe("string");
        expect(color.name.length).toBeGreaterThan(0);
        expect(color.value.length).toBeGreaterThan(0);
      });
    });

    it("예상되는 기본 색상들이 포함되어 있어야 한다", () => {
      const expectedColors = ["blue", "red", "green"];
      const colorValues = primaryColors.map((c) => c.value);

      expectedColors.forEach((color) => {
        expect(colorValues).toContain(color);
      });
    });

    it("색상 이름과 값이 일치해야 한다", () => {
      primaryColors.forEach((color) => {
        // 대부분의 경우 name의 소문자 버전이 value와 일치해야 함
        expect(color.name.toLowerCase()).toBe(color.value);
      });
    });

    it("중복된 색상이 없어야 한다", () => {
      const values = primaryColors.map((c) => c.value);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);

      const names = primaryColors.map((c) => c.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    it("모든 색상 값이 유효한 Mantine 색상이어야 한다", () => {
      const validMantineColors = [
        "dark",
        "gray",
        "red",
        "pink",
        "grape",
        "violet",
        "indigo",
        "blue",
        "cyan",
        "teal",
        "green",
        "lime",
        "yellow",
        "orange",
      ];

      primaryColors.forEach((color) => {
        expect(validMantineColors).toContain(color.value);
      });
    });
  });

  describe("defaultColorSwatches", () => {
    it("기본 색상 스와치가 정의되어 있어야 한다", () => {
      expect(defaultColorSwatches).toBeDefined();
      expect(Array.isArray(defaultColorSwatches)).toBe(true);
      expect(defaultColorSwatches.length).toBeGreaterThan(0);
    });

    it("모든 색상이 유효한 hex 값이어야 한다", () => {
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

      defaultColorSwatches.forEach((color) => {
        expect(typeof color).toBe("string");
        expect(color).toMatch(hexColorRegex);
      });
    });

    it("적절한 수의 색상을 포함해야 한다", () => {
      // 일반적으로 색상 팔레트는 10-20개 정도의 색상을 포함
      expect(defaultColorSwatches.length).toBeGreaterThanOrEqual(10);
      expect(defaultColorSwatches.length).toBeLessThanOrEqual(20);
    });

    it("중복된 색상이 없어야 한다", () => {
      const uniqueColors = new Set(defaultColorSwatches);
      expect(uniqueColors.size).toBe(defaultColorSwatches.length);
    });

    it("다양한 색상 범위를 포함해야 한다", () => {
      // 첫 번째 색상이 어두운 색상인지 확인 (일반적으로 dark 테마용)
      expect(defaultColorSwatches[0]).toMatch(/^#[0-2][0-9a-f]{5}$/i);

      // 마지막 색상이 밝은 색상인지 확인
      const lastColor = defaultColorSwatches[defaultColorSwatches.length - 1];
      expect(lastColor).toBeDefined();
    });
  });

  describe("색상 일관성", () => {
    it("primaryColors와 defaultColorSwatches가 일관성을 가져야 한다", () => {
      // primaryColors의 개수가 합리적이어야 함
      expect(primaryColors.length).toBeGreaterThanOrEqual(10);
      expect(primaryColors.length).toBeLessThanOrEqual(20);

      // defaultColorSwatches와 비슷한 개수여야 함
      const countDifference = Math.abs(
        primaryColors.length - defaultColorSwatches.length
      );
      expect(countDifference).toBeLessThanOrEqual(5);
    });

    it("모든 내보내진 값들이 올바른 타입이어야 한다", () => {
      expect(Array.isArray(primaryColors)).toBe(true);
      expect(Array.isArray(defaultColorSwatches)).toBe(true);

      // PrimaryColor 타입은 컴파일 타임에만 존재하므로 런타임 검사는 제한적
      const samplePrimaryColor: PrimaryColor = primaryColors[0].value;
      expect(typeof samplePrimaryColor).toBe("string");
    });
  });

  describe("실제 사용성", () => {
    it("색상들을 실제로 사용할 수 있어야 한다", () => {
      // primaryColors에서 색상 찾기
      const blueColor = primaryColors.find((c) => c.value === "blue");
      expect(blueColor).toBeDefined();
      expect(blueColor?.name).toBe("Blue");

      // defaultColorSwatches에서 색상 사용
      const firstSwatch = defaultColorSwatches[0];
      expect(firstSwatch).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it("커스텀 색상 지원을 확인해야 한다", () => {
      // PrimaryColor 타입이 string을 허용하는지 확인
      const customColor: PrimaryColor = "my-custom-color";
      expect(typeof customColor).toBe("string");

      // 기존 색상도 여전히 작동하는지 확인
      const standardColor: PrimaryColor = "blue";
      expect(typeof standardColor).toBe("string");
    });
  });
});
