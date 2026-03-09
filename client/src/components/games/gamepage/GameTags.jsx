import React from 'react';

const GameTags = ({ tags, onTagClick }) => {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-4">
      {tags.map((tag) => (
        <span
          key={tag.id || tag.name}
          onClick={() => onTagClick && onTagClick(tag)}
          className={`text-xs px-3 py-1.5 rounded-md bg-gray-800 border border-gray-700 text-gray-300 cursor-pointer transition-all hover:bg-teal-900 hover:border-theme_color2 hover:text-teal-300 ${
            onTagClick ? 'hover:scale-105' : ''
          }`}
        >
          {tag.name.toUpperCase()}
        </span>
      ))}
    </div>
  );
};

export default GameTags;