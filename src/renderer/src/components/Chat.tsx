import { Flex } from "../ui/Flex";

export const Chat = ({ messages }) => {
  return (
    <div
      style={{
        maxWidth: "30%",
        background: "white",
      }}
    >
      <Flex
        direction="column"
        style={{ height: "100%" }}
        justify={"space-between"}
      >
        <div>
          {messages.map((msg, i) => {
            return (
              <div key={i}>
                {msg.parts.map((part, i) => {
                  if (part.type === "text") {
                    return <p key={i}>{part.text}</p>;
                  }
                  return null;
                })}
              </div>
            );
          })}
        </div>
        <div>
          <input type="text" />
        </div>
      </Flex>
    </div>
  );
};
