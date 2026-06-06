import styled from "styled-components";

const Placeholder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 120px;
  color: var(--fg-3);
  font-size: 13px;
`;

const ToolsSection = () => <Placeholder>No tools configured</Placeholder>;

export default ToolsSection;
