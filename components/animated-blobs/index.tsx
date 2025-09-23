export function AnimatedBlobs() {
  return (
    <div className="absolute inset-0 pointer-events-none -z-[1]">
      <div
        className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-10 blur-3xl"
        style={{
          animation:
            "liquidBlob1 4s ease-in-out infinite, liquidFlow1 6s ease-in-out infinite",
        }}
      />
      <div
        className="w-2/3 h-3/4 bg-gradient-to-r from-blue-500 to-teal-500 opacity-24 blur-3xl absolute -top-20 right-10"
        style={{
          animation:
            "liquidBlob2 5s ease-in-out infinite, liquidFlow2 7s ease-in-out infinite",
        }}
      />
      <div
        className="w-1/2 h-1/2 bg-gradient-to-r from-amber-500 to-rose-500 opacity-20 blur-3xl absolute bottom-0 left-10"
        style={{
          animation:
            "liquidBlob3 3.5s ease-in-out infinite, liquidFlow3 8s ease-in-out infinite",
        }}
      />
      <div
        className="w-48 h-48 bg-gradient-to-r from-cyan-500 to-indigo-500 opacity-20 blur-3xl absolute top-1/3 right-1/3"
        style={{
          animation:
            "liquidBlob4 4.5s ease-in-out infinite, liquidFlow4 6.5s ease-in-out infinite",
        }}
      />
    </div>
  );
}
