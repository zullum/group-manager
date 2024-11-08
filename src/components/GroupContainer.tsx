import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ArrowBack,
  ArrowForward,
  Group as GroupIcon,
} from '@mui/icons-material';
import { IconButton, Paper, Typography } from '@mui/material';
import React from 'react';
import { Group } from '../types';
import StudentCard from './StudentCard';

interface GroupContainerProps {
  group: Group;
  groups: Group[];
  originalIndex: number;
  onKeyDown: (e: React.KeyboardEvent) => void;
  tabIndex: number;
  'aria-grabbed': boolean;
  'aria-label': string;
  onMoveGroupUp: () => void;
  onMoveGroupDown: () => void;
  onMoveGroupLeft: () => void;
  onMoveGroupRight: () => void;
  moveStudentWithinGroup: (
    groupId: string,
    studentId: string,
    direction: 'up' | 'down'
  ) => void;
  moveStudentBetweenGroups: (
    studentId: string,
    fromGroupId: string,
    toGroupId: string
  ) => void;
}

const GroupContainer: React.FC<GroupContainerProps> = ({
  group,
  groups,
  originalIndex,
  onKeyDown,
  tabIndex,
  'aria-grabbed': ariaGrabbed,
  'aria-label': ariaLabel,
  onMoveGroupLeft,
  onMoveGroupRight,
  moveStudentWithinGroup,
  moveStudentBetweenGroups,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef: setGroupRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: group.id,
    data: {
      type: 'group',
      groupId: group.id,
    },
  });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `${group.id}-droppable`,
    data: {
      type: 'group',
      groupId: group.id,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setGroupRef}
      style={style}
      role="group"
      tabIndex={tabIndex}
      aria-grabbed={ariaGrabbed}
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
    >
      <Paper
        elevation={3}
        sx={{
          p: 1,
          m: 1,
          minWidth: 260,
          backgroundColor: '#f8fafc',
          cursor: 'grab',
          transition: 'background-color 0.2s ease',
          ...(isOver && {
            backgroundColor: '#e2e8f0',
          }),
        }}
        {...attributes}
        {...listeners}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <IconButton
            aria-label="Move group left"
            onClick={onMoveGroupLeft}
            size="small"
          >
            <ArrowBack fontSize="small" />
          </IconButton>
          <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <GroupIcon fontSize="small" />
            <Typography variant="h6" sx={{ mb: 0, color: '#334155', ml: 0.5 }}>
              Group {originalIndex + 1} ({group.students.length} students)
            </Typography>
          </div>
          <IconButton
            aria-label="Move group right"
            onClick={onMoveGroupRight}
            size="small"
          >
            <ArrowForward fontSize="small" />
          </IconButton>
        </div>
        <div
          ref={setDroppableRef}
          style={{
            minHeight: 80,
            borderRadius: 4,
            padding: 4,
            backgroundColor: isOver ? '#e2e8f0' : '#f1f5f9',
            transition: 'background-color 0.2s ease',
          }}
        >
          <SortableContext
            items={group.students.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {group.students.map((student) => (
              <StudentCard
                key={student.id}
                id={student.id}
                name={student.name}
                groupId={group.id}
                onMoveUp={() =>
                  moveStudentWithinGroup(group.id, student.id, 'up')
                }
                onMoveDown={() =>
                  moveStudentWithinGroup(group.id, student.id, 'down')
                }
                onMoveLeft={(currentGroupId) => {
                  const currentIndex = groups.findIndex(
                    (g) => g.id === currentGroupId
                  );
                  const targetGroupId =
                    groups[currentIndex - 1]?.id ||
                    groups[groups.length - 1].id;
                  moveStudentBetweenGroups(
                    student.id,
                    currentGroupId,
                    targetGroupId
                  );
                }}
                onMoveRight={(currentGroupId) => {
                  const currentIndex = groups.findIndex(
                    (g) => g.id === currentGroupId
                  );
                  const targetGroupId =
                    groups[currentIndex + 1]?.id || groups[0].id;
                  moveStudentBetweenGroups(
                    student.id,
                    currentGroupId,
                    targetGroupId
                  );
                }}
              />
            ))}
          </SortableContext>
        </div>
      </Paper>
    </div>
  );
};

export default GroupContainer;
