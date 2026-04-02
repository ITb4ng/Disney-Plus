import styled from "styled-components";

export const Wrap = styled.div`
  max-width: 920px;
  margin: 0 auto;
  padding: calc(var(--nav-h, 72px) + 18px) clamp(16px, 4vw, 24px) 28px;

  @media (max-width: 640px) {
    padding: calc(var(--nav-h, 72px) + 14px) 14px 24px;
  }
`;

export const HeadRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;

  @media (max-width: 640px) {
    align-items: stretch;
    flex-direction: column;
    gap: 10px;
  }
`;

export const CrumbBlock = styled.div`
  min-width: 0;
`;

export const Breadcrumb = styled.nav`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 24px;
  line-height: 1;
  color: rgba(255, 255, 255, 0.6);

  @media (max-width: 640px) {
    gap: 6px;
    font-size: 15px;
  }
`;

export const CrumbButton = styled.button`
  appearance: none;
  padding: 0;
  border: 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.4);
  font-size: 24px;
  cursor: pointer;

  &:hover {
    color: rgba(255, 255, 255, 0.95);
    text-decoration: underline;
    text-decoration-color: rgba(255, 255, 255, 0.35);
    text-underline-offset: 3px;
  }

  &:active {
    transform: translateY(-1px);
  }

  @media (max-width: 640px) {
    font-size: 17px;
  }
`;

export const CrumbSep = styled.span`
  opacity: 0.45;
`;

export const CrumbCurrent = styled.span`
  display: inline-flex;
  align-items: center;
  height: 24px;
  color: rgba(255, 255, 255, 0.95);
  font-weight: 600;

  @media (max-width: 640px) {
    font-size: 17px;
  }
`;

export const GhostButton = styled.button`
  padding: 10px 14px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  background: transparent;
  color: rgba(255, 255, 255, 0.86);
  cursor: pointer;
  font-size: 12px;
  font-weight: 900;
  white-space: nowrap;
  transition: filter 160ms ease, transform 160ms ease, background 160ms ease;

  &:hover {
    filter: brightness(1.06);
    background: rgba(255, 255, 255, 0.04);
  }

  &:active {
    transform: translateY(1px);
  }

  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.28);
    outline-offset: 2px;
  }

  @media (max-width: 640px) {
    min-height: 42px;
    font-size: 13px;
  }
`;

export const TrialBanner = styled.div`
  margin-top: 12px;
  padding: 10px 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.92);
  font-size: 12px;
  line-height: 1.4;

  @media (max-width: 640px) {
    margin-top: 10px;
    padding: 10px 11px;
    font-size: 11px;
    line-height: 1.55;
  }
`;

export const TrialBannerStrong = styled.strong`
  font-weight: 900;
`;

export const TrialBannerSubtle = styled.span`
  opacity: 0.85;
`;

export const LoadingText = styled.div`
  margin-top: 14px;
  opacity: 0.75;

  @media (max-width: 640px) {
    font-size: 13px;
  }
`;

export const FormCard = styled.form`
  margin-top: 14px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.18);

  @media (max-width: 640px) {
    margin-top: 12px;
    padding: 14px;
    border-radius: 12px;
  }
`;

export const Field = styled.div`
  & + & {
    margin-top: 12px;
  }
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 900;
  opacity: 0.8;

  @media (max-width: 640px) {
    margin-bottom: 6px;
    font-size: 14px;
  }
`;

const placeholderStyle = `
  color: rgba(255, 255, 255, 0.45);
  font-size: 13px;
`;

export const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.92);
  outline: none;
  font-size: 16px;
  line-height: 1.4;
  transition: border-color 160ms ease, background 160ms ease, box-shadow 160ms ease;

  &:focus {
    border-color: rgba(2, 214, 232, 0.6);
    box-shadow: 0 0 0 2px rgba(2, 214, 232, 0.18);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &::placeholder {
    ${placeholderStyle}
  }

  @media (max-width: 640px) {
    min-height: 44px;
    padding: 11px 12px;
    font-size: 16px;
  }
`;

export const Textarea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.92);
  outline: none;
  resize: vertical;
  font-size: 16px;
  line-height: 1.5;
  transition: border-color 160ms ease, background 160ms ease, box-shadow 160ms ease;

  &:focus {
    border-color: rgba(2, 214, 232, 0.6);
    box-shadow: 0 0 0 2px rgba(2, 214, 232, 0.18);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &::placeholder {
    ${placeholderStyle}
  }

  @media (max-width: 640px) {
    min-height: 180px;
    padding: 11px 12px;
    font-size: 16px;
    line-height: 1.55;
  }
`;

export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 14px;

  @media (max-width: 640px) {
    margin-top: 12px;
  }
`;

export const PrimaryButton = styled.button`
  padding: 10px 14px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.92);
  cursor: pointer;
  font-size: 12px;
  font-weight: 900;
  transition: filter 160ms ease, transform 160ms ease, background 160ms ease;

  &:hover {
    filter: brightness(1.06);
  }

  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.28);
    outline-offset: 2px;
  }

  @media (max-width: 640px) {
    width: 100%;
    min-height: 44px;
    font-size: 13px;
  }
`;
