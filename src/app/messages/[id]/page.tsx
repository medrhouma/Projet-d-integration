"use client";

import { useEffect, useState } from "react";

export default function MessagePage({ params }: { params: { id: string } }) {
  const [messages, setMessages] = useState([]);
  const [contenu, setContenu] = useState("");

  useEffect(() => {
    fetch(`/api/messages/${params.id}`)
      .then((res) => res.json())
      .then((data) => setMessages(data));
  }, [params.id]);

  const sendMessage = async () => {
    await fetch(`/api/messages/${params.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contenu }),
    });
    setContenu("");
    const res = await fetch(`/api/messages/${params.id}`);
    setMessages(await res.json());
  };

  return (
    <div className="p-5 max-w-xl mx-auto">

      <h1 className="text-2xl font-bold mb-5">
        Chat avec utilisateur {params.id}
      </h1>

      <div className="border rounded-lg p-4 h-96 overflow-auto bg-gray-100">
        {messages.map((msg: any) => (
          <div
            key={msg.id_message}
            className={`p-2 my-2 rounded-lg max-w-[70%] ${
              msg.id_expediteur === 1
                ? "bg-blue-500 text-white ml-auto"
                : "bg-white text-black"
            }`}
          >
            {msg.contenu}
          </div>
        ))}
      </div>

      <div className="flex mt-4 gap-2">
        <input
          className="border p-2 flex-grow rounded"
          value={contenu}
          onChange={(e) => setContenu(e.target.value)}
          placeholder="Écrire un message..."
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={sendMessage}
        >
          Envoyer
        </button>
      </div>

    </div>
  );
}
