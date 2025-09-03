import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly supabase;
  private readonly logger = new Logger(SupabaseService.name);

  constructor(configService: ConfigService) {
    const supabaseUrl = configService.get<string>('SUPABASE_URL');
    const supabaseAnonKey = configService.get<string>('SUPABASE_ANON_KEY');
    const supabaseServiceRoleKey = configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      throw new BadRequestException(
        'Supabase configuration is missing in environment variables',
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  }

  async uploadFile(file: Express.Multer.File, path: string): Promise<string> {
    if (!file || !file.buffer) {
      throw new BadRequestException('File or file buffer is missing');
    }
    console.log(file);

    if (!path) {
      throw new BadRequestException('Path is missing');
    }

    try {
      const { data, error } = await this.supabase.storage
        .from('manuscripts')
        .upload(path, file.buffer, {
          contentType: file.mimetype,
        });

      if (error) {
        console.log('in error' + path);
        this.logger.error(`File upload failed: ${error.message}`);
        throw new BadRequestException(`File upload failed: ${error.message}`);
      }

      this.logger.log(`File uploaded successfully: ${data.path}`);
      return data.path;
    } catch (error) {
      this.logger.error(`File upload failed: ${error.message}`);
      throw new BadRequestException(`File upload failed: ${error.message}`);
    }
  }

  getFileUrl(bucket: string, path: string) {
    if (!bucket || !path) {
      throw new BadRequestException('Bucket or path is missing');
    }

    const { data } = this.supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  // New method for deletion (called in rollback)
  async deleteFile(bucket: string, path: string) {
    const { error } = await this.supabase.storage.from(bucket).remove([path]);
    if (error) {
      this.logger.error(`File delete failed: ${error.message}`);
      throw new BadRequestException(`File delete failed: ${error.message}`);
    }
    this.logger.log(`File deleted successfully: ${path}`);
  }
}
