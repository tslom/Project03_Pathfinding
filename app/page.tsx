import Image from "next/image";
import MapMaker from "@/components/MapMaker";

export default function Home() {
  return (
    <div className={`justify-center items-center w-full`}>
      <MapMaker/>
    </div>
  );
}
