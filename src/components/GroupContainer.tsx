import React from 'react';
import { Paper, Typography } from '@mui/material';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import StudentCard from './StudentCard';
import { Group } from '../types';

interface GroupContainerProps {
  group: Group;
  index: number;
  originalIndex: number;
}

const GroupContainer: React.FC<GroupContainerProps> = ({ group, index, originalIndex }) => {
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
    <div ref={setGroupRef} style={style}>
      <Paper
        elevation={3}
        sx={{
          p: 2,
          m: 2,
          minWidth: 280,
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
        <Typography variant="h6" sx={{ mb: 2, color: '#334155' }}>
          Group {originalIndex + 1} ({group.students.length} students)
        </Typography>
        <div
          ref={setDroppableRef}
          style={{
            minHeight: 100,
            borderRadius: 4,
            padding: 8,
            backgroundColor: isOver ? '#e2e8f0' : '#f1f5f9',
            transition: 'background-color 0.2s ease',
          }}
        >
          <SortableContext 
            items={group.students.map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {group.students.map((student) => (
              <StudentCard
                key={student.id}
                id={student.id}
                name={student.name}
                groupId={group.id}
              />
            ))}
          </SortableContext>
        </div>
      </Paper>
    </div>
  );
};

export default GroupContainer;