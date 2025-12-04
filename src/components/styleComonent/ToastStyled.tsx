import styled from "styled-components";

export const ToastStyled = styled.div`
  position: fixed;
  bottom: 30px;
  right: 30px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 15px;
  pointer-events: none;
  z-index: 9999;

  .toast {
    position: relative;
    width: 400px;
    height: 80px;
    background: #fff;
    font-weight: 500;
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
    display: flex;
    align-items: center;
    border-radius: 8px;
    animation: slideIn 0.5s ease-out forwards;
    border-left: 4px solid;
    overflow: hidden;
  }

  .toast.exit {
    animation: slideOut 0.5s ease-in forwards;
  }

  .toast.success {
    border-left-color: green;
  }

  .toast.error {
    border-left-color: red;
  }

  .toast.invalid {
    border-left-color: orange;
  }

  @keyframes slideIn {
    from {
      transform: translateX(420px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(420px);
      opacity: 0;
    }
  }

  .toast i {
    margin: 0 20px;
    font-size: 35px;
  }

  .toast::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 4px;
    border-radius: 0 0 8px 8px;
    animation: countdown 4s linear forwards;
  }

  .toast.success::after {
    background: green;
  }

  .toast.error::after {
    background: red;
  }

  .toast.invalid::after {
    background: orange;
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