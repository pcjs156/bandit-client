import { Container, Title, Stack } from "@mantine/core";
import ThemeSection from "@src/components/settings/ThemeSection";
import PrimaryColorSection from "@src/components/settings/PrimaryColorSection";

function SettingsPage() {
  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Title order={1}>설정</Title>
        <ThemeSection />
        <PrimaryColorSection />
      </Stack>
    </Container>
  );
}

export default SettingsPage;
