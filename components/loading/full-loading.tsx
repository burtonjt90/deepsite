import Loading from ".";
import { AnimatedBlobs } from "../animated-blobs";

export const FullLoading = () => {
  return (
    <div className="h-screen flex flex-col justify-center items-center bg-neutral-950 z-1 relative">
      <div className="background__noisy" />
      {/* <p className="text-muted-foreground mb-5">Fetching user data...</p> */}
      <Loading overlay={false} className="!size-6 opacity-50" />
    </div>
  );
};
