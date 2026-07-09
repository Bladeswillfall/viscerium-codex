import siteConfig from '../../site.config.mjs';

const repoUrl = siteConfig.githubRepoUrl;
const newIssueUrl = `${repoUrl}/issues/new`;

export const supportRoutes = {
  support: '/support/',
  contact: '/contact/',
  changelog: '/changelog/',
};

export const githubSupportLinks = [
  {
    id: 'bug-report',
    icon: 'bug',
    title: 'Report a site bug',
    text: 'Use this for rendering problems, broken widgets, layout regressions, build oddities, or technical faults.',
    href: `${newIssueUrl}?template=bug_report.yml`,
    action: 'Report bug',
  },
  {
    id: 'typo-broken-link',
    icon: 'edit',
    title: 'Report a typo or broken link',
    text: 'Flag spelling errors, dead links, missing redirects, or small copy fixes.',
    href: `${newIssueUrl}?template=typo_or_broken_link.yml`,
    action: 'Report typo',
  },
  {
    id: 'content-correction',
    icon: 'codex',
    title: 'Suggest a content correction',
    text: 'Use this for lore consistency issues, unclear wording, missing context, or article-level corrections.',
    href: `${newIssueUrl}?template=content_correction.yml`,
    action: 'Suggest correction',
  },
  {
    id: 'feature-request',
    icon: 'spark',
    title: 'Request a feature',
    text: 'Suggest new page features, navigation improvements, reference tools, or quality-of-life changes.',
    href: `${newIssueUrl}?template=feature_request.yml`,
    action: 'Request feature',
  },
  {
    id: 'repository',
    icon: 'github',
    title: 'View the GitHub repository',
    text: 'Browse the source, open issues, changelog work, and public development history.',
    href: repoUrl,
    action: 'Open GitHub',
  },
];

export const monetarySupportLinks = [
  {
    id: 'kofi',
    icon: 'kofi',
    title: 'Ko-fi',
    text: 'One-off support for hosting, tooling, references, artwork, and continued Codex development.',
    href: '',
    action: 'Coming soon',
    placeholder: true,
  },
  {
    id: 'patreon',
    icon: 'patreon',
    title: 'Patreon',
    text: 'Recurring support once VISCERIUM has a proper public supporter structure.',
    href: '',
    action: 'Coming soon',
    placeholder: true,
  },
];

export const socialLinks = [
  { id: 'bluesky', label: 'Bluesky', icon: 'bluesky', href: '', placeholder: true },
  { id: 'mastodon', label: 'Mastodon', icon: 'mastodon', href: '', placeholder: true },
  { id: 'twitter-x', label: 'Twitter / X', icon: 'twitter-x', href: '', placeholder: true },
  { id: 'instagram', label: 'Instagram', icon: 'instagram', href: '', placeholder: true },
  { id: 'discord', label: 'Discord', icon: 'discord', href: '', placeholder: true },
];

export const contactReasons = [
  { value: 'general', label: 'General enquiry' },
  { value: 'collaboration', label: 'Collaboration' },
  { value: 'rights', label: 'Rights, credits, or source concern' },
  { value: 'technical', label: 'Technical issue' },
  { value: 'lore', label: 'Lore question' },
  { value: 'other', label: 'Other' },
];

export const contactReasonValues = contactReasons.map((reason) => reason.value);
