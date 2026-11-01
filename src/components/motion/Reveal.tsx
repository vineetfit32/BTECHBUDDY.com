"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { fadeUp, popIn, staggerContainer } from "@/lib/motion";
import { usePreferences } from "@/lib/use-preferences";

interface RevealProps extends HTMLMotionProps<"div"> {
  variant?: "fadeUp" | "pop";
  delay?: number;
  once?: boolean;
}

/** Fades content up when it scrolls into view. Renders statically when motion is off. */
export function Reveal({ variant = "fadeUp", delay = 0, once = true, children, ...props }: RevealProps) {
  const { motion: level } = usePreferences();
  const variants = variant === "pop" ? popIn : fadeUp;
  if (level === "off") return <div {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children as React.ReactNode}</div>;
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "-10% 0px" }}
      transition={{ delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Container that staggers its <StaggerItem> children into view. */
export function Stagger({ stagger = 0.07, delay = 0, children, ...props }: HTMLMotionProps<"div"> & { stagger?: number; delay?: number }) {
  return (
    <motion.div variants={staggerContainer(stagger, delay)} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-8% 0px" }} {...props}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ variant = "fadeUp", children, ...props }: HTMLMotionProps<"div"> & { variant?: "fadeUp" | "pop" }) {
  return (
    <motion.div variants={variant === "pop" ? popIn : fadeUp} {...props}>
      {children}
    </motion.div>
  );
}
