import styled from "styled-components";

export const SettingsLayout = styled.div`
  display: flex;
  height: 100%;
  // background-color: aliceblue;
`;

export const SettingsRoot = styled.div`
  // max-width: 560px;
  // margin: 0 auto;
  padding: 32px 24px;
  // display: flex;
  flex-direction: column;
  gap: 32px;
`;

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const SectionTitle = styled.h2`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fg-2);
  margin: 0;
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: var(--surface);
  border-radius: 10px;
  border: 1px solid var(--border);
`;
