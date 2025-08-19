import { Button, ColorSwatch } from "@mantine/core";
import { memo } from "react";
import type { PrimaryColor } from "@src/constants/colors";

interface ColorButtonProps {
  color: {
    name: string;
    value: PrimaryColor;
  };
  isSelected: boolean;
  onClick: () => void;
}

const ColorButton = memo(function ColorButton({
  color,
  isSelected,
  onClick,
}: ColorButtonProps) {
  return (
    <Button
      variant={isSelected ? "filled" : "outline"}
      size="sm"
      fullWidth
      h="auto"
      py="xs"
      leftSection={
        <ColorSwatch
          color={`var(--mantine-color-${color.value}-6)`}
          size={16}
        />
      }
      onClick={onClick}
      aria-label={`${color.name} 색상${isSelected ? " (현재 선택됨)" : ""}`}
      aria-pressed={isSelected}
      role="button"
      tabIndex={0}
      styles={{
        inner: {
          justifyContent: "flex-start",
        },
        label: {
          fontSize: "0.75rem",
          fontWeight: 500,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        },
      }}
    >
      {color.name}
    </Button>
  );
});

export default ColorButton;
