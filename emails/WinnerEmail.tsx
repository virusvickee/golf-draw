import { Html, Head, Body, Container, Text, Button, Section } from "@react-email/components";
import * as React from "react";

interface WinnerEmailProps {
  amount: string;
  matchType: string;
}

export const WinnerEmail = ({ amount, matchType }: WinnerEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#0f172a", fontFamily: "sans-serif", color: "#f8fafc" }}>
        <Container style={{ margin: "0 auto", padding: "40px 20px", maxWidth: "600px" }}>
          <Section style={{ textAlign: "center", marginBottom: "32px" }}>
            <Text style={{ fontSize: "48px", margin: "0 0 16px 0" }}>🏆</Text>
            <Text style={{ fontSize: "28px", fontWeight: "bold", color: "#10b981", margin: "0 0 8px 0" }}>
              Congratulations!
            </Text>
            <Text style={{ fontSize: "18px", color: "#cbd5e1", margin: 0 }}>
              You hit a {matchType} and won:
            </Text>
            <Text style={{ fontSize: "42px", fontWeight: "900", color: "#ffffff", margin: "16px 0" }}>
              {amount}
            </Text>
          </Section>
          
          <Section style={{ backgroundColor: "#1e293b", padding: "20px", borderRadius: "8px", margin: "24px 0" }}>
            <Text style={{ fontSize: "16px", fontWeight: "bold", margin: "0 0 10px 0", color: "#f59e0b" }}>⚠️ Action Required</Text>
            <Text style={{ fontSize: "14px", lineHeight: "24px", color: "#cbd5e1", margin: 0 }}>
              To claim your prize, please upload proof of your matching scores within the next <strong>7 days</strong>. A photo of your signed scorecard or a screenshot from your official club app is required for verification.
            </Text>
          </Section>

          <Section style={{ textAlign: "center", marginTop: "32px" }}>
            <Button 
              href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/winnings`}
              style={{ backgroundColor: "#10b981", color: "#ffffff", padding: "14px 28px", borderRadius: "6px", textDecoration: "none", fontWeight: "bold", fontSize: "16px" }}
            >
              Upload Proof Now
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default WinnerEmail;
