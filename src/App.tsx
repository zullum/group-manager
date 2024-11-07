import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Button, Container, Typography, Box } from '@mui/material';
import { Shuffle } from 'lucide-react';
import GroupContainer from './components/GroupContainer';
import StudentCard from './components/StudentCard';
import { Student, Group, DragData } from './types';
import {
  reorderGroups,
  moveStudent,
  reorderStudentsInGroup,
} from './utils/dnd';

const initialStudents: Student[] = Array.from({ length: 30 }, (_, i) => ({
  id: `student-${i + 1}`,
  name: `Student ${i + 1}`,
}));

function App() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  const [originalIndices, setOriginalIndices] = useState<
    Record<string, number>
  >({});

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const generateGroups = () => {
    const shuffledStudents = [...initialStudents].sort(
      () => Math.random() - 0.5
    );
    const groupSize = 5;
    const newGroups: Group[] = [];
    const newIndices: Record<string, number> = {};

    for (let i = 0; i < shuffledStudents.length; i += groupSize) {
      const groupId = `group-${newGroups.length + 1}`;
      newGroups.push({
        id: groupId,
        students: shuffledStudents.slice(i, i + groupSize),
      });
      newIndices[groupId] = newGroups.length - 1;
    }

    setGroups(newGroups);
    setOriginalIndices(newIndices);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const dragData = active.data.current as DragData;

    if (dragData.type === 'student') {
      const student = groups
        .flatMap((g) => g.students)
        .find((s) => s.id === active.id);
      if (student) {
        setActiveStudent(student);
      }
    }

    setActiveId(active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const dragData = active.data.current as DragData;

    if (dragData.type === 'student' && over.data.current?.groupId) {
      const activeGroupId = dragData.groupId;
      const overGroupId = over.data.current.groupId;

      if (activeGroupId && activeGroupId !== overGroupId) {
        setGroups((groups) =>
          moveStudent(groups, activeGroupId, overGroupId, active.id as string)
        );
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      setActiveStudent(null);
      return;
    }

    const dragData = active.data.current as DragData;

    if (dragData.type === 'group') {
      const activeIndex = groups.findIndex((g) => g.id === active.id);
      const overIndex = groups.findIndex((g) => g.id === over.id);

      if (activeIndex !== overIndex) {
        setGroups((groups) => reorderGroups(groups, activeIndex, overIndex));
      }
    } else if (dragData.type === 'student') {
      const groupId = dragData.groupId;
      const group = groups.find((g) => g.id === groupId);

      if (group && groupId) {
        const oldIndex = group.students.findIndex((s) => s.id === active.id);
        const newIndex = group.students.findIndex((s) => s.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          setGroups((groups) =>
            reorderStudentsInGroup(groups, groupId, oldIndex, newIndex)
          );
        }
      }
    }

    setActiveId(null);
    setActiveStudent(null);
  };

  const handleKeyDown = (event: React.KeyboardEvent, itemId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      // Handle keyboard "drag" start
      setActiveId(itemId);
    }
  };

  const moveStudentWithinGroup = (
    groupId: string,
    studentId: string,
    direction: 'up' | 'down'
  ) => {
    setGroups((prevGroups) => {
      const group = prevGroups.find((g) => g.id === groupId);
      if (!group) return prevGroups;

      const index = group.students.findIndex((s) => s.id === studentId);
      if (index === -1) return prevGroups;

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= group.students.length) return prevGroups;

      const newStudents = [...group.students];
      const [movedStudent] = newStudents.splice(index, 1);
      newStudents.splice(newIndex, 0, movedStudent);

      return prevGroups.map((g) =>
        g.id === groupId ? { ...g, students: newStudents } : g
      );
    });
  };

  const moveStudentBetweenGroups = (
    studentId: string,
    fromGroupId: string,
    toGroupId: string
  ) => {
    console.log(
      `Attempting to move student ${studentId} from ${fromGroupId} to ${toGroupId}`
    );

    setGroups((prevGroups) => {
      const fromGroupIndex = prevGroups.findIndex((g) => g.id === fromGroupId);
      const toGroupIndex = prevGroups.findIndex((g) => g.id === toGroupId);

      if (fromGroupIndex === -1 || toGroupIndex === -1) {
        console.warn('Invalid group IDs:', { fromGroupId, toGroupId });
        return prevGroups;
      }

      const fromGroup = prevGroups[fromGroupIndex];
      const studentIndex = fromGroup.students.findIndex(
        (s) => s.id === studentId
      );

      if (studentIndex === -1) {
        console.warn('Student not found in fromGroup:', studentId);
        return prevGroups;
      }

      const newGroups = [...prevGroups];
      const [movedStudent] = newGroups[fromGroupIndex].students.splice(
        studentIndex,
        1
      );
      newGroups[toGroupIndex].students.push(movedStudent);

      return newGroups;
    });
  };

  const moveGroup = (
    groupId: string,
    direction: 'left' | 'right' | 'up' | 'down'
  ) => {
    setGroups((prevGroups) => {
      const index = prevGroups.findIndex((g) => g.id === groupId);
      if (index === -1) return prevGroups;

      let newIndex;
      if (direction === 'left' || direction === 'up') {
        newIndex = index - 1;
      } else {
        newIndex = index + 1;
      }

      if (newIndex < 0 || newIndex >= prevGroups.length) return prevGroups;

      const newGroups = [...prevGroups];
      const [movedGroup] = newGroups.splice(index, 1);
      newGroups.splice(newIndex, 0, movedGroup);

      return newGroups;
    });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{ mb: 2, color: '#1e293b' }}
        >
          Drag and Drop Student Group Manager
        </Typography>
        <Button
          variant="contained"
          startIcon={<Shuffle />}
          onClick={generateGroups}
          sx={{
            backgroundColor: '#3b82f6',
            '&:hover': {
              backgroundColor: '#2563eb',
            },
          }}
          aria-label="Generate Random Groups"
        >
          Generate Random Groups
        </Button>
      </Box>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={groups.map((g) => g.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 16,
              padding: 16,
            }}
          >
            {groups.map((group, index) => (
              <GroupContainer
                key={group.id}
                group={group}
                groups={groups}
                originalIndex={originalIndices[group.id]}
                onKeyDown={(e: React.KeyboardEvent) =>
                  handleKeyDown(e, group.id)
                }
                tabIndex={0}
                aria-grabbed={activeId === group.id}
                aria-label={`Group ${index + 1}`}
                onMoveGroupUp={() => moveGroup(group.id, 'up')}
                onMoveGroupDown={() => moveGroup(group.id, 'down')}
                onMoveGroupLeft={() => moveGroup(group.id, 'left')}
                onMoveGroupRight={() => moveGroup(group.id, 'right')}
                moveStudentWithinGroup={moveStudentWithinGroup}
                moveStudentBetweenGroups={moveStudentBetweenGroups}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeId && activeStudent && (
            <StudentCard
              id={activeStudent.id}
              name={activeStudent.name}
              groupId=""
              aria-live="assertive"
              onMoveUp={() => {}}
              onMoveDown={() => {}}
              onMoveLeft={() => {}}
              onMoveRight={() => {}}
            />
          )}
        </DragOverlay>
      </DndContext>
    </Container>
  );
}

export default App;
