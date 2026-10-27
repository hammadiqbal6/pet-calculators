## Summary

<!-- What changed and why. -->

## Checklist

- [ ] `npm test` and `npm run build` pass locally
- [ ] For publish-ready content: `npm run audit` (and `npm run lhci` / `npm run proof` when templates or CWV matter)
- [ ] No placeholder / TODO / lorem text in shipped pages
- [ ] Keyword map / registries updated if a page was added or renamed

## UI/UX Pro Max

Required for any change to how the site looks or behaves (CSS, layout, calculator UI, nav, forms, motion, dark mode). Skip only for pure formula/docs/CI changes with no visual impact.

- [ ] Consulted `.cursor/skills/ui-ux-pro-max/SKILL.md` (and ran `python3 .cursor/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain <domain>` / `--stack astro` / `--design-system` as needed)
- [ ] Contrast ≥ 4.5:1 (including dark mode)
- [ ] Touch targets ≥ 44×44px
- [ ] Visible focus styles
- [ ] Form labels and inline errors
- [ ] Dark mode checked
- [ ] No horizontal scroll on common viewports; `prefers-reduced-motion` respected
- [ ] Screenshots attached for visual changes
