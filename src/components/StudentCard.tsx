import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { User } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface StudentCardProps {
  id: string;
  name: string;
  groupId: string;
}

const StudentCard: React.FC<StudentCardProps> = ({ id, name, groupId }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: {
      type: 'student',
      studentId: id,
      groupId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card 
        sx={{ 
          minWidth: 200, 
          margin: 1,
          backgroundColor: '#ffffff',
          '&:hover': {
            boxShadow: 6,
            backgroundColor: '#f8fafc',
          },
          cursor: 'grab',
        }}
      >
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <User size={20} />
          <Typography variant="body1">{name}</Typography>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentCard;