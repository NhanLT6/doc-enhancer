/**
 * Settings page for managing Confluence credentials and configuration
 */

import {
  Alert,
  Button,
  Code,
  Container,
  Divider,
  Group,
  List,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconCheck, IconCloud, IconKey } from '@tabler/icons-react';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { clearSettings, getSettings, isValidConfluenceUrl, saveSettings } from '@/lib/settings';
import { storage } from '@/lib/storage';

// Zod schema for settings form validation
const settingsSchema = z.object({
  confluenceToken: z.string().min(1, 'Confluence API token is required'),
  confluenceEmail: z.email('Invalid email format'),
  confluenceBaseUrl: z
    .string()
    .min(1, 'Confluence base URL is required')
    .refine((url) => isValidConfluenceUrl(url), {
      message: 'Invalid Confluence URL (should be https://your-domain.atlassian.net)',
    }),
});

export function Settings() {
  const [isSaved, setIsSaved] = useState(false);

  const form = useForm({
    initialValues: {
      confluenceToken: '',
      confluenceEmail: '',
      confluenceBaseUrl: '',
    },
    validate: zod4Resolver(settingsSchema),
  });

  // Load existing settings on mount
  useEffect(() => {
    const settings = getSettings();
    if (settings) {
      form.setValues({
        confluenceToken: settings.confluenceToken,
        confluenceEmail: settings.confluenceEmail,
        confluenceBaseUrl: settings.confluenceBaseUrl,
      });
      setIsSaved(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.setValues]);

  const handleSubmit = (values: typeof form.values) => {
    try {
      saveSettings({
        confluenceToken: values.confluenceToken,
        confluenceEmail: values.confluenceEmail,
        confluenceBaseUrl: values.confluenceBaseUrl,
      });

      setIsSaved(true);

      notifications.show({
        title: 'Settings Saved',
        message: 'Your Confluence credentials have been saved successfully',
        color: 'green',
        icon: <IconCheck size={18} />,
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save settings',
        color: 'red',
      });
    }
  };

  const handleClearSettings = () => {
    if (window.confirm('Are you sure you want to clear all settings?')) {
      clearSettings();
      form.reset();
      setIsSaved(false);

      notifications.show({
        title: 'Settings Cleared',
        message: 'Your settings have been cleared',
        color: 'blue',
      });
    }
  };

  const handleClearAllData = () => {
    if (
      window.confirm(
        'Are you sure you want to clear ALL data? This will delete all documents, enhancements, and settings. This cannot be undone.'
      )
    ) {
      storage.clearAll();
      clearSettings();
      form.reset();
      setIsSaved(false);

      notifications.show({
        title: 'All Data Cleared',
        message: 'All documents, enhancements, and settings have been deleted',
        color: 'orange',
      });
    }
  };

  const storageInfo = storage.getStorageSize();

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <div>
          <Title order={2}>Settings</Title>
          <Text size="sm" c="dimmed">
            Configure your Confluence credentials and app settings
          </Text>
        </div>

        {/* Success Alert */}
        {isSaved && (
          <Alert
            icon={<IconCheck size={16} />}
            title="Settings Configured"
            color="green"
            variant="light"
          >
            Your Confluence credentials are saved and ready to use.
          </Alert>
        )}

        {/* Confluence Settings */}
        <Paper p="xl" withBorder radius="md">
          <Stack gap="lg">
            <Group gap="sm">
              <IconCloud size={24} color="var(--mantine-color-blue-6)" />
              <div>
                <Text fw={600} size="lg">
                  Confluence Configuration
                </Text>
                <Text size="sm" c="dimmed">
                  Connect to your Confluence instance
                </Text>
              </div>
            </Group>

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="md">
                <TextInput
                  label="Confluence Base URL"
                  placeholder="https://your-domain.atlassian.net"
                  description="Your Confluence instance URL (without /wiki)"
                  required
                  {...form.getInputProps('confluenceBaseUrl')}
                />

                <TextInput
                  label="Email Address"
                  placeholder="your.email@company.com"
                  description="Your Confluence account email"
                  required
                  {...form.getInputProps('confluenceEmail')}
                />

                <PasswordInput
                  label="API Token"
                  placeholder="Your Confluence API token"
                  description="Create one at: id.atlassian.com/manage-profile/security/api-tokens"
                  required
                  {...form.getInputProps('confluenceToken')}
                />

                <Button type="submit" leftSection={<IconKey size={18} />}>
                  Save Credentials
                </Button>
              </Stack>
            </form>
          </Stack>
        </Paper>

        {/* How to Get API Token */}
        <Paper p="lg" withBorder radius="md" bg="blue.0">
          <Stack gap="sm">
            <Group gap="xs">
              <IconAlertCircle size={20} color="var(--mantine-color-blue-6)" />
              <Text fw={600}>How to get your Confluence API token:</Text>
            </Group>
            <List size="sm" spacing="xs">
              <List.Item>
                Go to{' '}
                <Code>
                  <a
                    href="https://id.atlassian.com/manage-profile/security/api-tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    id.atlassian.com/manage-profile/security/api-tokens
                  </a>
                </Code>
              </List.Item>
              <List.Item>Click "Create API token"</List.Item>
              <List.Item>Give it a name (e.g., "Doc Enhancer")</List.Item>
              <List.Item>Copy the token and paste it above</List.Item>
            </List>
          </Stack>
        </Paper>

        <Divider />

        {/* Storage Info */}
        <Paper p="lg" withBorder radius="md">
          <Stack gap="md">
            <div>
              <Text fw={600} size="lg">
                Storage Information
              </Text>
              <Text size="sm" c="dimmed">
                Data stored locally in your browser
              </Text>
            </div>

            <Group gap="xl">
              <div>
                <Text size="xs" c="dimmed">
                  Documents
                </Text>
                <Text fw={600}>{storage.getDocuments().length}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">
                  Enhancements
                </Text>
                <Text fw={600}>{storage.getHistory().length}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">
                  Storage Used
                </Text>
                <Text fw={600}>{storageInfo.percentage.toFixed(1)}%</Text>
              </div>
            </Group>
          </Stack>
        </Paper>

        {/* Danger Zone */}
        <Paper p="lg" withBorder radius="md" style={{ borderColor: 'var(--mantine-color-red-3)' }}>
          <Stack gap="md">
            <div>
              <Text fw={600} size="lg" c="red">
                Danger Zone
              </Text>
              <Text size="sm" c="dimmed">
                Irreversible actions
              </Text>
            </div>

            <Group gap="md">
              <Button variant="light" color="orange" onClick={handleClearSettings}>
                Clear Settings Only
              </Button>
              <Button variant="light" color="red" onClick={handleClearAllData}>
                Clear All Data
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
