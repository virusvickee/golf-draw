import { Html, Head, Body, Container, Text, Button, Section } from "@react-email/components";
import * as React from "react";

interface PasswordResetEmailProps {
  resetLink: string;
}

export const PasswordResetEmail = ({ resetLink }: PasswordResetEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#0f172a", fontFamily: "sans-serif", color: "#f8fafc" }}>
        <Container style={{ margin: "0 auto", padding: "40px 20px", maxWidth: "600px" }}>
          <Text style={{ fontSize: "24px", fontWeight: "bold", color: "#10b981", marginBottom: "20px" }}>
            Reset Your Password
          </Text>
          <Text style={{ fontSize: "16px", lineHeight: "24px", color: "#cbd5e1", marginBottom: "24px" }}>
            We received a request to reset your password for your Golf Draw account. Click the button below to choose a new password.
          </Text>
          
          <Section style={{ textAlign: "center", marginBottom: "24px" }}>
            <Button 
              href={resetLink}
              style={{ backgroundColor: "#10b981", color: "#ffffff", padding: "12px 24px", borderRadius: "6px", textDecoration: "none", fontWeight: "bold" }}
            >
              Reset Password
            </Button>
          </Section>

          <Text style={{ fontSize: "14px", color: "#94a3b8", margin: "0 0 16px 0" }}>
            This link will expire in 1 hour.
          </Text>

          <Text style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
            If you didn't request a password reset, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default PasswordResetEmail;
