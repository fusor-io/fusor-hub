import { Bucket, Storage } from '@google-cloud/storage';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crc32 from 'crc-32';
import { Config } from 'src/shared/type';
import { inspect } from 'util';

/**
 * Backup service stores database data in a Google Storage
 * @see: https://www.npmjs.com/package/@google-cloud/storage
 */

@Injectable()
export class BackupService {
  private readonly _logger = new Logger(this.constructor.name);
  private readonly _storage = new Storage();
  private _bucket: Bucket;

  constructor(private readonly _configService: ConfigService) {
    this._initBucket();
  }

  private async _initBucket(): Promise<void> {
    const bucketName = this._configService.get(Config.googleCloudStorageBucket);
    if (!bucketName) {
      this._logger.log('Google Cloud Storage is not configured');
      return;
    }

    try {
      this._bucket = this._storage.bucket(bucketName, {
        userProject: this._configService.get(Config.googleCloudProjectId),
      });
    } catch (error) {
      this._logger.error(`Error getting bucket ${bucketName}`, error);
    }
  }

  async saveFileJson(fileName: string, content: string | object): Promise<boolean> {
    try {
      if (!this._bucket) {
        this._logger.warn('Google Cloud Storage bucket is not available, aborting backup');
        return false;
      }

      const dataStr = typeof content === 'string' ? content : JSON.stringify(content);
      const crc: number = crc32.str(dataStr);
      const crcStr = crc.toString(16);

      const buffer = Buffer.from(dataStr);
      const filePath = `${this._configService.get(
        Config.googleCloudStorageBackupFolder,
      )}/${fileName}-${crcStr}.json`;

      const blob = this._bucket.file(filePath);
      const blobStream = blob.createWriteStream({
        contentType: 'application/json',
        metadata: { 'Cache-Control': 'no-cache' },
      });

      await new Promise((resolve, reject) => {
        blobStream.on('error', error => {
          reject(error);
        });

        blobStream.on('finish', () => {
          // The public URL can be used to directly access the file via HTTP.
          const publicUrl = `https://storage.googleapis.com/${this._bucket.name}/${blob.name}`;
          this._logger.log(`File "${publicUrl}" created`);
          this._logger.log(`${buffer.byteLength} bytes written`);
          resolve();
        });

        blobStream.end(buffer);
      });

      return true;
    } catch (error) {
      this._logger.error(`Failed uploading file ${fileName}`, inspect(error, { getters: true }));
      return false;
    }
  }
}
