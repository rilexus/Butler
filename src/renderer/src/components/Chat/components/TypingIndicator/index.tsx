import { Dot, Dots } from "./styles";

export const TypingIndicator = () => (
  <Dots>
    <Dot $delay={0} />
    <Dot $delay={150} />
    <Dot $delay={300} />
  </Dots>
);
