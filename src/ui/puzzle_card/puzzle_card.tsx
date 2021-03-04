import classNames from "classnames";
import {
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { Icon } from "ui/icon/icon";
import { ReactComponent as PlaySVG } from "ui/icon/svg/play.svg";
import { ReactComponent as WaitSVG } from "ui/icon/svg/wait.svg";
import { Logo } from "ui/logo/logo";
import styles from "./puzzle_card.module.css";

export type PuzzleCardProps = {
  graphics: ReactNode;
  editor: ReactNode;
  modCode?: string;
  codePrefix: string;
  codeSuffix: string;
  outcome?: "success" | "failure";
  focus?: boolean;
  executing?: boolean;
  submitDisabled?: boolean;
  onSubmit: () => void;
};

export const PuzzleCard = ({
  graphics,
  editor,
  modCode,
  codePrefix,
  codeSuffix,
  outcome,
  focus = false,
  executing = false,
  submitDisabled = false,
  onSubmit,
}: PuzzleCardProps) => {
  const editorRef = useRef<HTMLDivElement | null>(null);

  const setEditorRef = useCallback((node) => {
    initializeSelection(node);
    editorRef.current = node;
  }, []);

  useEffect(() => {
    if (focus) {
      focusChildTextArea(editorRef.current);
    }
  }, [focus]);

  const onKey = useCallback(
    (event: KeyboardEvent) => {
      if (!event.ctrlKey || event.key !== "Enter") return;

      event.stopPropagation();
      event.preventDefault();

      onSubmit();
    },
    [onSubmit]
  );

  const onClickSubmitButton = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      onSubmit();
    },
    [onSubmit]
  );

  return (
    <div
      className={classNames(
        styles.puzzleCard,
        outcome && styles[outcome],
        !focus && styles.blur
      )}
      onKeyPressCapture={onKey}
      onKeyDownCapture={onKey}
    >
      <div className={styles.frontface}>
        <div className={styles.graphicsContainer}>{graphics}</div>
        {modCode && (
          <div className={styles.modCodeContainer}>
            {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
            <div className={styles.modHeader}>// Modifiers:</div>
            <pre className={classNames("code", styles.modCode)}>{modCode}</pre>
          </div>
        )}
        <div
          className={classNames("code", styles.codeContainer)}
          onMouseDown={(event) => focusChildTextArea(editorRef.current, event)}
        >
          <pre className={classNames("code", styles.extraCode)}>
            {codePrefix}
          </pre>
          <div ref={setEditorRef} className={styles.editor}>
            {editor}
          </div>
          <pre className={classNames("code", styles.extraCode)}>
            {codeSuffix}
          </pre>
          {executing ? (
            <div className={styles.waitIcon}>
              <Icon svg={WaitSVG} />
            </div>
          ) : (
            <button
              className={styles.submitButton}
              disabled={submitDisabled || !focus}
              onClick={onClickSubmitButton}
            >
              <Icon svg={PlaySVG} />
            </button>
          )}
        </div>
      </div>
      <div className={styles.backface}>
        <Logo className={styles.logo} variant="colored" />
      </div>
    </div>
  );
};

function initializeSelection(node: HTMLElement | null) {
  const textArea = node?.querySelector("textarea");

  if (!textArea) return;

  textArea.setSelectionRange(textArea.value.length, textArea.value.length);
}

function focusChildTextArea(
  root: HTMLElement | null,
  event?: MouseEvent<HTMLElement>
) {
  const textArea = root?.querySelector("textarea");

  if (!textArea) return;

  setTimeout(() => textArea.focus({ preventScroll: true }));

  if (!event) return;

  const area = textArea.getBoundingClientRect();

  if (event.clientY < area.y) {
    textArea.setSelectionRange(0, 0);
  } else if (event.clientY > area.bottom) {
    textArea.setSelectionRange(textArea.value.length, textArea.value.length);
  }

  if (event.clientX < area.x) {
    textArea.setSelectionRange(0, 0);
  } else if (event.clientX > area.right) {
    textArea.setSelectionRange(textArea.value.length, textArea.value.length);
  }
}
