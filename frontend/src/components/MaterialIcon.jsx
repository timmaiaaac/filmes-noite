/**
 * Ícone da Material Symbols Outlined, carregada no index.html.
 *
 * `filled` liga o eixo variável FILL, que o protótipo aplicava via
 * style="font-variation-settings: 'FILL' 1".
 */
export default function MaterialIcon({ name, className = "", filled = false, style, ...rest }) {
  return (
    <span
      aria-hidden="true"
      className={`material-symbols-outlined ${className}`}
      style={filled ? { fontVariationSettings: "'FILL' 1", ...style } : style}
      {...rest}
    >
      {name}
    </span>
  );
}
