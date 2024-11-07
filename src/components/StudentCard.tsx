import React from 'react';
import { Card, CardContent, Typography, IconButton } from '@mui/material';
import { User } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ArrowUpward,
  ArrowDownward,
  ArrowBack,
  ArrowForward,
} from '@mui/icons-material';

interface StudentCardProps {
  id: string;
  name: string;
  groupId: string;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onMoveLeft: (targetGroupId: string) => void;
  onMoveRight: (targetGroupId: string) => void;
}

const StudentCard: React.FC<StudentCardProps> = ({
  id,
  name,
  groupId,
  onMoveUp,
  onMoveDown,
  onMoveLeft,
  onMoveRight,
}) => {
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

  const handleMoveLeft = () => {
    onMoveLeft(groupId);
  };

  const handleMoveRight = () => {
    onMoveRight(groupId);
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        sx={{
          minWidth: 180,
          margin: 0.5,
          backgroundColor: '#ffffff',
          '&:hover': {
            boxShadow: 6,
            backgroundColor: '#f8fafc',
          },
          cursor: 'grab',
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            padding: 0.5,
            paddingBottom: '2px !important',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <IconButton onClick={onMoveUp} aria-label="Move up" size="small">
              <ArrowUpward fontSize="small" />
            </IconButton>
            <IconButton
              onClick={onMoveDown}
              aria-label="Move down"
              size="small"
            >
              <ArrowDownward fontSize="small" />
            </IconButton>
          </div>
          <User size={16} />
          <Typography variant="body2" sx={{ flexGrow: 1 }}>
            {name}
          </Typography>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <IconButton
              onClick={handleMoveLeft}
              aria-label="Move left"
              size="small"
            >
              <ArrowBack fontSize="small" />
            </IconButton>
            <IconButton
              onClick={handleMoveRight}
              aria-label="Move right"
              size="small"
            >
              <ArrowForward fontSize="small" />
            </IconButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentCard;
