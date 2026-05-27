import Modal from "../../../../../../ui/Modal";
import Button from "../../../../../../ui/Button";
import { Message, Actions } from "./styles";

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  onConfirm: () => void;
};

const DeleteConfirmModal = ({
  isOpen,
  onOpenChange,
  title,
  message,
  onConfirm,
}: Props) => {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={title}
      footer={(close) => (
        <Actions>
          <Button variant="secondary" size="sm" onClick={close}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              onConfirm();
              close();
            }}
          >
            Delete
          </Button>
        </Actions>
      )}
    >
      <Message>{message}</Message>
    </Modal>
  );
};

export default DeleteConfirmModal;
