"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RoomInventoryRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/room-inventory");
  }, [router]);

  return (
    <div className="p-8 text-center text-xs text-slate-500 font-semibold">
      Redirecting to Tape Chart Calendar...
    </div>
  );
}
