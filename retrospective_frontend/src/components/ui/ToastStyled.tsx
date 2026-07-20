import styled from "styled-components";

export const ToastStyled = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  pointer-events: none;
  z-index: 9999;

  .toast {
    position: relative;
    width: 320px;
    padding: 12px 14px;
    background: var(--color-navy-mid);
    border: 1px solid var(--color-navy-border-med);
    font-family: var(--font-sans);
    font-weight: 500;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
    display: flex;
    align-items: center;
    gap: 10px;
    border-radius: var(--radius-figma-md);
    animation: slideIn 0.25s ease-out forwards;
    cursor: pointer;
    overflow: hidden;
    pointer-events: auto;
  }

  .toast.exit {
    animation: slideOut 0.2s ease-in forwards;
  }

  .toast.success i {
    color: var(--color-green-figma);
  }

  .toast.error i {
    color: var(--color-red-figma);
  }

  .toast.invalid i {
    color: var(--color-yellow-figma);
  }

  @keyframes slideIn {
    from {
      transform: translateY(8px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(8px);
      opacity: 0;
    }
  }

  .toast i {
    font-size: 15px;
    flex-shrink: 0;
  }

  .toast::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 2px;
    animation: countdown 4s linear forwards;
  }

  .toast.success::after {
    background: var(--color-green-figma);
  }

  .toast.error::after {
    background: var(--color-red-figma);
  }

  .toast.invalid::after {
    background: var(--color-yellow-figma);
  }

  @keyframes countdown {
    from {
      width: 100%;
    }
    to {
      width: 0%;
    }
  }
`;