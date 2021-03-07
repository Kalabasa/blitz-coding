import {
  createContext,
  CSSProperties,
  PropsWithChildren,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Color, interpolateColor } from "ui/styles/colors";
import styles from "./light.module.css";

export type LightProps = {
  color: Color;
};

export const Light = ({ color }: LightProps) => (
  <LightContext.Consumer>
    {(ctx) => <LightBase {...{ ctx, color }} />}
  </LightContext.Consumer>
);

const LightBase = ({ ctx, color }: LightProps & { ctx: LightContext }) => {
  const now = Date.now();
  const globalLight = useMemo(
    () => ({
      color: interpolateColor(color, Color.accent, 0.06),
      startTime: now,
      endTime: now + parseFloat(styles.lightDuration) * 1000,
    }),
    [color]
  );

  useEffect(() => {
    const colors = ctx.colorsRef.current;
    if (colors) {
      console.log("add", globalLight);
      colors.add(globalLight);
      ctx.updateColors();
      setTimeout(() => ctx.updateColors(), globalLight.endTime - Date.now());
    }
  }, [globalLight, ctx.colorsRef.current, ctx.updateColors]);

  const backLightColor = interpolateColor(color, Color.background, 0.96);
  const backLightStyle = {
    ["--backLightColor"]: `rgb(${backLightColor.r},${backLightColor.g},${backLightColor.b})`,
  } as CSSProperties;

  return (
    <>
      {ctx.backLightPortal.current &&
        createPortal(
          <div className={styles.backLight} style={backLightStyle} />,
          ctx.backLightPortal.current
        )}
    </>
  );
};

export const BackLightPortal = () => (
  <LightContext.Consumer>
    {(ctx) => (
      <div className={styles.backLightPortal} ref={ctx.backLightPortal} />
    )}
  </LightContext.Consumer>
);

export const LightContainer = ({ children }: PropsWithChildren<{}>) => {
  const backLightPortal = useRef<HTMLDivElement>(null);
  const colorsRef = useRef<Set<GlobalLight>>(new Set());
  const [lights, setLights] = useState<GlobalLight[]>([]);

  const updateColors = useCallback(() => {
    const colorSet = colorsRef.current;
    for (let value of Array.from(colorSet)) {
      if (value.endTime <= Date.now()) {
        colorSet.delete(value);
      }
    }
    setLights(Array.from(colorSet));
  }, [setLights]);

  return (
    <LightContext.Provider value={{ backLightPortal, colorsRef, updateColors }}>
      <div className={styles.lightContainer}>{children}</div>
    </LightContext.Provider>
  );
};

type GlobalLight = {
  color: Color;
  startTime: number;
  endTime: number;
};

type LightContext = {
  backLightPortal: RefObject<HTMLDivElement>;
  colorsRef: RefObject<Set<GlobalLight>>;
  updateColors: () => void;
};
const LightContext = createContext<LightContext>({
  backLightPortal: { current: null },
  colorsRef: { current: null },
  updateColors: () => {},
});
