import {
  Card,
  Stack,
  Title,
  Text,
  Group,
  SimpleGrid,
  ActionIcon,
  Divider,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useState, useCallback } from "react";
import { useThemeStore } from "@src/stores/themeStore";
import { primaryColors } from "@src/constants/colors";
import ColorButton from "@src/components/settings/ColorButton";
import CustomColorItem from "@src/components/settings/CustomColorItem";
import AddColorModal from "@src/components/settings/AddColorModal";

function PrimaryColorSection() {
  const {
    primaryColor,
    customColors,
    setPrimaryColor,
    addCustomColor,
    removeCustomColor,
  } = useThemeStore();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddColor = useCallback(
    (name: string, color: string) => {
      addCustomColor(name, color);
    },
    [addCustomColor],
  );

  return (
    <>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Title order={3}>Primary Color</Title>
            <ActionIcon
              variant="light"
              size="lg"
              onClick={() => setIsModalOpen(true)}
              aria-label="커스텀 색상 추가"
            >
              <IconPlus size={18} />
            </ActionIcon>
          </Group>
          <Text c="dimmed" size="sm">
            앱의 메인 색상을 선택할 수 있습니다.
          </Text>

          {/* 기본 색상들 */}
          <SimpleGrid
            cols={{ base: 2, sm: 3, md: 4 }}
            spacing="sm"
            role="group"
            aria-label="기본 색상 선택"
          >
            {primaryColors.map((color) => (
              <ColorButton
                key={color.value}
                color={color}
                isSelected={primaryColor === color.value}
                onClick={() => setPrimaryColor(color.value)}
              />
            ))}
          </SimpleGrid>

          {/* 커스텀 색상들 */}
          {customColors.length > 0 && (
            <>
              <Divider />
              <Text fw={500} size="sm">
                커스텀 색상
              </Text>
              <SimpleGrid
                cols={{ base: 1, sm: 2, md: 3 }}
                spacing="sm"
                role="group"
                aria-label="커스텀 색상 선택"
              >
                {customColors.map((color) => (
                  <CustomColorItem
                    key={color.id}
                    color={color}
                    isSelected={primaryColor === color.id}
                    onSelect={() => setPrimaryColor(color.id)}
                    onRemove={() => removeCustomColor(color.id)}
                  />
                ))}
              </SimpleGrid>
            </>
          )}
        </Stack>
      </Card>

      <AddColorModal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddColor={handleAddColor}
      />
    </>
  );
}

export default PrimaryColorSection;
