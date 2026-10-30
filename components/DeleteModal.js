import React from 'react';
import styled from 'styled-components';

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: var(--text-primary);
  border-radius: 16px;
  padding: 32px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 25px 50px -12px rgba(0,0,0, 0.25);
`;

const ModalHeader = styled.div`
  margin-bottom: 24px;
  
  h3 {
    color: var(--bg);
    font-size: 24px;
    margin-bottom: 10px;
    font-weight: 700;
  }
  
  p {
    color: var(--border-strong);
    font-size: 16px;
    line-height: 1.5;
    margin-bottom: 20px;
  }
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const ConfirmationInput = styled.input`
  padding: 12px 16px;
  border: 1px solid var(--text-secondary);
  border-radius: 10px;
  background-color: var(--text-primary);
  color: var(--bg);
  font-size: 16px;
  font-weight: 500;
  transition: border-color 0.2s ease;
  
  &:focus {
    border-color: var(--accent);
    outline: none;
    box-shadow: 0 0 0 3px rgba(180,83,42, 0.2);
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 15px;
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 12px 20px;
  border-radius: 10px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: var(--text-secondary);
  color: var(--bg);
  
  &:hover {
    background-color: var(--text-primary);
  }
`;

const ConfirmDeleteButton = styled.button`
  flex: 1;
  padding: 12px 20px;
  border-radius: 10px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: var(--error);
  color: white;
  
  &:hover {
    background-color: var(--error);
  }
  
  &:disabled {
    background-color: var(--error-soft);
    color: var(--text-tertiary);
    cursor: not-allowed;
  }
`;

const DeleteModal = ({ 
  isOpen, 
  eventName, 
  deleteConfirmation, 
  setDeleteConfirmation, 
  isDeleting, 
  onCancel, 
  onConfirm 
}) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          <h3>Delete Event</h3>
          <p>
            This action cannot be undone. This will permanently delete
            the event "{eventName}" and all associated wishes.
          </p>
        </ModalHeader>

        <ModalBody>
          <p>
            Please type <strong>{eventName}</strong> to confirm.
          </p>
          <ConfirmationInput
            type="text"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            placeholder="Enter event name to confirm"
            disabled={isDeleting}
          />
        </ModalBody>

        <ModalActions>
          <CancelButton
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </CancelButton>
          <ConfirmDeleteButton
            onClick={onConfirm}
            disabled={
              deleteConfirmation !== eventName ||
              isDeleting
            }
          >
            {isDeleting ? 'Deleting...' : 'Delete Event'}
          </ConfirmDeleteButton>
        </ModalActions>
      </ModalContent>
    </ModalOverlay>
  );
};

export default DeleteModal;
