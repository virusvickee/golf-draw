import { Html, Head, Body, Container, Text, Button, Section, Row, Column } from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
  name: string;
  charityName: string;
  charityPercentage: number;
}

export const WelcomeEmail = ({ name, charityName, charityPercentage }: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#0f172a", fontFamily: "sans-serif", color: "#f8fafc" }}>
        <Container style={{ margin: "0 auto", padding: "40px 20px", maxWidth: "600px" }}>
          <Text style={{ fontSize: "24px", fontWeight: "bold", color: "#10b981", marginBottom: "20px" }}>
            Welcome to Golf Draw 🏌️
          </Text>
          <Text style={{ fontSize: "16px", lineHeight: "24px", color: "#cbd5e1" }}>
            Hi {name}, welcome to the platform where your golf scores make a difference.
          </Text>
          
          <Section style={{ backgroundColor: "#1e293b", padding: "20px", borderRadius: "8px", margin: "24px 0" }}>
            <Text style={{ fontSize: "16px", fontWeight: "bold", margin: "0 0 10px 0" }}>Your Impact</Text>
            <Text style={{ margin: 0, color: "#cbd5e1" }}>
              You've chosen to direct <strong style={{ color: "#10b981" }}>{charityPercentage}%</strong> of your monthly contribution to <strong style={{ color: "#10b981" }}>{charityName}</strong>. Thank you!
            </Text>
          </Section>

          <Text style={{ fontSize: "18px", fontWeight: "bold" }}>How it works:</Text>
          <ul style={{ color: "#cbd5e1", lineHeight: "24px" }}>
            <li>Log your Stableford scores after each round.</li>
            <li>Make sure you have at least 5 scores logged by the end of the month.</li>
            <li>If your 5 latest scores match the monthly drawn numbers, you win a share of the prize pool!</li>
          </ul>

          <Section style={{ textAlign: "center", marginTop: "32px" }}>
            <Button 
              href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`}
              style={{ backgroundColor: "#10b981", color: "#ffffff", padding: "12px 24px", borderRadius: "6px", textDecoration: "none", fontWeight: "bold" }}
            >
              Go to Dashboard
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeEmail;
