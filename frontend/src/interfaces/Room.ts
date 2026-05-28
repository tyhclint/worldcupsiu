export interface RoomModalProps {
  room: {
    id: string;
    name: string;
  } | null;
  onClose: () => void;
}