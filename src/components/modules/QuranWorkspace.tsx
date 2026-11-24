import React from "react";
import { usePrefs } from "@/lib/preferences";
import { IslamicCenterWorkspace } from "@/components/islamic/IslamicCenterWorkspace";

export function QuranWorkspace() {
  const { lang } = usePrefs();

  return (
    <div className="w-full">
      <IslamicCenterWorkspace lang={lang} />
    </div>
  );
}

export default QuranWorkspace;
