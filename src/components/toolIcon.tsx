import type { ToolItem } from '../data/tools';

const STAR_PATH = 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z';

interface ToolIconProps {
  tool: ToolItem;
}

export function ToolIcon({ tool }: ToolIconProps) {
  if (tool.kind === 'image') {
    return <img src={tool.src} alt={tool.name} className="tool-icon-img" />;
  }

  const path = tool.kind === 'star' ? STAR_PATH : tool.path;

  return (
    <svg
      viewBox={tool.viewBox ?? '0 0 24 24'}
      className="tool-icon-svg"
      fill={tool.color}
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}
