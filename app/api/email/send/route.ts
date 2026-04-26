import { NextResponse } from "next/server";
import * as crypto from "crypto";
import { sendEmail, EmailTemplate } from "@/lib/email/resend";
import { z } from "zod";

const EmailSchema = z.object({
  to: z.string().email(),
  template: z.enum(['welcome', 'subscription_confirmed', 'draw_results', 'winner', 'payout_confirmed', 'password_reset']),
  data: z.any()
});

export async function POST(request: Request) {
  try {
    // Basic internal protection: normally you'd use a secret header to ensure this is only called by trusted sources
    const internalSecret = request.headers.get("x-internal-secret") || "";
    const envSecret = process.env.INTERNAL_API_SECRET;
    
    if (process.env.NODE_ENV === 'production') {
      if (!envSecret || !internalSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      
      const internalSecretBuffer = Buffer.from(internalSecret);
      const envSecretBuffer = Buffer.from(envSecret);
      
      if (internalSecretBuffer.length !== envSecretBuffer.length || 
          !crypto.timingSafeEqual(internalSecretBuffer, envSecretBuffer)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = await request.json();
    const parsed = EmailSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const result = await sendEmail(parsed.data);
    
    if (!result.success) {
      return NextResponse.json({ error: "Email sending failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true, result });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
