"use client";

import { useEffect, useState } from "react";

export type DeviceTier = "desktop" | "tablet" | "mobile";

type DeviceProfile = {
  tier: DeviceTier;
  hasFinePointer: boolean;
};

export function useDeviceProfile(): DeviceProfile {
  const [profile, setProfile] = useState<DeviceProfile>({
    tier: "desktop",
    hasFinePointer: true,
  });

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      setProfile({
        tier: width < 640 ? "mobile" : width < 1024 ? "tablet" : "desktop",
        hasFinePointer: window.matchMedia("(pointer: fine)").matches,
      });
    };

    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);

  return profile;
}
