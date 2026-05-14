import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { streamText, tool } from "ai";
import {
  assign,
  createActor,
  emit,
  fromPromise,
  setup,
  toPromise,
} from "xstate";
import z from "zod";

const lmstudio = createOpenAICompatible({
  name: "lmstudio",
  headers: {
    Authorization: "Bearer sk-lm-aftl4L4L:dCUnehUL2Yq5ADgGe75X",
  },
  baseURL: "http://127.0.0.1:1234/v1",
});

const buildToolsMap = (tools) =>
  tools.reduce(
    (acc, { name, description }) => ({
      ...acc,
      [name]: tool({
        inputSchema: z.object({ input: z.string() }),
        description,
      }),
    }),
    {},
  );

const buildAgentActor = ({
  name,
  model: modelName,
  instructions,
  prompt,
  tools,
}) =>
  fromPromise(async ({ input }) => {
    const { messages, prompt: initialPrompt, parent } = input;

    parent.send({ type: "agent.active", name });

    const stream = streamText({
      model: lmstudio(modelName),
      toolChoice: "auto",
      tools: buildToolsMap(tools),
      messages: [
        { role: "system", content: instructions },
        { role: "user", content: initialPrompt ?? prompt },
        ...messages,
      ],
    });

    for await (const chunk of stream.toUIMessageStream()) {
      parent.send({ type: "agent.UIMessageStream", chunk, name });
    }

    const [toolCalls, text] = await Promise.all([
      stream.toolCalls,
      stream.text,
    ]);
    const toolCall = toolCalls[0];

    return {
      role: "assistant",
      content: [toolCall ?? { type: "text", value: text }],
    };
  });

const buildSubAgentActors = (tools) =>
  tools.reduce((acc, managed) => {
    const { name } = managed;
    const machine = fromWorkflow(managed);

    return {
      ...acc,
      [name]: fromPromise(async ({ input }) => {
        const {
          toolCallId,
          toolName,
          input: toolInput,
        } = input.output.content[0];
        const { messages, parent } = input;

        const actor = createActor(machine, {
          input: { prompt: toolInput.input },
        });

        forwardEventsToParent(actor, parent);
        actor.start();

        const { results } = await toPromise(actor);

        return {
          role: "tool",
          content: [
            {
              type: "tool-result",
              output: { type: "text", value: results.at(-1) },
              toolCallId,
              toolName,
            },
          ],
        };
      }),
    };
  }, {});

const buildNextAgentActor = (next) => ({
  [next.name]: fromPromise(async ({ input }) => {
    const { parent, ...rest } = input;
    const machine = fromWorkflow(next);
    const actor = createActor(machine, { input: rest });

    forwardEventsToParent(actor, parent);

    actor.start();
    return await toPromise(actor);
  }),
});

const FORWARDED_EVENTS = [
  "agent.active",
  "agent.done",
  "agent.UIMessageStream",
];

const forwardEventsToParent = (actor, parent) => {
  for (const type of FORWARDED_EVENTS) {
    actor.on(type, (event) => parent.send(event));
  }
};

const buildToolGuards = (tools) =>
  tools.reduce(
    (acc, { name }) => ({
      ...acc,
      [name]: ({ event }) => event.output.content[0].toolName === name,
    }),
    {},
  );

const buildToolStates = (tools, parentName) =>
  tools.reduce(
    (acc, { name: toolName }) => ({
      ...acc,
      [toolName]: {
        invoke: {
          id: toolName,
          src: toolName,
          input: ({ event, context, self }) => ({
            ...event,
            ...context,
            parent: self,
          }),
          onDone: [
            {
              target: parentName,
              actions: ["add_message"],
            },
          ],
        },
      },
    }),
    {},
  );

const emitAgentDone = emit(({ event, context }) => ({
  type: "agent.done",
  name: event.actorId,
  ...context,
}));

export const fromWorkflow = ({
  name,
  tools = [],
  model: modelName,
  instructions,
  prompt,
  next,
}) => {
  const machine = setup({
    actors: {
      [name]: buildAgentActor({
        name,
        model: modelName,
        instructions,
        prompt,
        tools,
      }),
      ...buildSubAgentActors(tools),
      ...(next ? buildNextAgentActor(next) : {}),
    },

    actions: {
      add_results: assign({
        results: ({ event, context }) => {
          const value = event.output.content[0].value.replace(/^\n+|\n+$/g, "");
          return [...context.results, value];
        },
      }),
      add_message: assign({
        messages: ({ event, context }) => [...context.messages, event.output],
      }),
      merge_next_output: assign({
        results: ({ event, context }) => [
          ...context.results,
          ...event.output.results,
        ],
        messages: ({ event, context }) => [
          ...context.messages,
          ...(event.output.messages ?? []),
        ],
      }),
    },

    guards: buildToolGuards(tools),
  }).createMachine({
    context: ({ input }) => ({
      results: [],
      messages: [],
      prompt: input?.prompt ?? prompt ?? null,
    }),
    initial: name,
    states: {
      [name]: {
        invoke: {
          id: name,
          src: name,
          input: ({ context, self }) => ({ ...context, parent: self }),
          onDone: [
            ...tools.map(({ name: toolName }) => ({
              target: toolName,
              actions: ["add_message"],
              guard: toolName,
            })),
            {
              target: next ? next.name : "done",
              actions: ["add_message", "add_results", emitAgentDone],
            },
          ],
        },
      },
      ...buildToolStates(tools, name),
      ...(next
        ? {
            [next.name]: {
              invoke: {
                id: next.name,
                src: next.name,
                input: ({ context, self }) => ({ ...context, parent: self }),
                onDone: {
                  target: "done",
                  actions: ["merge_next_output"],
                },
              },
            },
          }
        : {}),
      done: {
        type: "final",
        entry: [
          emit(({ event, context }) => ({
            type: "final",
            name: event.actorId,
            ...context,
          })),
        ],
      },
    },
    on: {
      "agent.UIMessageStream": { actions: emit(({ event }) => event) },
      "agent.active": { actions: emit(({ event }) => event) },
      "agent.done": { actions: emit(({ event }) => event) },
    },
    output: ({ context }) => context,
  });

  return machine;
};
