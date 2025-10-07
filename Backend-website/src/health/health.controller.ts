import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SupabaseService } from '../submission/supabase.service';
import { EmailService } from '../email/email.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly supabase: SupabaseService,
    private readonly email: EmailService,
  ) {}

  @Get()
  async check() {
    // Check DB
    const dbOk = await this.dataSource
      .query('SELECT 1 as ok')
      .then(() => true)
      .catch(() => false);

    // Check Supabase Storage listBuckets
    const supabaseOk = await this.supabase
      // listBuckets is used internally; calling a public method instead
      .fileExists('manuscripts', 'healthcheck.txt')
      .then(() => true)
      .catch(() => false);

    // const emailPing = await this.email.ping();
    // const status = dbOk && supabaseOk && emailPing.ok ? 'ok' : 'degraded';
    const status = dbOk && supabaseOk ? 'ok' : 'degraded';
    return {
      status,
      checks: {
        database: dbOk ? 'ok' : 'fail',
        supabase: supabaseOk ? 'ok' : 'fail',
        // email: emailPing.ok
        //   ? `ok (${emailPing.provider})`
        //   : `fail (${emailPing.reason || 'unknown'})`,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
