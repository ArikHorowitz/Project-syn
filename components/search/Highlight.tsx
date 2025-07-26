import React from 'react';

interface HighlightProps {
  text: string;
  highlight: string;
}

const Highlight: React.FC<HighlightProps> = ({ text, highlight }) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <strong key={i} className="text-sky-400 bg-sky-900/50 font-normal rounded-sm">
            {part}
          </strong>
        ) : (
          part
        )
      )}
    </span>
  );
};

export default Highlight;
