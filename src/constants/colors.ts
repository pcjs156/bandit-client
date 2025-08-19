/**
 * Mantine 기본 색상 및 사용자 정의 색상을 지원하는 Primary Color 타입
 * 기본 색상 외에도 사용자가 추가한 커스텀 색상의 ID도 허용
 */
export type PrimaryColor =
  | "dark"
  | "gray"
  | "red"
  | "pink"
  | "grape"
  | "violet"
  | "indigo"
  | "blue"
  | "cyan"
  | "teal"
  | "green"
  | "lime"
  | "yellow"
  | "orange"
  | string; // 커스텀 색상 지원

export const primaryColors: { name: string; value: PrimaryColor }[] = [
  { name: "Dark", value: "dark" },
  { name: "Gray", value: "gray" },
  { name: "Red", value: "red" },
  { name: "Pink", value: "pink" },
  { name: "Grape", value: "grape" },
  { name: "Violet", value: "violet" },
  { name: "Indigo", value: "indigo" },
  { name: "Blue", value: "blue" },
  { name: "Cyan", value: "cyan" },
  { name: "Teal", value: "teal" },
  { name: "Green", value: "green" },
  { name: "Lime", value: "lime" },
  { name: "Yellow", value: "yellow" },
  { name: "Orange", value: "orange" },
];

export const defaultColorSwatches = [
  "#25262b",
  "#868e96",
  "#fa5252",
  "#e64980",
  "#be4bdb",
  "#7950f2",
  "#4c6ef5",
  "#228be6",
  "#15aabf",
  "#12b886",
  "#40c057",
  "#82c91e",
  "#fab005",
  "#fd7e14",
];
