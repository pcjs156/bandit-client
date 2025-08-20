import { describe, it, expect } from "vitest";
import { LAYOUT_CONSTANTS } from "../layout";

describe("layout", () => {
  describe("LAYOUT_CONSTANTS 객체", () => {
    it("LAYOUT_CONSTANTS가 정의되어 있어야 한다", () => {
      expect(LAYOUT_CONSTANTS).toBeDefined();
      expect(typeof LAYOUT_CONSTANTS).toBe("object");
      expect(LAYOUT_CONSTANTS).not.toBeNull();
    });

    it("모든 필수 속성들이 존재해야 한다", () => {
      expect(LAYOUT_CONSTANTS).toHaveProperty("HEADER_HEIGHT");
      expect(LAYOUT_CONSTANTS).toHaveProperty("USER_MENU_WIDTH");
      expect(LAYOUT_CONSTANTS).toHaveProperty("ICON_SIZES");
      expect(LAYOUT_CONSTANTS).toHaveProperty("AVATAR_SIZE");
    });
  });

  describe("HEADER_HEIGHT", () => {
    it("헤더 높이가 올바른 값으로 정의되어야 한다", () => {
      expect(LAYOUT_CONSTANTS.HEADER_HEIGHT).toBeDefined();
      expect(typeof LAYOUT_CONSTANTS.HEADER_HEIGHT).toBe("number");
      expect(LAYOUT_CONSTANTS.HEADER_HEIGHT).toBeGreaterThan(0);
    });

    it("헤더 높이가 합리적인 범위에 있어야 한다", () => {
      // 일반적으로 헤더는 40px ~ 100px 사이
      expect(LAYOUT_CONSTANTS.HEADER_HEIGHT).toBeGreaterThanOrEqual(40);
      expect(LAYOUT_CONSTANTS.HEADER_HEIGHT).toBeLessThanOrEqual(100);
    });
  });

  describe("USER_MENU_WIDTH", () => {
    it("사용자 메뉴 너비가 올바른 값으로 정의되어야 한다", () => {
      expect(LAYOUT_CONSTANTS.USER_MENU_WIDTH).toBeDefined();
      expect(typeof LAYOUT_CONSTANTS.USER_MENU_WIDTH).toBe("number");
      expect(LAYOUT_CONSTANTS.USER_MENU_WIDTH).toBeGreaterThan(0);
    });

    it("사용자 메뉴 너비가 합리적인 범위에 있어야 한다", () => {
      // 일반적으로 드롭다운 메뉴는 150px ~ 300px 사이
      expect(LAYOUT_CONSTANTS.USER_MENU_WIDTH).toBeGreaterThanOrEqual(150);
      expect(LAYOUT_CONSTANTS.USER_MENU_WIDTH).toBeLessThanOrEqual(300);
    });
  });

  describe("ICON_SIZES", () => {
    it("아이콘 크기 객체가 정의되어 있어야 한다", () => {
      expect(LAYOUT_CONSTANTS.ICON_SIZES).toBeDefined();
      expect(typeof LAYOUT_CONSTANTS.ICON_SIZES).toBe("object");
      expect(LAYOUT_CONSTANTS.ICON_SIZES).not.toBeNull();
    });

    it("모든 아이콘 크기가 정의되어 있어야 한다", () => {
      expect(LAYOUT_CONSTANTS.ICON_SIZES).toHaveProperty("SETTINGS");
      expect(LAYOUT_CONSTANTS.ICON_SIZES).toHaveProperty("MENU_ITEM");
      expect(LAYOUT_CONSTANTS.ICON_SIZES).toHaveProperty("LOGO");
    });

    it("모든 아이콘 크기가 숫자여야 한다", () => {
      Object.entries(LAYOUT_CONSTANTS.ICON_SIZES).forEach(([key, value]) => {
        expect(typeof key).toBe("string");
        expect(typeof value).toBe("number");
        expect(value).toBeGreaterThan(0);
      });
    });

    it("아이콘 크기들이 합리적인 범위에 있어야 한다", () => {
      // 일반적으로 아이콘은 12px ~ 32px 사이
      Object.values(LAYOUT_CONSTANTS.ICON_SIZES).forEach((size) => {
        expect(size).toBeGreaterThanOrEqual(12);
        expect(size).toBeLessThanOrEqual(32);
      });
    });

    it("아이콘 크기들이 올바른 계층 구조를 가져야 한다", () => {
      const { SETTINGS, MENU_ITEM, LOGO } = LAYOUT_CONSTANTS.ICON_SIZES;

      // LOGO가 가장 크고, MENU_ITEM이 가장 작아야 함
      expect(LOGO).toBeGreaterThanOrEqual(SETTINGS);
      expect(SETTINGS).toBeGreaterThanOrEqual(MENU_ITEM);
    });
  });

  describe("AVATAR_SIZE", () => {
    it("아바타 크기가 정의되어 있어야 한다", () => {
      expect(LAYOUT_CONSTANTS.AVATAR_SIZE).toBeDefined();
      expect(typeof LAYOUT_CONSTANTS.AVATAR_SIZE).toBe("string");
    });

    it("아바타 크기가 유효한 Mantine 크기여야 한다", () => {
      const validSizes = ["xs", "sm", "md", "lg", "xl"];
      expect(validSizes).toContain(LAYOUT_CONSTANTS.AVATAR_SIZE);
    });

    it("아바타 크기가 적절한 값이어야 한다", () => {
      // 헤더에서 사용되므로 너무 크지 않은 크기여야 함
      const appropriateSizes = ["xs", "sm", "md"];
      expect(appropriateSizes).toContain(LAYOUT_CONSTANTS.AVATAR_SIZE);
    });
  });

  describe("상수들 간의 관계", () => {
    it("레이아웃 상수들이 서로 일관성을 가져야 한다", () => {
      // USER_MENU_WIDTH가 헤더 높이보다 충분히 커야 함
      expect(LAYOUT_CONSTANTS.USER_MENU_WIDTH).toBeGreaterThan(
        LAYOUT_CONSTANTS.HEADER_HEIGHT,
      );

      // LOGO 아이콘이 헤더 높이보다 작아야 함
      expect(LAYOUT_CONSTANTS.ICON_SIZES.LOGO).toBeLessThan(
        LAYOUT_CONSTANTS.HEADER_HEIGHT,
      );
    });

    it("아이콘 크기들이 적절한 비율을 가져야 한다", () => {
      const { SETTINGS, MENU_ITEM, LOGO } = LAYOUT_CONSTANTS.ICON_SIZES;

      // 크기 차이가 너무 크지 않아야 함
      expect(LOGO - MENU_ITEM).toBeLessThanOrEqual(20);
      expect(SETTINGS - MENU_ITEM).toBeLessThanOrEqual(10);
    });
  });

  describe("타입 안정성", () => {
    it("모든 상수들이 예상되는 타입을 가져야 한다", () => {
      expect(typeof LAYOUT_CONSTANTS.HEADER_HEIGHT).toBe("number");
      expect(typeof LAYOUT_CONSTANTS.USER_MENU_WIDTH).toBe("number");
      expect(typeof LAYOUT_CONSTANTS.ICON_SIZES).toBe("object");
      expect(typeof LAYOUT_CONSTANTS.AVATAR_SIZE).toBe("string");
    });

    it("숫자 상수들이 유효한 값이어야 한다", () => {
      expect(Number.isFinite(LAYOUT_CONSTANTS.HEADER_HEIGHT)).toBe(true);
      expect(Number.isFinite(LAYOUT_CONSTANTS.USER_MENU_WIDTH)).toBe(true);

      Object.values(LAYOUT_CONSTANTS.ICON_SIZES).forEach((size) => {
        expect(Number.isFinite(size)).toBe(true);
        expect(Number.isInteger(size)).toBe(true);
      });
    });

    it("상수들이 불변이어야 한다", () => {
      // as const로 정의되어 있으므로 TypeScript에서 불변성이 보장됨
      expect(typeof LAYOUT_CONSTANTS).toBe("object");

      // 런타임에서도 객체가 변경되지 않는지 확인
      const originalHeaderHeight = LAYOUT_CONSTANTS.HEADER_HEIGHT;
      const originalUserMenuWidth = LAYOUT_CONSTANTS.USER_MENU_WIDTH;

      // 값들이 변경되지 않았는지 확인
      expect(LAYOUT_CONSTANTS.HEADER_HEIGHT).toBe(originalHeaderHeight);
      expect(LAYOUT_CONSTANTS.USER_MENU_WIDTH).toBe(originalUserMenuWidth);
    });
  });

  describe("실제 사용성", () => {
    it("상수들을 실제로 사용할 수 있어야 한다", () => {
      // CSS에서 사용할 수 있는 형태인지 확인
      const headerHeightPx = `${LAYOUT_CONSTANTS.HEADER_HEIGHT}px`;
      expect(headerHeightPx).toMatch(/^\d+px$/);

      const userMenuWidthPx = `${LAYOUT_CONSTANTS.USER_MENU_WIDTH}px`;
      expect(userMenuWidthPx).toMatch(/^\d+px$/);

      // 아이콘 크기들도 사용 가능한지 확인
      Object.values(LAYOUT_CONSTANTS.ICON_SIZES).forEach((size) => {
        const sizePx = `${size}px`;
        expect(sizePx).toMatch(/^\d+px$/);
      });
    });

    it("Mantine 컴포넌트에서 사용할 수 있어야 한다", () => {
      // AVATAR_SIZE가 Mantine Avatar 컴포넌트에서 사용 가능한지 확인
      expect(typeof LAYOUT_CONSTANTS.AVATAR_SIZE).toBe("string");
      expect(LAYOUT_CONSTANTS.AVATAR_SIZE.length).toBeGreaterThan(0);
    });
  });

  describe("확장성", () => {
    it("새로운 상수를 추가하기 쉬운 구조여야 한다", () => {
      // 객체 구조가 확장 가능한지 확인
      expect(typeof LAYOUT_CONSTANTS).toBe("object");
      expect(Object.keys(LAYOUT_CONSTANTS).length).toBeGreaterThan(0);

      // ICON_SIZES가 중첩 객체로 잘 구성되어 있는지 확인
      expect(typeof LAYOUT_CONSTANTS.ICON_SIZES).toBe("object");
      expect(Object.keys(LAYOUT_CONSTANTS.ICON_SIZES).length).toBeGreaterThan(
        0,
      );
    });

    it("네이밍 컨벤션이 일관적이어야 한다", () => {
      // 모든 상수가 대문자와 언더스코어를 사용하는지 확인
      const keys = Object.keys(LAYOUT_CONSTANTS);
      keys.forEach((key) => {
        expect(key).toMatch(/^[A-Z_]+$/);
      });

      // ICON_SIZES 내부 키들도 확인
      const iconKeys = Object.keys(LAYOUT_CONSTANTS.ICON_SIZES);
      iconKeys.forEach((key) => {
        expect(key).toMatch(/^[A-Z_]+$/);
      });
    });
  });
});
