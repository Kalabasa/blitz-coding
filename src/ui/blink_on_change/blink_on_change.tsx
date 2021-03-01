import { ReactNode, useLayoutEffect, useState } from "react";

export type BlinkOnChangeProps = {
  children?: ReactNode;
  value: any;
};

export const BlinkOnChange = ({ children, value }: BlinkOnChangeProps) => {
  const [show, setShow] = useState(false);

  useLayoutEffect(() => {
    setShow(false);
    setTimeout(() => setShow(true));
  }, [value]);

  return show ? <>{children}</> : null;
};
