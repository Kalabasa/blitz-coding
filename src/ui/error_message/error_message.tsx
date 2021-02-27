import styles from "./error_message.module.css";

export type ErrorMessageProps = {
  error: Error;
};

export const ErrorMessage = ({ error }: ErrorMessageProps) => (
  <div className={styles.container}>{error.message}</div>
);
