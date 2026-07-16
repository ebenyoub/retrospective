import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal, { ModalHeader, ModalTitle, ModalContent } from '../Modal';

describe('Modal Component Suite', () => {
  const handleClose = vi.fn();

  afterEach(() => {
    handleClose.mockClear();
    document.body.style.overflow = 'unset';
  });

  it('ne s\'affiche pas si isOpen est faux', () => {
    render(
      <Modal isOpen={false} onClose={handleClose}>
        <ModalHeader>
          <ModalTitle>Test Title</ModalTitle>
        </ModalHeader>
        <ModalContent>Modal Content</ModalContent>
      </Modal>
    );

    expect(screen.queryByText('Test Title')).toBeNull();
    expect(screen.queryByText('Modal Content')).toBeNull();
  });

  it('affiche le titre et le contenu si isOpen est vrai', () => {
    render(
      <Modal isOpen={true} onClose={handleClose}>
        <ModalHeader>
          <ModalTitle>Test Title</ModalTitle>
        </ModalHeader>
        <ModalContent>Modal Content</ModalContent>
      </Modal>
    );

    expect(screen.getByText('Test Title')).toBeTruthy();
    expect(screen.getByText('Modal Content')).toBeTruthy();
  });

  it('appelle onClose lors du clic sur le bouton de fermeture dans le Header', () => {
    render(
      <Modal isOpen={true} onClose={handleClose}>
        <ModalHeader>
          <ModalTitle>Test Title</ModalTitle>
        </ModalHeader>
        <ModalContent>Modal Content</ModalContent>
      </Modal>
    );

    const closeButton = screen.getByRole('button', { name: 'Fermer la modale' });
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('appelle onClose lors du clic sur l\'arrière-plan', () => {
    render(
      <Modal isOpen={true} onClose={handleClose}>
        <ModalHeader>
          <ModalTitle>Test Title</ModalTitle>
        </ModalHeader>
        <ModalContent>Modal Content</ModalContent>
      </Modal>
    );

    const backdrop = screen.getByRole('dialog');
    fireEvent.click(backdrop);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('n\'appelle pas onClose lors du clic sur le contenu de la modale', () => {
    render(
      <Modal isOpen={true} onClose={handleClose}>
        <ModalHeader>
          <ModalTitle>Test Title</ModalTitle>
        </ModalHeader>
        <ModalContent>Modal Content</ModalContent>
      </Modal>
    );

    const content = screen.getByText('Modal Content');
    fireEvent.click(content);

    expect(handleClose).not.toHaveBeenCalled();
  });

  it('appelle onClose lors de l\'appui sur la touche Echap', () => {
    render(
      <Modal isOpen={true} onClose={handleClose}>
        <ModalHeader>
          <ModalTitle>Test Title</ModalTitle>
        </ModalHeader>
        <ModalContent>Modal Content</ModalContent>
      </Modal>
    );

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
