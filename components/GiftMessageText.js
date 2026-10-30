import React from 'react';

// Renders a sender's message. Messages are plain text with **bold** and _italic_ markers;
// they're turned into React elements here (never HTML), so nothing a sender types can run.
const TOKEN = /(\*\*[^*\n]+\*\*|_[^_\n]+_)/g;

const renderLine = (line, key) =>
  line.split(TOKEN).map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={`${key}-${i}`}>{part.slice(2, -2)}</strong>;
    if (/^_[^_]+_$/.test(part)) return <em key={`${key}-${i}`}>{part.slice(1, -1)}</em>;
    return <React.Fragment key={`${key}-${i}`}>{part}</React.Fragment>;
  });

const GiftMessageText = ({ text }) => {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, i) => (
        <React.Fragment key={i}>
          {renderLine(line, i)}
          {i < lines.length - 1 && <br />}
        </React.Fragment>
      ))}
    </>
  );
};

export default GiftMessageText;
