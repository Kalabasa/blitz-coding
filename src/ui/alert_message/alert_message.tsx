import classNames from "classnames";
import styles from "./alert_message.module.css";

export type AlertMessageProps = {
  messages: Message[];
};

type Message =
  | {
      log: string;
    }
  | {
      error: Error;
    };

export const AlertMessage = ({ messages }: AlertMessageProps) => {
  return (
    <div className={styles.container}>
      {messages.map((m, i) => {
        let string, className;
        if ("log" in m) {
          string = m.log;
          className = styles.log;
        } else {
          string = m.error.message;
          className = styles.error;
        }
        return (
          <div key={i} className={classNames(styles.item, className)}>
            {string}
          </div>
        );
      })}
    </div>
  );
};
