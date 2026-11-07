const artworkLabels = {
  applications: 'Application deployment layers',
  jobs: 'Workload queue',
  scheduler: 'Job scheduling flow',
  logs: 'Runtime log activity',
  settings: 'Connected system services',
  detail: 'Application service topology',
  auth: 'Connected deployment platform',
};

export default function PageArtwork({ variant }) {
  return (
    <svg
      className={`page-artwork page-artwork-${variant}`}
      viewBox="0 0 176 104"
      role="img"
      aria-label={artworkLabels[variant]}
      focusable="false"
    >
      {variant === 'applications' && (
        <>
          <path className="artwork-line" d="M22 30 88 12l66 18-66 19-66-19Z" />
          <path className="artwork-line" d="M22 49 88 68l66-19M22 64l66 19 66-19" />
          <path className="artwork-accent-line" d="M34 30 88 45l54-15M34 51l54 15 54-15" />
          <circle className="artwork-node" cx="153" cy="30" r="4" />
          <circle className="artwork-node-secondary" cx="22" cy="64" r="4" />
        </>
      )}
      {variant === 'jobs' && (
        <>
          <path className="artwork-line" d="M25 25h125M25 52h125M25 79h125" />
          <rect className="artwork-panel" x="30" y="16" width="104" height="18" rx="6" />
          <rect className="artwork-panel" x="30" y="43" width="82" height="18" rx="6" />
          <rect className="artwork-panel" x="30" y="70" width="94" height="18" rx="6" />
          <circle className="artwork-node" cx="143" cy="25" r="5" />
          <circle className="artwork-node-secondary" cx="121" cy="52" r="4" />
          <circle className="artwork-node-muted" cx="133" cy="79" r="4" />
        </>
      )}
      {variant === 'scheduler' && (
        <>
          <path className="artwork-line" d="M28 52h120M57 25l32 27-32 27m32-27 31-27m-31 27 31 27" />
          <circle className="artwork-node-muted" cx="28" cy="52" r="9" />
          <circle className="artwork-node" cx="57" cy="25" r="8" />
          <circle className="artwork-node-secondary" cx="57" cy="79" r="8" />
          <circle className="artwork-node" cx="120" cy="25" r="8" />
          <circle className="artwork-node-secondary" cx="120" cy="79" r="8" />
          <rect className="artwork-panel" x="139" y="43" width="18" height="18" rx="6" />
        </>
      )}
      {variant === 'logs' && (
        <>
          <rect className="artwork-frame" x="18" y="17" width="140" height="70" rx="10" />
          <path className="artwork-line" d="M31 34h39m-39 9h25m-25 34h35" />
          <path className="artwork-accent-line artwork-wave" d="m88 66 10-18 9 25 10-34 9 27 10-15 9 15" />
          <circle className="artwork-node" cx="139" cy="29" r="3" />
        </>
      )}
      {variant === 'settings' && (
        <>
          <path className="artwork-line" d="M34 53h108M57 29l22 24-22 24m39-24 22-24m-22 24 22 24" />
          <rect className="artwork-panel" x="19" y="42" width="30" height="22" rx="8" />
          <circle className="artwork-node" cx="57" cy="29" r="7" />
          <circle className="artwork-node-secondary" cx="57" cy="77" r="7" />
          <rect className="artwork-panel" x="79" y="42" width="34" height="22" rx="8" />
          <circle className="artwork-node" cx="122" cy="29" r="7" />
          <circle className="artwork-node-secondary" cx="122" cy="77" r="7" />
          <rect className="artwork-panel" x="136" y="42" width="24" height="22" rx="8" />
        </>
      )}
      {variant === 'detail' && (
        <>
          <path className="artwork-line" d="M25 51h42m42 0h42M67 51 88 27m21 24-21 25" />
          <rect className="artwork-panel" x="13" y="39" width="31" height="24" rx="8" />
          <rect className="artwork-panel" x="73" y="15" width="30" height="24" rx="8" />
          <rect className="artwork-panel" x="73" y="68" width="30" height="24" rx="8" />
          <rect className="artwork-panel" x="132" y="39" width="31" height="24" rx="8" />
          <circle className="artwork-node" cx="29" cy="51" r="3" />
          <circle className="artwork-node-secondary" cx="88" cy="27" r="3" />
          <circle className="artwork-node-muted" cx="88" cy="80" r="3" />
          <circle className="artwork-node" cx="147" cy="51" r="3" />
        </>
      )}
      {variant === 'auth' && (
        <>
          <path className="artwork-line" d="M34 79h108M47 64V38a8 8 0 0 1 8-8h66a8 8 0 0 1 8 8v26" />
          <rect className="artwork-panel" x="47" y="38" width="82" height="43" rx="8" />
          <path className="artwork-accent-line" d="M67 53h42m-42 10h26" />
          <circle className="artwork-node" cx="113" cy="63" r="3" />
          <circle className="artwork-node-secondary" cx="36" cy="31" r="4" />
          <circle className="artwork-node-muted" cx="143" cy="48" r="4" />
        </>
      )}
    </svg>
  );
}
