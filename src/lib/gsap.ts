"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

let registered = false;

export function registerGsap() {
  if (registered || typeof window === "undefined") return gsap;
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
  registered = true;
  return gsap;
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
