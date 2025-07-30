import type { HTMLAttributes } from "react";
import { cx } from "@/utils/cx";

export const RazposLogo = (props: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div {...props} className={cx("flex h-8 w-max items-center justify-start overflow-visible", props.className)}>
      <h1 className="text-xl sm:text-2xl font-bold whitespace-nowrap" style={{ color: "var(--color-fg-primary)" }}>
        RAZPOS
      </h1>
    </div>
  );
};
