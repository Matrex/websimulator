export interface Version {
  id: number;
  timestamp: number;
  content: string;
  description: string;
}

export class VersionManager {
  private versions: Version[] = [];
  private currentVersion: number = -1;

  addVersion(content: string, description: string = 'Changes made'): void {
    this.versions.push({
      id: this.versions.length,
      timestamp: Date.now(),
      content,
      description
    });
    this.currentVersion = this.versions.length - 1;
  }

  restore(versionId: number): string | null {
    const version = this.versions.find(v => v.id === versionId);
    if (version) {
      this.currentVersion = versionId;
      return version.content;
    }
    return null;
  }

  getCurrentVersion(): number {
    return this.currentVersion;
  }

  getVersions(): Version[] {
    return this.versions;
  }
}
