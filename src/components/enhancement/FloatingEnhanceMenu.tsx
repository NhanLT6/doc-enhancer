import { ActionIcon, Group, Paper, Text, Tooltip } from '@mantine/core';
import { IconSparkles, IconEdit } from '@tabler/icons-react';
import { useState, useEffect, useRef } from 'react';

interface FloatingEnhanceMenuProps {
  containerRef: React.RefObject<HTMLElement>;
  onAutoEnhance: (selectedText: string, range: Range) => void;
  onCustomEnhance: (selectedText: string, range: Range) => void;
}

export function FloatingEnhanceMenu({
  containerRef,
  onAutoEnhance,
  onCustomEnhance,
}: FloatingEnhanceMenuProps) {
  const [selectedText, setSelectedText] = useState('');
  const [selectedRange, setSelectedRange] = useState<Range | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (!text || text.length === 0) {
        setShowMenu(false);
        return;
      }

      // Check if selection is within our container
      if (containerRef.current && selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const isWithinContainer = containerRef.current.contains(range.commonAncestorContainer);

        if (isWithinContainer) {
          setSelectedText(text);
          setSelectedRange(range);

          // Get selection bounding rect
          const rect = range.getBoundingClientRect();

          // Position menu above selection
          setPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
          });

          setShowMenu(true);
        } else {
          setShowMenu(false);
        }
      }
    };

    // Add selection listener
    document.addEventListener('selectionchange', handleSelectionChange);

    // Hide menu on click outside
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        const selection = window.getSelection();
        if (selection && selection.toString().trim().length === 0) {
          setShowMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [containerRef]);

  const handleAutoEnhance = () => {
    if (selectedRange) {
      onAutoEnhance(selectedText, selectedRange);
      setShowMenu(false);
      // Clear selection
      window.getSelection()?.removeAllRanges();
    }
  };

  const handleCustomEnhance = () => {
    if (selectedRange) {
      onCustomEnhance(selectedText, selectedRange);
      setShowMenu(false);
    }
  };

  if (!showMenu) return null;

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -100%)',
        zIndex: 1000,
        animation: 'fadeInScale 0.2s ease-out',
      }}
    >
      <Paper shadow="md" p="xs" radius="md" withBorder>
        <Group gap="xs">
          <Tooltip label="Auto enhance selected text" position="top">
            <ActionIcon
              size="lg"
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
              onClick={handleAutoEnhance}
            >
              <IconSparkles size={18} />
            </ActionIcon>
          </Tooltip>

          <div style={{ width: 1, height: 24, backgroundColor: 'var(--mantine-color-gray-4)' }} />

          <Tooltip label="Custom prompt or ask question" position="top">
            <ActionIcon
              size="lg"
              variant="light"
              color="blue"
              onClick={handleCustomEnhance}
            >
              <IconEdit size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Paper>

      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: translate(-50%, -100%) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -100%) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
