/**
 * Service to manage Google Drive as a persistence layer for the application.
 */

declare var google: any;

const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const DB_FILENAME = 'printmaster_enterprise_vault.json';

export class GoogleDriveService {
  private accessToken: string | null = null;
  private fileId: string | null = null;

  async initAuth(clientId: string): Promise<string> {
    if (!clientId) throw new Error("Google Drive Client ID is not configured.");

    return new Promise((resolve, reject) => {
      try {
        const client = google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: SCOPES,
          callback: (response: any) => {
            if (response.error) {
              reject(response);
            }
            this.accessToken = response.access_token;
            resolve(response.access_token);
          },
        });
        client.requestAccessToken();
      } catch (err) {
        reject(err);
      }
    });
  }

  private async findDatabaseFile(): Promise<string | null> {
    if (!this.accessToken) return null;
    const searchResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${DB_FILENAME}' and trashed=false&fields=files(id,name)`,
      { headers: { Authorization: `Bearer ${this.accessToken}` } }
    );
    const { files } = await searchResponse.json();
    if (files && files.length > 0) {
      this.fileId = files[0].id;
      return files[0].id;
    }
    return null;
  }

  async saveDatabase(data: any, clientId: string) {
    if (!this.accessToken) await this.initAuth(clientId);

    const fileId = this.fileId || await this.findDatabaseFile();
    const fileContent = JSON.stringify(data, null, 2);
    const blob = new Blob([fileContent], { type: 'application/json' });

    if (fileId) {
      await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: blob,
      });
    } else {
      const metadata = { name: DB_FILENAME, mimeType: 'application/json' };
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', blob);

      const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.accessToken}` },
        body: form,
      });
      const json = await res.json();
      this.fileId = json.id;
    }
    return { success: true };
  }

  async loadDatabase(clientId: string) {
    if (!this.accessToken) await this.initAuth(clientId);
    const fileId = await this.findDatabaseFile();
    if (fileId) {
      const contentResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });
      return await contentResponse.json();
    }
    return null;
  }
}

export const driveService = new GoogleDriveService();