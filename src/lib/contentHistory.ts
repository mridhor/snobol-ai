// Content versioning and history system
export interface ContentVersion {
  id: string;
  contentId: string;
  content: string;
  html: string;
  updatedAt: Date;
  updatedBy: string;
  version: number;
  changeType: 'create' | 'update' | 'delete';
  description?: string;
}

// In-memory version history (replace with database in production)
let contentHistory: ContentVersion[] = [];

export function addContentVersion(
  contentId: string,
  content: string,
  html: string,
  updatedBy: string,
  changeType: 'create' | 'update' | 'delete' = 'update',
  description?: string
): ContentVersion {
  const existingVersions = contentHistory.filter(v => v.contentId === contentId);
  const version = existingVersions.length + 1;

  const versionEntry: ContentVersion = {
    id: `${contentId}-v${version}`,
    contentId,
    content,
    html,
    updatedAt: new Date(),
    updatedBy,
    version,
    changeType,
    description
  };

  contentHistory.push(versionEntry);
  return versionEntry;
}

export function getContentHistory(contentId: string): ContentVersion[] {
  return contentHistory
    .filter(v => v.contentId === contentId)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

export function getAllContentHistory(): ContentVersion[] {
  return contentHistory.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

export function getContentVersion(contentId: string, version: number): ContentVersion | null {
  return contentHistory.find(v => v.contentId === contentId && v.version === version) || null;
}

export function revertToVersion(contentId: string, version: number): ContentVersion | null {
  const targetVersion = getContentVersion(contentId, version);
  if (!targetVersion) return null;

  // Create a new version with the reverted content
  return addContentVersion(
    contentId,
    targetVersion.content,
    targetVersion.html,
    'system',
    'update',
    `Reverted to version ${version}`
  );
}

export function getRecentChanges(limit: number = 10): ContentVersion[] {
  return contentHistory
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, limit);
}

export function getChangesByUser(user: string): ContentVersion[] {
  return contentHistory
    .filter(v => v.updatedBy === user)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

export function getContentStats() {
  const totalVersions = contentHistory.length;
  const uniqueContent = new Set(contentHistory.map(v => v.contentId)).size;
  const recentChanges = getRecentChanges(5);
  const mostActiveUser = contentHistory.reduce((acc, v) => {
    acc[v.updatedBy] = (acc[v.updatedBy] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalVersions,
    uniqueContent,
    recentChanges,
    mostActiveUser: Object.entries(mostActiveUser).sort(([,a], [,b]) => b - a)[0]?.[0] || 'None',
    lastUpdated: recentChanges[0]?.updatedAt || new Date()
  };
}
