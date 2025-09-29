import { MessageBubble } from "./MessageBubble";
import { Loader2 } from "lucide-react";
import type { Message } from "../lib/types";

type ChatMessagesProps = {
  messages: Message[];
  isLoadingQuestion: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
};

export function ChatMessages({
  messages,
  isLoadingQuestion,
  messagesEndRef,
}: ChatMessagesProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="max-w-3xl mx-auto space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isLoadingQuestion && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-300 rounded-lg px-4 py-3">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}