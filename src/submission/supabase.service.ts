import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly supabase;
  private readonly logger = new Logger(SupabaseService.name);

  constructor(configService: ConfigService) {
    const supabaseUrl = configService.get<string>('SUPABASE_URL');
    const supabaseServiceRoleKey = configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new BadRequestException(
        'Supabase configuration is missing in environment variables',
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    path: string,
    bucket = 'manuscripts',
  ): Promise<string> {
    if (!file || !file.buffer) {
      throw new BadRequestException('File or file buffer is missing');
    }
    if (!path) {
      throw new BadRequestException('Path is missing');
    }

    try {
      // Check if bucket exists, create if it doesn't
      const { data: buckets } = await this.supabase.storage.listBuckets();
      const bucketExists = buckets.some((b) => b.name === bucket);

      if (!bucketExists) {
        await this.supabase.storage.createBucket(bucket, {
          public: true,
          fileSizeLimit: 50 * 1024 * 1024, // 50MB limit
        });
      }

      const { data, error } = await this.supabase.storage
        .from(bucket)
        .upload(path, file.buffer, {
          contentType: file.mimetype,
          upsert: false, // Don't overwrite existing files
        });

      if (error) {
        this.logger.error(
          `File upload failed to bucket ${bucket}: ${error.message}`,
        );
        throw new BadRequestException(`File upload failed: ${error.message}`);
      }

      this.logger.log(`File uploaded successfully to ${bucket}/${data.path}`);
      return data.path;
    } catch (error) {
      this.logger.error(`File upload failed to ${bucket}: ${error.message}`);
      throw new BadRequestException(`File upload failed: ${error.message}`);
    }
  }

  getFileUrl(bucket: string, path: string): string {
    if (!bucket || !path) {
      throw new BadRequestException('Bucket or path is missing');
    }

    const { data } = this.supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async deleteFile(bucket: string, path: string) {
    try {
      const { error } = await this.supabase.storage.from(bucket).remove([path]);
      if (error) {
        this.logger.error(
          `File delete failed from ${bucket}/${path}: ${error.message}`,
        );
        throw new BadRequestException(`File delete failed: ${error.message}`);
      }
      this.logger.log(`File deleted successfully from ${bucket}/${path}`);
    } catch (error) {
      this.logger.error(`File deletion error: ${error.message}`);
      throw error;
    }
  }

  // NEW: Method to check if file exists
  async fileExists(bucket: string, path: string): Promise<boolean> {
    try {
      const { data } = await this.supabase.storage.from(bucket).list('', {
        limit: 1,
        offset: 0,
        search: path,
      });

      return data && data.length > 0;
    } catch (error) {
      this.logger.error(`Error checking file existence: ${error.message}`);
      return false;
    }
  }
}
