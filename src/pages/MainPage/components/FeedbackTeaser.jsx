import React from "react";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { getAppScrollY } from "../../../utils/scrollPosition";

export default function FeedbackTeaser({ isGuest = false }) {
  const nav = useNavigate();
  const { pathname, search } = useLocation();
  const desc = isGuest
    ? "체험 계정도 작성은 가능합니다. 남겨 주신 의견은 다음 업데이트에 참고됩니다."
    : "한 줄만 남겨도 다음 업데이트에 반영할 명분이 생깁니다.";

  return (
    <Wrap>
      <Card>
        <Copy>
          <Title>불편한 점 / 개선 아이디어</Title>
          <Desc>{desc}</Desc>
        </Copy>

        <ActionButton
          type="button"
          data-testid="feedback-open-btn"
          onClick={() =>
            nav("/feedback", {
              state: {
                from: pathname + search,
                scrollY: getAppScrollY(),
              },
            })
          }
        >
          피드백 남기기
        </ActionButton>
      </Card>
    </Wrap>
  );
}

const Wrap = styled.section`
  padding: 0;
  margin: 0;
`;

const Card = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  min-height: 88px;
  padding: 18px 20px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.035);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
    min-height: 0;
    gap: 14px;
    padding: 16px;
  }
`;

const Copy = styled.div`
  min-width: 0;
  flex: 1;
`;

const Title = styled.div`
  font-size: 15px;
  font-weight: 800;
  line-height: 1.35;
  color: rgba(255, 255, 255, 0.92);

  @media (max-width: 640px) {
    font-size: 14px;
  }
`;

const Desc = styled.div`
  max-width: 840px;
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.64);

  @media (max-width: 640px) {
    margin-top: 6px;
    font-size: 12px;
    line-height: 1.5;
  }
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  min-width: 120px;
  height: 40px;
  padding: 0 18px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  color: inherit;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  line-height: 1;
  transition: background 160ms ease, border-color 160ms ease, color 160ms ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.24);
    color: rgba(255, 255, 255, 0.96);
  }

  @media (max-width: 640px) {
    width: 100%;
    min-width: 0;
    height: 38px;
    font-size: 13px;
  }
`;
