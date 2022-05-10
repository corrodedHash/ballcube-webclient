export default interface Loop {
  start: () => void;
  stop: () => void;
  tick: () => void;
}
