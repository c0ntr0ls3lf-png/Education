import { NextRequest, NextResponse } from 'next/server';
import { connectDB, User, toDoc } from '@/lib/db';
import { signAuthToken } from '@/lib/auth-cookie';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { provider, name, email, providerId, image } = body;

    if (!provider || !name || !email) {
      return NextResponse.json(
        { error: 'Provider, name, and email are required' },
        { status: 400 }
      );
    }

    if (!['google', 'facebook'].includes(provider)) {
      return NextResponse.json(
        { error: 'Unsupported provider' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email }).lean();

    if (existingUser) {
      const updatedUser = await User.findByIdAndUpdate(
        existingUser._id,
        {
          provider,
          providerId: providerId || existingUser.providerId,
          image: image || existingUser.image,
          name: name || existingUser.name,
          emailVerified: true,
        },
        { new: true }
      ).lean();

      const userResponse = toDoc(updatedUser);
      delete (userResponse as Record<string, unknown>).password;

      const response = NextResponse.json({
        user: userResponse,
        isNew: false,
        message: `Welcome back, ${updatedUser!.name}!`,
      });

      const token = await signAuthToken({ id: updatedUser!._id, email: updatedUser!.email, role: updatedUser!.role });
      response.cookies.set('eduAuthToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      return response;
    }

    const newUser = await User.create({
      email,
      name,
      image: image || null,
      provider,
      providerId: providerId || `${provider}_${Date.now()}`,
      role: 'student',
      emailVerified: true,
      password: null,
    });

    const newUserDoc = toDoc(newUser.toObject());
    delete (newUserDoc as Record<string, unknown>).password;

    const response = NextResponse.json({
      user: newUserDoc,
      isNew: true,
      message: `Welcome to EduLMS, ${newUser.name}!`,
    });

    const token = await signAuthToken({ id: newUser._id, email: newUser.email, role: newUser.role });
    response.cookies.set('eduAuthToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Social login error:', error);
    return NextResponse.json(
      { error: 'Failed to authenticate with social provider' },
      { status: 500 }
    );
  }
}
