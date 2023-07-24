"use client";
import { useChat } from "ai/react";

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div className="m-2 p-2 max-w-lg">
      {messages.map((m) => (
        <div className="mb-1" key={m.id}>
          <b>{m.role === "user" ? "Moi : " : "HAL 9000 : "}</b>
          {m.content}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          className="rounded-md p-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 mr-2 mt-4"
          value={input}
          onChange={handleInputChange}
        />
        <button type="submit">Envoyer</button>
      </form>
    </div>
  );
}
