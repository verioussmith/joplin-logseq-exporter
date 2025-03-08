import joplin from 'api';

export const helper = {
  async joplinVersionInfo() {
    return await joplin.versionInfo();
  },
  
  async versionCompare(v1: string, v2: string) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;
      if (p1 !== p2) return p1 > p2 ? 1 : -1;
    }
    return 0;
  }
}; 