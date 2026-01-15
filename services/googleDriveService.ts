
/**
 * Service to manage Google Drive as a persistence layer for the application.
 * This simulates a "Cloud Database" by storing app state as a JSON file in the user's Drive.
 */

const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'; // User would replace this
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const DB_FILENAME = 'printmaster_db.json';

export class GoogleDriveService {
  private accessToken: string | null = null;

  async initAuth(): Promise<string> {
    return new Promise((resolve, reject) => {
      // @ts-ignore
      const client = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
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
    });
  }

  async saveDatabase(data: any) {
    if (!this.accessToken) throw new Error('Not authenticated');

    const metadata = {
      name: DB_FILENAME,
      mimeType: 'application/json',
    };

    const fileContent = JSON.stringify(data);
    const file = new Blob([fileContent], { type: 'application/json' });

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    // This search/update logic is simplified for the example
    // In a real app, you'd search for the file ID first then PATCH it
    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: form,
    });

    return await response.json();
  }

  async loadDatabase() {
    if (!this.accessToken) throw new Error('Not authenticated');

    // Search for the database file
    const searchResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${DB_FILENAME}'&fields=files(id,name)`,
      {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      }
    );
    const { files } = await searchResponse.json();

    if (files && files.length > 0) {
      const fileId = files[0].id;
      const contentResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });
      return await contentResponse.json();
    }

    return null;
  }
}

export const driveService = new GoogleDriveService();
