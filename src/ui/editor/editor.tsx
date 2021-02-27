import { highlight, languages } from "prismjs";
import { memo } from "react";
import SimpleCodeEditor from "react-simple-code-editor";
import styles from "./editor.module.css";

export type EditorProps = {
  disabled?: boolean;
  code: string;
  setCode(code: string): void;
};

export const Editor = memo(({ disabled, code, setCode }: EditorProps) => (
  <SimpleCodeEditor
    className="code"
    textareaClassName={styles.textarea}
    disabled={disabled}
    value={code}
    onValueChange={(code) => setCode(code)}
    highlight={(code) => highlight(code, languages.js, "javascript")}
  />
));
