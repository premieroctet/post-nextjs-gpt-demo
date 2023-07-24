import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import db from "@/app/core/db";
import type { ChatCompletionCreateParams } from "openai/resources/chat";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const MODEL_NAME = "gpt-3.5-turbo-0613";

const functions: ChatCompletionCreateParams.Function[] = [
  {
    name: "get_order_status",
    description: "Get the status of an order",
    parameters: {
      type: "object",
      properties: {
        orderReference: {
          type: "string",
          description: "The reference of the order",
        },
      },
      required: ["orderReference"],
    },
  },
];

export async function POST(req: Request) {
  const { messages } = await req.json();

  const response = await openai.chat.completions.create({
    model: MODEL_NAME,
    stream: true,
    messages,
    functions,
  });

  const stream = OpenAIStream(response, {
    experimental_onFunctionCall: async (
      { name, arguments: args },
      createFunctionCallMessages
    ) => {
      if (name === "get_order_status") {
        const ref = args.orderReference as string;
        const order = await db.order.findFirst({
          where: { reference: ref },
          select: { status: true, items: true },
        });

        const newMessages = createFunctionCallMessages(
          order
            ? {
                orderStatus: order.status,
                items: order.items.map((item) => ({
                  name: item.name,
                  quantity: item.quantity,
                })),
              }
            : { orderStatus: "not_found" }
        );

        return await openai.chat.completions.create({
          messages: [...messages, ...newMessages],
          stream: true,
          model: MODEL_NAME,
          functions,
        });
      }

      return messages;
    },
  });

  return new StreamingTextResponse(stream);
}
