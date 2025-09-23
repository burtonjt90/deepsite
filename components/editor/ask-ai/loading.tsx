import Loading from "@/components/loading";

export const AiLoading = ({
  text = "Ai is working...",
  className,
}: {
  text?: string;
  className?: string;
}) => {
  return (
    <div className={`flex items-center justify-start gap-2 ${className}`}>
      <Loading overlay={false} className="!size-4 opacity-50" />
      <p className="text-neutral-400 text-sm">
        <span className="inline-flex">
          {text.split("").map((char, index) => (
            <span
              key={index}
              className="bg-gradient-to-r from-neutral-100 to-neutral-300 bg-clip-text text-transparent animate-pulse"
              style={{
                animationDelay: `${index * 0.1}s`,
                animationDuration: "1.3s",
                animationIterationCount: "infinite",
              }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </span>
      </p>
    </div>
  );
};
