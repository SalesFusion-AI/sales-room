const isBrowser = () => typeof window !== 'undefined';

export const DEFAULT_WORKSPACE_SLUG = 'default';

export function getWorkspaceSlugFromLocation(): string | null {
  if (!isBrowser()) return null;

  const params = new URLSearchParams(window.location.search);
  const querySlug = params.get('workspace');
  if (querySlug) return querySlug;

  const pathParts = window.location.pathname.split('/').filter(Boolean);
  if (pathParts.length === 0) return null;

  if (pathParts[0] === 'room' && pathParts[1]) {
    return pathParts[1];
  }

  if (pathParts[0] && pathParts[0] !== 'index.html') {
    return pathParts[0];
  }

  return null;
}

export function isEmbedMode(): boolean {
  if (!isBrowser()) return false;
  const params = new URLSearchParams(window.location.search);
  const embed = params.get('embed');
  return embed === 'true' || embed === '1' || embed === 'yes';
}

