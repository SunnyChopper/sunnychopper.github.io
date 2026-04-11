import { isAdminLoginPath, ROUTES } from '@/routes';

/**
 * Knowledge Vault list/courses API is only needed under this prefix.
 * @see KnowledgeVaultProvider — React Query `enabled` uses this.
 */
export function shouldLoadKnowledgeVaultData(pathname: string): boolean {
  return pathname.startsWith(ROUTES.admin.knowledgeVault);
}

const GROWTH_LEAF_ONLY_ROUTES = /^\/admin\/(tasks|habits|metrics|goals|projects)$/;

/**
 * Wallet + rewards lists are deferred on Growth System leaf pages so those screens
 * only load growth data (e.g. tasks/goals/projects). Other admin routes still fetch
 * for header wallet, Reward Studio, store, etc.
 */
export function shouldLoadWalletAndRewards(pathname: string): boolean {
  if (!pathname.startsWith('/admin')) return false;
  if (isAdminLoginPath(pathname)) return false;
  return !GROWTH_LEAF_ONLY_ROUTES.test(pathname);
}
