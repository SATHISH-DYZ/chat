import { cn } from '@/lib/utils';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export const ChatMessage = ({ role, content }: ChatMessageProps) => {
  const isUser = role === 'user';

  return (
    <div className={cn('flex w-full mb-4 animate-fade-in', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3 shadow-sm',
          'transition-[var(--transition-smooth)] hover:shadow-md',
          isUser 
            ? 'bg-primary text-primary-foreground rounded-br-sm' 
            : 'bg-card text-card-foreground rounded-bl-sm border border-border'
        )}
      >
        <p className="whitespace-pre-wrap break-words">{content}</p>
      </div>
    </div>
  );
};
