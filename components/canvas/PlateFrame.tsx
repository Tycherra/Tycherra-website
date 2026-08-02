/*  ═══════════════════════════════════════════════════════════════════
    PLATE FRAME — every project's frame is drawn, not styled.
    Corner brackets and dimension leads, held in the entry's own pair
    of ramp stops.

    Stage 1 states the finished frame. Stage 3 replaces it with the
    measured SVG that plots itself in as the project arrives, and
    stage 5 extends the corners by 4px on hover alongside the duotone
    release — the geometry is identical, so nothing shifts.
    ═══════════════════════════════════════════════════════════════════ */

export function PlateFrame() {
  return (
    <div className="pl__f" aria-hidden="true">
      <i className="pl__c pl__c--tl" />
      <i className="pl__c pl__c--tr" />
      <i className="pl__c pl__c--br" />
      <i className="pl__c pl__c--bl" />
      <i className="pl__dim pl__dim--t" />
      <i className="pl__dim pl__dim--l" />
    </div>
  );
}

/*  ── the entry with no public interface states its flow instead ────
    rider → OTP gate → handover → return → report. The same plan the
    plotter draws in stage 3, at rest.
    ─────────────────────────────────────────────────────────────── */

const VB_W = 1000;
const VB_H = 625;

function plan(): string {
  const seg: string[] = [];
  const L = (a: number, b: number, c: number, d: number) =>
    seg.push(
      `M${(a * VB_W).toFixed(1)} ${(b * VB_H).toFixed(1)}L${(c * VB_W).toFixed(1)} ${(d * VB_H).toFixed(1)}`,
    );

  const bx = [0.08, 0.3, 0.52, 0.74];
  const by = 0.36;
  const bw = 0.14;
  const bh = 0.16;

  bx.forEach((x, i) => {
    L(x, by, x + bw, by);
    L(x + bw, by, x + bw, by + bh);
    L(x + bw, by + bh, x, by + bh);
    L(x, by + bh, x, by);
    if (i < bx.length - 1) {
      const nx = bx[i + 1];
      L(x + bw, by + bh / 2, nx, by + bh / 2);
      L(nx - 0.017, by + bh / 2 - 0.017, nx, by + bh / 2);
      L(nx - 0.017, by + bh / 2 + 0.017, nx, by + bh / 2);
    }
  });

  /* the OTP gate, hung above the second station */
  L(0.37, 0.36, 0.37, 0.2);
  L(0.3, 0.2, 0.44, 0.2);
  L(0.3, 0.2, 0.3, 0.11);
  L(0.44, 0.2, 0.44, 0.11);
  L(0.3, 0.11, 0.44, 0.11);
  for (let i = 0; i < 4; i++) {
    const x = 0.316 + i * 0.032;
    L(x, 0.145, x, 0.166);
  }

  /* the report, returned to the team */
  L(0.81, 0.52, 0.81, 0.64);
  L(0.66, 0.64, 0.96, 0.64);
  L(0.66, 0.64, 0.66, 0.88);
  L(0.96, 0.64, 0.96, 0.88);
  L(0.66, 0.88, 0.96, 0.88);
  for (let i = 0; i < 4; i++) {
    const y = 0.69 + i * 0.05;
    L(0.7, y, 0.92, y);
  }

  return seg.join("");
}

export function FlowPlate() {
  return (
    <svg
      className="pl__plot"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={plan()}
        fill="none"
        stroke="var(--g2)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.82}
      />
    </svg>
  );
}
