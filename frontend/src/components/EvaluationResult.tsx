import styles from './EvaluationResult.module.css';

interface Props {
  match: boolean | null;
  error: string | null;
}

export const EvaluationResult = ({ match, error }: Props) => {
  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }
  if (match === true) {
    return <div className={styles.match}>✓ Match — the cart satisfies the conditions</div>;
  }
  return <div className={styles.noMatch}>✗ No match — the cart does not satisfy the conditions</div>;
};
