# Browser QA Engineer design

The artifact is an evidence desk: choose a journey on the left, follow the actual browser and inspected evidence on the right. One prominent result tells the reader whether the explicit assertions passed. A failed check is useful evidence, not an app error.

Palette: white #ffffff, ink #171717, secondary #686862, rule #e5e5e1, accent #f6be35, workspace #f5f5f3. Positive #20654c and negative #b44242 are reserved for observed check outcomes.

Typography: native system sans serif, large sentence-case headline, compact labels, monospaced only for raw tool output. No decorative metric cards. LDS black mark on white.

Desktop: header / title and run controls / 320px journey rail + flexible evidence stage / prior runs. Tablet and mobile stack the rail above evidence. Evidence images retain their complete aspect ratio and expand in a dialog. Buttons stay outside the image. No tilted mockup or simulated browser recording.

Critique of first plan: an oversized invented browser hero would repeat the previous project's weak landing page. Use a real empty state listing the three available checks, then replace it with actual captured evidence after a run. The active tool log is the only automatic motion; respect reduced-motion preferences.
