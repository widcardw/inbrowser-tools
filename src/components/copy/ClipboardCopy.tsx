import { createSignal, type JSX } from 'solid-js';

interface ClipboardCopyProps {
  textToCopy: string;
  children: JSX.Element;
}

const ClipboardCopy: (props: ClipboardCopyProps) => JSX.Element = (props) => {
  const [isCopied, setIsCopied] = createSignal(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(props.textToCopy);
      setIsCopied(true);
      // 2 秒后恢复状态
      setTimeout(() => setIsCopied(false), 2000); 
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button type="button" onClick={handleCopy}>
      {isCopied() ? 'Copied' : props.children}
    </button>
  );
};

export default ClipboardCopy;
