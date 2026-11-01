export const THEMES = [
  { id: "study", label: "Study Board", hint: "Default dark chalkboard" },
  { id: "light", label: "Paper", hint: "Bright daytime reading" },
  { id: "night", label: "Night Study", hint: "Warm, low blue light" },
  { id: "contrast", label: "High Contrast", hint: "Maximum legibility" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];
export type MotionLevel = "full" | "reduced" | "off";
export type Lang = "en" | "hi";

export interface Preferences {
  theme: ThemeId;
  nightAuto: boolean;
  saver: boolean;
  focus: boolean;
  motion: MotionLevel;
  motionOverride: MotionLevel | null;
  lang: Lang;
}

export const STORAGE = {
  theme: "btb-theme",
  legacyTheme: "btechbuddy_theme",
  nightAuto: "btb-night-auto",
  saver: "btechbuddy_data_saver",
  motion: "btb-motion",
  lang: "btechbuddy_lang",
  focus: "btb-focus",
} as const;

export const DEFAULT_PREFERENCES: Preferences = {
  theme: "study",
  nightAuto: false,
  saver: false,
  focus: false,
  motion: "full",
  motionOverride: null,
  lang: "en",
};

/**
 * Runs inline in <head> before first paint so the page never flashes the wrong theme.
 * Keep it dependency-free and ES5; it is serialised into the HTML.
 */
export const PREFERENCES_BOOT_SCRIPT = `(function(){try{
var d=document.documentElement,ls=localStorage,t=ls.getItem("${STORAGE.theme}");
if(!t){t=ls.getItem("${STORAGE.legacyTheme}")==="light"?"light":"study";}
if(["study","light","night","contrast"].indexOf(t)<0)t="study";
if(ls.getItem("${STORAGE.nightAuto}")==="1"&&t==="study"){var h=new Date().getHours();if(h>=22||h<5)t="night";}
d.setAttribute("data-theme",t);d.classList.toggle("dark",t!=="light");
var c=navigator.connection,s=ls.getItem("${STORAGE.saver}")==="true"||!!(c&&c.saveData);
d.setAttribute("data-saver",s?"on":"off");
var m=ls.getItem("${STORAGE.motion}"),rm=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var low=(navigator.hardwareConcurrency||8)<=2||(navigator.deviceMemory||8)<=2;
if(m!=="full"&&m!=="reduced"&&m!=="off")m=rm?"reduced":(s||low?"reduced":"full");
d.setAttribute("data-motion",m);
d.setAttribute("data-focus",sessionStorage.getItem("${STORAGE.focus}")==="on"?"on":"off");
if(ls.getItem("${STORAGE.lang}")==="hi")d.lang="hi";
}catch(e){}})();`;
