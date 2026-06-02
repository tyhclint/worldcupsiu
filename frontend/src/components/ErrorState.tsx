'use client';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void; 
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4 px-6 md:px-0 text-red-500 text-center md:text-left uppercase">
      <p>Something went wrong: {message}</p>
      
      {onRetry && (
        <button 
          onClick={onRetry} 
          className="underline hover:text-red-700 uppercase"
        >
          Try again
        </button>
      )}
    </div>
  );
}