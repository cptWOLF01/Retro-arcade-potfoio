// Window-style card: title bar + 3 dots, chunky border, hard pixel shadow
export default function Win({ title, children, className = '', color = '#ff8cc0', bodyClass = '', as: Tag = 'section', ...rest }) {
  return (
    <Tag className={`win ${className}`} {...rest}>
      <div className="win-bar" style={{ background: color }}>
        <span className="win-title">{title}</span>
        <span className="win-dots" aria-hidden="true"><i /><i /><i /></span>
      </div>
      <div className={`win-body ${bodyClass}`}>{children}</div>
    </Tag>
  )
}
