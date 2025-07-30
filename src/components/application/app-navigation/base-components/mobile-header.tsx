"use client";

import type { PropsWithChildren } from "react";
import { X as CloseIcon, Menu02 } from "@untitledui/icons";
import {
  Button as AriaButton,
  Dialog as AriaDialog,
  DialogTrigger as AriaDialogTrigger,
  Modal as AriaModal,
  ModalOverlay as AriaModalOverlay,
} from "react-aria-components";
import { RazposLogo } from "@/components/foundations/logo/razpos-logo";
import { cx } from "@/utils/cx";

export const MobileNavigationHeader = ({ children }: PropsWithChildren) => {
  return (
    <AriaDialogTrigger>
      <header
        className="flex h-16 items-center justify-between py-3 pr-2 pl-4 lg:hidden"
        style={{
          borderBottom: "1px solid var(--color-border-secondary)",
          backgroundColor: "var(--color-bg-primary)",
        }}
      >
        <RazposLogo />

        <AriaButton
          aria-label="Expand navigation menu"
          className="group flex items-center justify-center rounded-lg p-2 focus:outline-none focus:ring-2 transition-colors"
          style={
            {
              backgroundColor: "var(--color-bg-primary)",
              color: "var(--color-fg-primary)", // Use primary (darkest) for better visibility
              "--hover-bg": "var(--color-bg-secondary)",
              "--hover-color": "var(--color-fg-primary)",
              "--focus-ring": "var(--color-focus-ring)",
            } as React.CSSProperties & { [key: string]: string }
          }
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--color-bg-secondary)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--color-fg-primary)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--color-bg-primary)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--color-fg-primary)";
          }}
        >
          <Menu02 className="size-6 transition duration-200 ease-in-out group-aria-expanded:opacity-0" />
          <CloseIcon className="absolute size-6 opacity-0 transition duration-200 ease-in-out group-aria-expanded:opacity-100" />
        </AriaButton>
      </header>

      <AriaModalOverlay
        isDismissable
        className={({ isEntering, isExiting }) =>
          cx(
            "fixed inset-0 z-50 cursor-pointer bg-black/50 pr-16 backdrop-blur-sm lg:hidden",
            isEntering && "duration-300 ease-in-out animate-in fade-in",
            isExiting && "duration-200 ease-in-out animate-out fade-out"
          )
        }
      >
        {({ state }) => (
          <>
            <AriaButton
              aria-label="Close navigation menu"
              onPress={() => state.close()}
              className="fixed top-3 right-2 flex cursor-pointer items-center justify-center rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <CloseIcon className="size-6" />
            </AriaButton>

            <AriaModal className="w-full cursor-auto will-change-transform">
              <AriaDialog className="h-screen outline-none focus:outline-none">{children}</AriaDialog>
            </AriaModal>
          </>
        )}
      </AriaModalOverlay>
    </AriaDialogTrigger>
  );
};
