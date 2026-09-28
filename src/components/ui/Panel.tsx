import type { ReactNode } from 'react';
import './ui.css';

interface Props {
  title?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
  padded?: boolean;
}

export function Panel({ title, children, action, className = '', padded = true }: Props) {
  return (
    <section className={`panel ${padded ? 'panel-padded' : ''} ${className}`}>
      {(title || action) && (
        <header className="panel-header">
          {title ? <h3 className="panel-title">{title}</h3> : <span />}
          {action}
        </header>
      )}
      <div className="panel-body">{children}</div>
    </section>
  );
}
