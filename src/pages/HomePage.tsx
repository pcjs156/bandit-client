import {
  Container,
  Title,
  Button,
  Group,
  Stack,
  Text,
  Card,
} from "@mantine/core";
import { Link } from "react-router-dom";
import { useAuthStore } from "@src/stores/authStore";

function HomePage() {
  const { user, status } = useAuthStore();

  if (status === "authenticated" && user) {
    return (
      <Container size="md">
        <Stack align="center" gap="xl" mt={100}>
          <Title
            order={1}
            size="3rem"
            ta="center"
            fw={900}
            c="var(--mantine-primary-color-6)"
          >
            환영합니다, {user.nickname}님!
          </Title>

          <Text size="lg" ta="center" c="dimmed">
            밴드 활동을 시작해보세요
          </Text>

          <Group>
            <Button size="lg">밴드 만들기</Button>
            <Button variant="outline" size="lg">
              밴드 찾기
            </Button>
          </Group>

          <Card
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            w="100%"
            maw={600}
          >
            <Stack gap="md">
              <Title order={3}>빠른 시작</Title>
              <Text size="sm" c="dimmed">
                • 새로운 밴드를 만들어 멤버를 모집하세요
              </Text>
              <Text size="sm" c="dimmed">
                • 기존 밴드에 가입 요청을 보내세요
              </Text>
              <Text size="sm" c="dimmed">
                • 설정에서 프로필을 꾸며보세요
              </Text>
            </Stack>
          </Card>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="sm">
      <Stack align="center" gap="xl" mt={100}>
        <Title
          order={1}
          size="4rem"
          ta="center"
          fw={900}
          c="var(--mantine-primary-color-6)"
        >
          Bandit
        </Title>

        <Group>
          <Button size="lg" component={Link} to="/register">
            회원가입
          </Button>
          <Button variant="outline" size="lg" component={Link} to="/login">
            로그인
          </Button>
        </Group>
      </Stack>
    </Container>
  );
}

export default HomePage;
