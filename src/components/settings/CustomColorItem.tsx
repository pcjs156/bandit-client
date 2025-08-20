import { Group, Button, ColorSwatch, ActionIcon } from "@mantine/core";
import { memo } from "react";
import { IconTrash } from "@tabler/icons-react";
import type { CustomColor } from "@src/stores/themeStore";

interface CustomColorItemProps {
  color: CustomColor;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

const CustomColorItem = memo(function CustomColorItem({
  color,
  isSelected,
  onSelect,
  onRemove,
}: CustomColorItemProps) {
  return (
    <Group gap="xs" justify="space-between" wrap="nowrap">
      <Button
        variant={isSelected ? "filled" : "outline"}
        size="sm"
        flex={1}
        h="auto"
        py="xs"
        leftSection={<ColorSwatch color={color.value} size={16} />}
        onClick={onSelect}
        aria-label={`${color.name} 커스텀 색상${
          isSelected ? " (현재 선택됨)" : ""
        }`}
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
      <ActionIcon
        variant="subtle"
        color="red"
        size="sm"
        onClick={onRemove}
        aria-label={`${color.name} 색상 삭제`}
      >
        <IconTrash size={14} />
      </ActionIcon>
    </Group>
  );
});

CustomColorItem.displayName = "CustomColorItem";

export default CustomColorItem;
