import { describe, it, expect, beforeEach, vi } from "vitest";
import { useThemeStore } from "../themeStore";
import type { CustomColor } from "../themeStore";
import type { PrimaryColor } from "@src/constants/colors";

// generateColors 모킹
vi.mock("@mantine/colors-generator", () => ({
  generateColors: vi.fn((color: string) => [
    `${color}0`,
    `${color}1`,
    `${color}2`,
    `${color}3`,
    `${color}4`,
    `${color}5`,
    `${color}6`,
    `${color}7`,
    `${color}8`,
    `${color}9`,
  ]),
}));

// Date.now 모킹 (일관된 테스트를 위해)
const mockTimestamp = 1234567890;
vi.spyOn(Date, "now").mockReturnValue(mockTimestamp);

describe("themeStore", () => {
  beforeEach(() => {
    // 각 테스트 전에 스토어 초기화
    useThemeStore.setState({
      colorScheme: "dark",
      primaryColor: "red",
      customColors: [],
    });
  });

  describe("초기 상태", () => {
    it("기본값으로 초기화되어야 한다", () => {
      const state = useThemeStore.getState();

      expect(state.colorScheme).toBe("dark");
      expect(state.primaryColor).toBe("red");
      expect(state.customColors).toEqual([]);
    });
  });

  describe("toggleColorScheme", () => {
    it("dark에서 light로 변경되어야 한다", () => {
      const { toggleColorScheme } = useThemeStore.getState();

      toggleColorScheme();

      expect(useThemeStore.getState().colorScheme).toBe("light");
    });

    it("light에서 dark로 변경되어야 한다", () => {
      // 초기 상태를 light로 설정
      useThemeStore.setState({ colorScheme: "light" });

      const { toggleColorScheme } = useThemeStore.getState();
      toggleColorScheme();

      expect(useThemeStore.getState().colorScheme).toBe("dark");
    });

    it("여러 번 토글해도 올바르게 동작해야 한다", () => {
      const { toggleColorScheme } = useThemeStore.getState();

      // dark -> light
      toggleColorScheme();
      expect(useThemeStore.getState().colorScheme).toBe("light");

      // light -> dark
      toggleColorScheme();
      expect(useThemeStore.getState().colorScheme).toBe("dark");

      // dark -> light
      toggleColorScheme();
      expect(useThemeStore.getState().colorScheme).toBe("light");
    });
  });

  describe("setPrimaryColor", () => {
    it("primary color를 변경할 수 있어야 한다", () => {
      const { setPrimaryColor } = useThemeStore.getState();

      setPrimaryColor("blue");

      expect(useThemeStore.getState().primaryColor).toBe("blue");
    });

    it("여러 색상으로 변경할 수 있어야 한다", () => {
      const { setPrimaryColor } = useThemeStore.getState();

      setPrimaryColor("green");
      expect(useThemeStore.getState().primaryColor).toBe("green");

      setPrimaryColor("purple");
      expect(useThemeStore.getState().primaryColor).toBe("purple");
    });

    it("커스텀 색상 ID로도 설정할 수 있어야 한다", () => {
      const { setPrimaryColor } = useThemeStore.getState();

      setPrimaryColor("custom-123456" as PrimaryColor);

      expect(useThemeStore.getState().primaryColor).toBe("custom-123456");
    });
  });

  describe("addCustomColor", () => {
    it("새로운 커스텀 색상을 추가할 수 있어야 한다", () => {
      const { addCustomColor } = useThemeStore.getState();

      addCustomColor("내 색상", "#ff0000");

      const state = useThemeStore.getState();
      expect(state.customColors).toHaveLength(1);

      const customColor = state.customColors[0];
      expect(customColor.id).toBe(`custom-${mockTimestamp}`);
      expect(customColor.name).toBe("내 색상");
      expect(customColor.value).toBe("#ff0000");
      expect(customColor.shades).toEqual([
        "#ff00000",
        "#ff00001",
        "#ff00002",
        "#ff00003",
        "#ff00004",
        "#ff00005",
        "#ff00006",
        "#ff00007",
        "#ff00008",
        "#ff00009",
      ]);
    });

    it("여러 커스텀 색상을 추가할 수 있어야 한다", () => {
      const { addCustomColor } = useThemeStore.getState();

      addCustomColor("빨강", "#ff0000");
      addCustomColor("파랑", "#0000ff");

      const state = useThemeStore.getState();
      expect(state.customColors).toHaveLength(2);
      expect(state.customColors[0].name).toBe("빨강");
      expect(state.customColors[1].name).toBe("파랑");
    });

    it("기존 커스텀 색상을 유지하면서 새 색상을 추가해야 한다", () => {
      // 초기 커스텀 색상 설정
      const initialColor: CustomColor = {
        id: "custom-existing",
        name: "기존 색상",
        value: "#00ff00",
        shades: [
          "#00ff000",
          "#00ff001",
          "#00ff002",
          "#00ff003",
          "#00ff004",
          "#00ff005",
          "#00ff006",
          "#00ff007",
          "#00ff008",
          "#00ff009",
        ],
      };
      useThemeStore.setState({ customColors: [initialColor] });

      const { addCustomColor } = useThemeStore.getState();
      addCustomColor("새 색상", "#ff0000");

      const state = useThemeStore.getState();
      expect(state.customColors).toHaveLength(2);
      expect(state.customColors[0]).toEqual(initialColor);
      expect(state.customColors[1].name).toBe("새 색상");
    });
  });

  describe("removeCustomColor", () => {
    const mockCustomColors: CustomColor[] = [
      {
        id: "custom-1",
        name: "색상 1",
        value: "#ff0000",
        shades: [
          "#ff00000",
          "#ff00001",
          "#ff00002",
          "#ff00003",
          "#ff00004",
          "#ff00005",
          "#ff00006",
          "#ff00007",
          "#ff00008",
          "#ff00009",
        ],
      },
      {
        id: "custom-2",
        name: "색상 2",
        value: "#00ff00",
        shades: [
          "#00ff000",
          "#00ff001",
          "#00ff002",
          "#00ff003",
          "#00ff004",
          "#00ff005",
          "#00ff006",
          "#00ff007",
          "#00ff008",
          "#00ff009",
        ],
      },
      {
        id: "custom-3",
        name: "색상 3",
        value: "#0000ff",
        shades: [
          "#0000ff0",
          "#0000ff1",
          "#0000ff2",
          "#0000ff3",
          "#0000ff4",
          "#0000ff5",
          "#0000ff6",
          "#0000ff7",
          "#0000ff8",
          "#0000ff9",
        ],
      },
    ];

    beforeEach(() => {
      useThemeStore.setState({ customColors: [...mockCustomColors] });
    });

    it("지정된 ID의 커스텀 색상을 삭제할 수 있어야 한다", () => {
      const { removeCustomColor } = useThemeStore.getState();

      removeCustomColor("custom-2");

      const state = useThemeStore.getState();
      expect(state.customColors).toHaveLength(2);
      expect(
        state.customColors.find((c) => c.id === "custom-2")
      ).toBeUndefined();
      expect(state.customColors.find((c) => c.id === "custom-1")).toBeDefined();
      expect(state.customColors.find((c) => c.id === "custom-3")).toBeDefined();
    });

    it("존재하지 않는 ID로 삭제를 시도해도 에러가 발생하지 않아야 한다", () => {
      const { removeCustomColor } = useThemeStore.getState();

      expect(() => removeCustomColor("non-existent")).not.toThrow();

      const state = useThemeStore.getState();
      expect(state.customColors).toHaveLength(3); // 변화 없음
    });

    it("현재 선택된 primary color가 삭제되면 red로 변경되어야 한다", () => {
      // primary color를 삭제할 커스텀 색상으로 설정
      useThemeStore.setState({ primaryColor: "custom-2" as PrimaryColor });

      const { removeCustomColor } = useThemeStore.getState();
      removeCustomColor("custom-2");

      const state = useThemeStore.getState();
      expect(state.primaryColor).toBe("red");
      expect(state.customColors).toHaveLength(2);
    });

    it("현재 선택된 primary color가 삭제되지 않으면 primary color는 유지되어야 한다", () => {
      // primary color를 삭제하지 않을 커스텀 색상으로 설정
      useThemeStore.setState({ primaryColor: "custom-1" as PrimaryColor });

      const { removeCustomColor } = useThemeStore.getState();
      removeCustomColor("custom-2");

      const state = useThemeStore.getState();
      expect(state.primaryColor).toBe("custom-1");
      expect(state.customColors).toHaveLength(2);
    });

    it("기본 primary color인 경우 삭제해도 변경되지 않아야 한다", () => {
      // primary color가 기본값 red인 상태
      useThemeStore.setState({ primaryColor: "red" });

      const { removeCustomColor } = useThemeStore.getState();
      removeCustomColor("custom-2");

      const state = useThemeStore.getState();
      expect(state.primaryColor).toBe("red");
    });
  });

  describe("상태 불변성", () => {
    it("addCustomColor 후 기존 customColors 배열이 변경되지 않아야 한다", () => {
      const initialColors = useThemeStore.getState().customColors;
      const { addCustomColor } = useThemeStore.getState();

      addCustomColor("테스트", "#123456");

      const newColors = useThemeStore.getState().customColors;
      expect(newColors).not.toBe(initialColors); // 참조가 다름
      expect(initialColors).toEqual([]); // 원본 배열은 변경되지 않음
    });

    it("removeCustomColor 후 기존 customColors 배열이 변경되지 않아야 한다", () => {
      const mockColors: CustomColor[] = [
        {
          id: "custom-test",
          name: "테스트",
          value: "#123456",
          shades: [
            "#1234560",
            "#1234561",
            "#1234562",
            "#1234563",
            "#1234564",
            "#1234565",
            "#1234566",
            "#1234567",
            "#1234568",
            "#1234569",
          ],
        },
      ];

      useThemeStore.setState({ customColors: mockColors });
      const initialColors = useThemeStore.getState().customColors;

      const { removeCustomColor } = useThemeStore.getState();
      removeCustomColor("custom-test");

      const newColors = useThemeStore.getState().customColors;
      expect(newColors).not.toBe(initialColors); // 참조가 다름
      expect(initialColors).toHaveLength(1); // 원본 배열은 변경되지 않음
    });
  });
});
