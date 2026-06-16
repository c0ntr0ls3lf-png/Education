import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Setting } from '@/lib/db';

export async function GET() {
  try {
    await connectDB();
    const settings = await Setting.find().sort({ group: 1 }).lean();

    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }

    const defaults: Record<string, string> = {
      site_name: 'EduLearn',
      site_description: 'Comprehensive educational platform for Class 1-12',
      site_url: 'https://edulearn.com',
      contact_email: 'info@edulearn.com',
      google_analytics_id: '',
      facebook_pixel_id: '',
      maintenance_mode: 'false',
      registration_enabled: 'true',
      max_exam_attempts: '3',
      default_timer_per_question: '50',
      ads_enabled: 'true',
      social_facebook: '',
      social_twitter: '',
      social_youtube: '',
      social_email: '',
    };

    return NextResponse.json({ ...defaults, ...settingsMap });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    const results: unknown[] = [];
    for (const [key, value] of Object.entries(body)) {
      const result = await Setting.findOneAndUpdate(
        { key },
        { value: String(value), type: 'string', group: 'general' },
        { upsert: true, new: true }
      );
      results.push(result);
    }

    return NextResponse.json({ message: 'Settings saved successfully', count: results.length });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
